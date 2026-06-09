package com.datapilot.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.datapilot.dto.RequirementAnalysisResponse;
import com.datapilot.exception.AgentProcessingException;
import com.datapilot.prompt.RequirementPromptBuilder;
import com.datapilot.service.AzureOpenAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component("requirementAnalystAgent")
public class RequirementAnalystAgent implements RequirementAgent {

    private final AzureOpenAIService openAIService;
    private final RequirementPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Autowired
    public RequirementAnalystAgent(AzureOpenAIService openAIService, RequirementPromptBuilder promptBuilder, ObjectMapper objectMapper) {
        this.openAIService = openAIService;
        this.promptBuilder = promptBuilder;
        this.objectMapper = objectMapper;
    }

    @Override
    public RequirementAnalysisResponse analyze(String requirements) {
        try {
            log.info("Agent: Requirement Analyst is executing...");
            String systemPrompt = promptBuilder.getSystemPrompt();
            String userPrompt = promptBuilder.getUserPrompt(requirements);

            String jsonResponse = openAIService.generate(systemPrompt, userPrompt);
            
            // Clean markdown blocks if LLM accidentally outputs them
            if (jsonResponse.contains("```json")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```json") + 7);
                jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            } else if (jsonResponse.contains("```")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```") + 3);
                jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            }
            jsonResponse = jsonResponse.trim();

            return objectMapper.readValue(jsonResponse, RequirementAnalysisResponse.class);
        } catch (Exception e) {
            log.error("Agent: Requirement Analyst encountered an error: {}", e.getMessage(), e);
            throw new AgentProcessingException("Requirement Analyst Agent execution failed: " + e.getMessage(), e);
        }
    }
}
