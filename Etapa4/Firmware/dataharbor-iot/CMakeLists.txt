set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} ${CMAKE_CURRENT_LIST_DIR})
project(dataharbor-iot)

add_executable(${PROJECT_NAME}
        dataharbor-iot.c
        )
target_compile_definitions(${PROJECT_NAME} PRIVATE
        WIFI_SSID=\"${WIFI_SSID}\"
        WIFI_PASSWORD=\"${WIFI_PASSWORD}\"
        )
target_include_directories(${PROJECT_NAME} PRIVATE
        ${CMAKE_CURRENT_LIST_DIR}
        ${CMAKE_CURRENT_LIST_DIR}/.. 
        ${PICO_LWIP_CONTRIB_PATH}/apps/httpd
        )
target_link_libraries(${PROJECT_NAME} PRIVATE
        pico_cyw43_arch_lwip_threadsafe_background
        pico_lwip_http
        pico_lwip_mdns
        pico_httpd_content_ac
        pico_stdlib
        hardware_adc
        )
pico_add_extra_outputs(${PROJECT_NAME})

pico_add_library(pico_httpd_content_ac NOFLAG)                  
pico_set_lwip_httpd_content(pico_httpd_content_ac INTERFACE     
        ${CMAKE_CURRENT_LIST_DIR}/content/404.html
        ${CMAKE_CURRENT_LIST_DIR}/content/index.shtml
        ${CMAKE_CURRENT_LIST_DIR}/content/test.shtml
        ${CMAKE_CURRENT_LIST_DIR}/content/led1.shtml
        ${CMAKE_CURRENT_LIST_DIR}/content/led0.shtml
        ${CMAKE_CURRENT_LIST_DIR}/content/ledfail.shtml
        ${CMAKE_CURRENT_LIST_DIR}/content/img/sing.png
        )

pico_add_extra_outputs(${PROJECT_NAME})

# Habilita USB e desabilita UART
pico_enable_stdio_usb(${PROJECT_NAME} 1)
pico_enable_stdio_uart(${PROJECT_NAME} 0)        