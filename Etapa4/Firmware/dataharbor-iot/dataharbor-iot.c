#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"

#include "lwip/ip4_addr.h"
#include "lwip/apps/mdns.h"
#include "lwip/init.h"
#include "lwip/apps/httpd.h"

#include "hardware/adc.h"

#include "hardware/gpio.h"

static float temp_sum = 0.0f;
static int temp_count = 0;
static float temp_avg = 0.0f;

void httpd_init(void);

static absolute_time_t wifi_connected_time;
static bool led_on = false;

/*
mDNS - Multicast DNS.
Característica	            DNS Tradicional             	mDNS

Servidor necessário	        Sim	                            Não
Funcionamento local	        Opcional	                    Sim
Descoberta automática	    Parcial	                        Completa
Uso típico	                Internet	                    LAN / IoT
*/

#if LWIP_MDNS_RESPONDER

static void srv_txt(struct mdns_service *service, void *txt_userdata)
{
    err_t res;
    LWIP_UNUSED_ARG(txt_userdata);

    res = mdns_resp_add_service_txtitem(service, "path=/", 6);
    LWIP_ERROR("mdns add service txt failed\n", (res == ERR_OK), return);
}
#endif

void init_adc_temp_sensor()
{
    adc_init();
    adc_set_temp_sensor_enabled(true);
    sleep_ms(5);
}

static inline float read_chip_temperature_celsius()
{
    adc_select_input(4);
    uint16_t raw = adc_read();
    const float conversion_factor = 3.3f / (1 << 12);
    float voltage = raw * conversion_factor;
    float temp_celsius = 27 - (voltage - 0.706) / 0.001721;
    return temp_celsius;
}

static size_t get_mac_ascii(int idx, size_t chr_off, size_t chr_len, char *dest_in)
{
    static const char hexchr[16] = "0123456789ABCDEF";
    uint8_t mac[6];
    char *dest = dest_in;
    assert(chr_off + chr_len <= (2 * sizeof(mac)));
    cyw43_hal_get_mac(idx, mac);
    for (; chr_len && (chr_off >> 1) < sizeof(mac); ++chr_off, --chr_len)
    {
        *dest++ = hexchr[mac[chr_off >> 1] >> (4 * (1 - (chr_off & 1))) & 0xf];
    }
    return dest - dest_in;
}

static const char *cgi_handler_test(int iIndex, int iNumParams, char *pcParam[], char *pcValue[])
{
    if (iNumParams > 0)
    {
        if (strcmp(pcParam[0], "test") == 0)
        {
            // arquivos do lwIP (em fsdata.c que fica dentro do SDK, na parte do lwIP).
            // precisa compilar tudo de novo para atualizar fsdata.c que serve código já compilado
            // diferente de um sistema de arquivos tradicional que serve de forma interpretativa.
            return "/test.shtml";
        }
    }

    // !parâmetros || parâmetro # "test",
    // o servidor retorna a página padrão "/index.shtml".
    return "/index.shtml";
}

// CGI que trata requisições para o servidor HTTP do lwIP
static tCGI cgi_handlers[] = {
    // if "/" (raiz), o LWIP call cgi_handler_test
    {"/", cgi_handler_test},
    {"/index.shtml", cgi_handler_test},
};

// Inicialização dos handlers
void httpd_user_init(void)
{
    static const tCGI cgis[] = {
        {"/api/status", status_handler},
        {"/api/led", led_handler},
    };

    http_set_cgi_handlers(cgis, 2);
}

/*
para JSON REST fica assim, depois de montada a requisição:
GET http://pico/api/status
{ "status": "ok", "temp": 23.5, "led": "ON" }

GET http://pico/api/led
{ "action": "led_toggle", "led": "OFF" }
*/


