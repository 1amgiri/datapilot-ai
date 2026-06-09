package com.datapilot.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DataPilot AI Backend Service")
                        .version("1.0.0")
                        .description("Production-quality multi-agent reasoning orchestrator that transforms natural language business requirements into data architectures, normalized SQL schemas, and Microsoft Fabric pipeline templates.")
                        .contact(new Contact()
                                .name("DataPilot AI Engineering Team")
                                .email("support@datapilot.ai")));
    }
}
