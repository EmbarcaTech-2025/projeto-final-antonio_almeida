package com.api.springsuperheroes;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.web.client.RestTemplate;
import static org.assertj.core.api.Assertions.assertThat;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApplicationTests {

    // @Autowired
    // private MockMvc mvc;

    // @Test
    // @WithUserDetails(value = "antonioalmeida@alunos.utfpr.edu.br",
    // userDetailsServiceBeanName = "authorizationService")
    // void whenUserAccessUserSecuredEndpoint_thenOk() throws Exception {
    // String username = "antonioalmeida@alunos.utfpr.edu.br";
    // String password = "Maria5943@"; // Substitua com a senha correta

    // mvc.perform(post("/login")
    // .param("username", username)
    // .param("password", password))
    // .andExpect(status().isOk())
    // .andReturn();
    // }

    @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
    class LedIntegrationTest {

        private final RestTemplate restTemplate = new RestTemplate();

        @Test
        void shouldGetLedStatusFromFirmware() {
            // URL do firmware
            String url = "http://192.168.0.164/led.cgi";

            String response = restTemplate.getForObject(url, String.class);

            // valida se retornou algo (pode ser JSON simples {"led":"on"})
            assertThat(response).isNotNull();
            assertThat(response).contains("led");
        }
    }    
}

public class LedResponse {
    private String led;

    public String getLed() {
        return led;
    }

    public void setLed(String led) {
        this.led = led;
    }
}