// número de caracteres escritos no buffer.
u16_t ssi_example_ssi_handler(int iIndex, char *pcInsert, int iInsertLen
#if LWIP_HTTPD_SSI_MULTIPART
                              ,
                              uint16_t current_tag_part, uint16_t *next_tag_part
#endif
)
{
    size_t printed;

    switch (iIndex)
    {
    case 0:
    {
        // Mostra a temperatura média calculada
        printed = snprintf(pcInsert, iInsertLen, "%.2f &deg;C", temp_avg);
        break;
    }
    case 1:
    {
        printed = snprintf(pcInsert, iInsertLen, "Welcome! - V 1.0.0");
        break;
    }
    case 2:
    {
        uint64_t uptime_s = absolute_time_diff_us(wifi_connected_time, get_absolute_time()) / 1e6;
        printed = snprintf(pcInsert, iInsertLen, "%" PRIu64, uptime_s);
        break;
    }
    case 3:
    {
        printed = snprintf(pcInsert, iInsertLen, "%s", led_on ? "ON" : "OFF");
        break;
    }
    case 4:
    {
        printed = snprintf(pcInsert, iInsertLen, "%s", led_on ? "OFF" : "ON");
        break;
    }

#if LWIP_HTTPD_SSI_MULTIPART
    case 5:
    {
        float temp = read_chip_temperature_celsius();

        printed = snprintf(pcInsert, iInsertLen,
                           "<tr><td>Reading Temperature %d</td><td>%.1f &deg;C</td></tr>",
                           current_tag_part + 1, temp);

        temp_sum += temp;
        temp_count++;

        if (current_tag_part == 9)
        {
            temp_avg = temp_sum / temp_count;
            temp_sum = 0.0f; // zera acumuladores
            temp_count = 0;
        }

        if (current_tag_part < 9)
        {
            *next_tag_part = current_tag_part + 1;
        }
        break;
    }
#endif

    default: // identifica tag desconhecida
    {
        printed = 0;
        break;
    }
    }

    return (u16_t)printed; // qtd caracteres foram escritos
}

static const char *ssi_tags[] = {
    "status",
    "welcome",
    "uptime",
    "ledstate",
    "ledinv",
    "table",
};

#if LWIP_HTTPD_SUPPORT_POST

#define LED_STATE_BUFSIZE 4

typedef struct conn_node
{
    void *conn;
    int pin;
    struct conn_node *next;
} conn_node_t;

static conn_node_t *conn_list = NULL;

static void add_connection(void *connection, int pin)
{
    conn_node_t *node = (conn_node_t *)mem_malloc(sizeof(conn_node_t));
    if (!node)
        return;
    node->conn = connection;
    node->pin = pin;
    node->next = conn_list;
    conn_list = node;
}

static void remove_connection(void *connection)
{
    conn_node_t **pp = &conn_list;
    while (*pp)
    {
        if ((*pp)->conn == connection)
        {
            conn_node_t *tmp = *pp;
            *pp = (*pp)->next;
            mem_free(tmp);
            return;
        }
        pp = &(*pp)->next;
    }
}

// conexão
static conn_node_t *find_connection(void *connection)
{
    conn_node_t *p = conn_list;
    while (p)
    {
        if (p->conn == connection)
            return p;
        p = p->next;
    }
    return NULL;
}

err_t httpd_post_begin(void *connection, const char *uri, const char *http_request,
                       u16_t http_request_len, int content_len, char *response_uri,
                       u16_t response_uri_len, u8_t *post_auto_wnd)
{
    conn_node_t *node = find_connection(connection);

    if (node)
    {
        return ERR_INPROGRESS;
    }
    else
    {
        snprintf(response_uri, response_uri_len, "/ledfail.shtml");

        if (strncmp(uri, "/led", 4) == 0)
        {
            int pin = atoi(uri + 4);
            add_connection(connection, pin);
        }

        *post_auto_wnd = 1;

        return ERR_OK;
    }

    return ERR_VAL;
}

