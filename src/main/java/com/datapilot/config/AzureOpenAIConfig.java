package com.datapilot.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class AzureOpenAIConfig {

    @Value("${spring.ai.azure.openai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.azure.openai.endpoint:}")
    private String endpoint;

    @Value("${datapilot.mock-mode:true}")
    private boolean mockModeConfigured;

    /**
     * Determine if we should run in Mock mode.
     * We run in mock mode if datapilot.mock-mode is explicitly set to true OR
     * if the Azure OpenAI credentials are not provided.
     */
    public boolean isMockMode() {
        return mockModeConfigured || apiKey == null || apiKey.trim().isEmpty() || endpoint == null || endpoint.trim().isEmpty();
    }
}
