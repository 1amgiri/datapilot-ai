package com.datapilot.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.datapilot.dto.RequirementAnalysisResponse;
import com.datapilot.dto.SchemaResponse;
import com.datapilot.exception.AgentProcessingException;
import com.datapilot.prompt.SchemaPromptBuilder;
import com.datapilot.service.AzureOpenAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component("dataArchitectAgent")
public class DataArchitectAgent implements SchemaAgent {

    private final AzureOpenAIService openAIService;
    private final SchemaPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Autowired
    public DataArchitectAgent(AzureOpenAIService openAIService, SchemaPromptBuilder promptBuilder, ObjectMapper objectMapper) {
        this.openAIService = openAIService;
        this.promptBuilder = promptBuilder;
        this.objectMapper = objectMapper;
    }

    @Override
    public SchemaResponse generateSchema(String requirements, RequirementAnalysisResponse analysis) {
        try {
            log.info("Agent: Data Architect is executing...");
            String analysisJson = objectMapper.writeValueAsString(analysis);
            String systemPrompt = promptBuilder.getSystemPrompt();
            String userPrompt = promptBuilder.getUserPrompt(requirements, analysisJson);

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

            return objectMapper.readValue(jsonResponse, SchemaResponse.class);
        } catch (Exception e) {
            log.error("Agent: Data Architect encountered an error: {}", e.getMessage(), e);
            throw new AgentProcessingException("Data Architect Agent execution failed: " + e.getMessage(), e);
        }
    }
}
