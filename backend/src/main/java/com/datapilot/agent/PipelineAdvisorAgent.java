package com.datapilot.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.PipelineResponse;
import com.datapilot.exception.AgentProcessingException;
import com.datapilot.prompt.PipelinePromptBuilder;
import com.datapilot.service.AzureOpenAIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component("pipelineAdvisorAgent")
public class PipelineAdvisorAgent implements PipelineAgent {

    private final AzureOpenAIService openAIService;
    private final PipelinePromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Autowired
    public PipelineAdvisorAgent(AzureOpenAIService openAIService, PipelinePromptBuilder promptBuilder, ObjectMapper objectMapper) {
        this.openAIService = openAIService;
        this.promptBuilder = promptBuilder;
        this.objectMapper = objectMapper;
    }

    @Override
    public PipelineResponse generatePipeline(String requirements, SchemaResponse schema) {
        try {
            log.info("Agent: Pipeline Advisor is executing...");
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

            return objectMapper.readValue(jsonResponse, PipelineResponse.class);
        } catch (Exception e) {
            log.error("Agent: Pipeline Advisor encountered an error: {}", e.getMessage(), e);
            throw new AgentProcessingException("Pipeline Advisor Agent execution failed: " + e.getMessage(), e);
        }
    }
}
