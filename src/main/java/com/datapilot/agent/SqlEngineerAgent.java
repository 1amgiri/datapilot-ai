package com.datapilot.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.SqlResponse;
import com.datapilot.exception.AgentProcessingException;
import com.datapilot.prompt.SqlPromptBuilder;
import com.datapilot.service.AzureOpenAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component("sqlEngineerAgent")
public class SqlEngineerAgent implements SqlAgent {

    private final AzureOpenAIService openAIService;
    private final SqlPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Autowired
    public SqlEngineerAgent(AzureOpenAIService openAIService, SqlPromptBuilder promptBuilder, ObjectMapper objectMapper) {
        this.openAIService = openAIService;
        this.promptBuilder = promptBuilder;
        this.objectMapper = objectMapper;
    }

    @Override
    public SqlResponse generateSql(String requirements, SchemaResponse schema) {
        try {
            log.info("Agent: SQL Engineer is executing...");
            String schemaJson = objectMapper.writeValueAsString(schema);
            String systemPrompt = promptBuilder.getSystemPrompt();
            String userPrompt = promptBuilder.getUserPrompt(requirements, schemaJson);

            String jsonResponse = openAIService.generate(systemPrompt, userPrompt);
            
            // Clean markdown blocks
            if (jsonResponse.contains("```json")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```json") + 7);
                jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            } else if (jsonResponse.contains("```")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```") + 3);
                jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            }
            jsonResponse = jsonResponse.trim();

            return objectMapper.readValue(jsonResponse, SqlResponse.class);
        } catch (Exception e) {
            log.error("Agent: SQL Engineer encountered an error: {}", e.getMessage(), e);
            throw new AgentProcessingException("SQL Engineer Agent execution failed: " + e.getMessage(), e);
        }
    }
}