char *httpd_param_value(struct pbuf *p, const char *param_name, char *value_buf, size_t value_buf_len)
{

    size_t param_len = strlen(param_name); // tamanho do nome do parâmetro (ex: "led_state=" = 10)

    u16_t param_pos = pbuf_memfind(p, param_name, param_len, 0);

    if (param_pos != 0xFFFF) // se encontrou o parâmetro
    {

        u16_t param_value_pos = param_pos + param_len;

        u16_t param_value_len = 0; // vai armazenar o tamanho do valor do parâmetro
        u16_t tmp = pbuf_memfind(p, "&", 1, param_value_pos);

        if (tmp != 0xFFFF)
        {
            // Se encontrou '&', o valor vai até antes dele
            param_value_len = tmp - param_value_pos;
        }
        else
        {
            param_value_len = p->tot_len - param_value_pos;
        }

        // Verifica se o valor é válido e cabe no buffer fornecido
        if (param_value_len > 0 && param_value_len < value_buf_len)
        {
            char *result = (char *)pbuf_get_contiguous(p, value_buf, value_buf_len, param_value_len, param_value_pos);

            if (result)
            {
                // Adiciona terminador nulo para formar uma string C válida
                result[param_value_len] = 0;

                return result; // retorna ponteiro para o valor
            }
        }
    }

    // Se não encontrou ou deu erro, retorna NULL
    return NULL;
}

// Se o parâmetro "led_state" não for encontrado, também retorna ERR_VAL.
err_t httpd_post_receive_data(void *connection, struct pbuf *p)
{
    // Inicialmente define o retorno como erro de parâmetro inválido
    err_t ret = ERR_VAL;

    // Garante que o ponteiro recebido (pbuf) não é nulo
    LWIP_ASSERT("NULL pbuf", p != NULL);

    conn_node_t *node = find_connection(connection);
    // chegado enquanto processávamos o POST
    if (!node)
    {
        return ERR_VAL; // conexão inválida
    }
    else
    {
        // Cria um buffer para armazenar o valor do parâmetro recebido
        char buf[LED_STATE_BUFSIZE];
        o char *val = httpd_param_value(p, "led_state=", buf, sizeof(buf));
        // Se o parâmetro foi encontrado e não é nulo
        if (val)
        {
            led_on = (strcmp(val, "ON") == 0);
            cyw43_gpio_set(&cyw43_state, node->pin, led_on);

            if (node->pin == 1)
            {
                // o 15, também controla o LED embutido do Pico W
                cyw43_gpio_set(&cyw43_state, 0, led_on);
            }

            ret = ERR_OK;
        }
    }

    // Libera a memória usada pelo pacote de dados (pbuf)
    pbuf_free(p);

    // Retorna sucesso ou erro
    return ret;
}

void httpd_post_finished(void *connection, char *response_uri, u16_t response_uri_len)
{

    snprintf(response_uri, response_uri_len, "/ledfail.shtml");

    conn_node_t *node = find_connection(connection);

    if (!node)
    {
        return; // conexão inválida
    }
    else
    {
        snprintf(response_uri, response_uri_len, "/led%d.shtml", node->pin);
    }

    // libera conexão da lista
    remove_connection(connection);
}

const char *led0_handler(int state)
{
    static char response[128];
    snprintf(response, sizeof(response),
             "{\"led\": \"GPIO25\", \"state\": \"%s\", \"success\": true}",
             state ? "on" : "off");
    return response;
}

static void send_json(struct tcp_pcb *pcb, const char *json)
{
    const char *header =
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n"
        "Connection: close\r\n\r\n";

    tcp_write(pcb, header, strlen(header), TCP_WRITE_FLAG_COPY);
    tcp_write(pcb, json, strlen(json), TCP_WRITE_FLAG_COPY);
    tcp_output(pcb);
}

// Handler para /api/status
static const char *status_handler(int iIndex, int iNumParams, char *pcParam[], char *pcValue[])
{
    struct tcp_pcb *pcb = (struct tcp_pcb *)pcParam;

    // aqui você pega dados reais do Pico (temperatura, estado do LED, etc.)
    float temperatura = 23.7;
    int led_on = 1;

    char buffer[128];
    snprintf(buffer, sizeof(buffer),
             "{ \"status\": \"ok\", \"temp\": %.2f, \"led\": \"%s\" }",
             temperatura,
             led_on ? "ON" : "OFF");

    send_json(pcb, buffer);
    return NULL; // não procura arquivo em fsdata.c
}

