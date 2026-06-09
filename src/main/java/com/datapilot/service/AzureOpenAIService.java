package com.datapilot.service;

import com.datapilot.config.AzureOpenAIConfig;
import com.datapilot.exception.AgentProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AzureOpenAIService {

    private final ChatModel chatModel;
    private final AzureOpenAIConfig azureConfig;

    @Autowired
    public AzureOpenAIService(@Autowired(required = false) ChatModel chatModel, AzureOpenAIConfig azureConfig) {
        this.chatModel = chatModel;
        this.azureConfig = azureConfig;
    }

    public String generate(String systemInstruction, String userMessage) {
        if (azureConfig.isMockMode() || chatModel == null) {
            log.warn("Azure OpenAI is not configured or mock mode is forced. Bypassing live LLM call.");
            throw new AgentProcessingException("Azure OpenAI is not configured. Enable Mock Mode agents to run local simulations.");
        }

        try {
            log.info("Sending prompt request to Azure OpenAI Chat Endpoint...");
            SystemMessage systemMsg = new SystemMessage(systemInstruction);
            UserMessage userMsg = new UserMessage(userMessage);
            Prompt prompt = new Prompt(List.of(systemMsg, userMsg));
            
            return chatModel.call(prompt).getResult().getOutput().getText();
        } catch (Exception e) {
            log.error("Failed calling Azure OpenAI via Spring AI ChatModel: {}", e.getMessage(), e);
            throw new AgentProcessingException("Error invoking Azure OpenAI agent: " + e.getMessage(), e);
        }
    }
}