// Handler para /api/led
static const char *led_handler(int iIndex, int iNumParams, char *pcParam[], char *pcValue[])
{
    struct tcp_pcb *pcb = (struct tcp_pcb *)pcParam;

    // aqui você poderia mudar o estado real do LED
    char buffer[64];
    snprintf(buffer, sizeof(buffer),
             "{ \"action\": \"led_toggle\", \"led\": \"%s\" }",
             "OFF");

    send_json(pcb, buffer);
    return NULL;
}

#endif

int main()
{
    stdio_init_all();
    //    leds_init();
    init_adc_temp_sensor();

    if (cyw43_arch_init())
    {
        printf("failed to initialise\n");
        return 1; // falhar na conexão
    }

    // STA do Wi-Fi
    cyw43_arch_enable_sta_mode();

    // 4 caracteres do end MAC
    char hostname[sizeof(CYW43_HOST_NAME) + 4];
    memcpy(&hostname[0], CYW43_HOST_NAME, sizeof(CYW43_HOST_NAME) - 1);
    get_mac_ascii(CYW43_HAL_MAC_WLAN0, 8, 4, &hostname[sizeof(CYW43_HOST_NAME) - 1]);
    hostname[sizeof(hostname) - 1] = '\0';
    netif_set_hostname(&cyw43_state.netif[CYW43_ITF_STA], hostname);

    // Conecta Wi-Fi
    printf("Connecting to WiFi...\n");
    if (cyw43_arch_wifi_connect_timeout_ms(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 30000))
    {
        printf("failed to connect.\n");
        exit(1);
    }
    else
    {
        printf("Connected.\n");
    }

    // debug e diagnóstico do dispositivo
    printf("\nReady, running httpd at %s\n", ip4addr_ntoa(netif_ip4_addr(netif_list)));

    // tempo de conexão para uso com uptime
    wifi_connected_time = get_absolute_time();

#if LWIP_MDNS_RESPONDER
    // mDNS para descobrir o dispositivos
    cyw43_arch_lwip_begin();
    mdns_resp_init();
    printf("mdns host name %s.local\n", hostname);
#if LWIP_VERSION_MAJOR >= 2 && LWIP_VERSION_MINOR >= 2

    mdns_resp_add_netif(&cyw43_state.netif[CYW43_ITF_STA], hostname);
    mdns_resp_add_service(&cyw43_state.netif[CYW43_ITF_STA], "pico_httpd", "_http", DNSSD_PROTO_TCP, 80, srv_txt, NULL);
#else

    mdns_resp_add_netif(&cyw43_state.netif[CYW43_ITF_STA], hostname, 60);
    mdns_resp_add_service(&cyw43_state.netif[CYW43_ITF_STA], "pico_httpd", "_http", DNSSD_PROTO_TCP, 80, 60, srv_txt, NULL);
#endif
    cyw43_arch_lwip_end();
#endif
    // Inicializa o servidor HTTP
    cyw43_arch_lwip_begin();
    httpd_init();

    // handlers CGI
    http_set_cgi_handlers(cgi_handlers, LWIP_ARRAYSIZE(cgi_handlers));

    http_set_ssi_handler(ssi_example_ssi_handler, ssi_tags, LWIP_ARRAYSIZE(ssi_tags));

    cyw43_arch_lwip_end();

    while (true)
    {
#if PICO_CYW43_ARCH_POLL
        // driver Wi-Fi em modo polling
        cyw43_arch_poll();
        cyw43_arch_wait_for_work_until(led_time);
#else
        sleep_ms(1000); // se não usar polling, espera 1 segundo
#endif
    }

#if LWIP_MDNS_RESPONDER
    // Remove mDNS
    mdns_resp_remove_netif(&cyw43_state.netif[CYW43_ITF_STA]);
#endif

    // aborta do Wi-Fi
    cyw43_arch_deinit();
}