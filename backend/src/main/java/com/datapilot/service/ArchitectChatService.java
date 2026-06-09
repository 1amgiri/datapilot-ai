package com.datapilot.service;

import com.datapilot.config.AzureOpenAIConfig;
import com.datapilot.dto.ChatRequest;
import com.datapilot.dto.ChatResponse;
import com.datapilot.entity.ChatHistory;
import com.datapilot.entity.Project;
import com.datapilot.repository.ChatHistoryRepository;
import com.datapilot.repository.ProjectRepository;
import com.datapilot.model.Reasoning;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class ArchitectChatService {

    private final AzureOpenAIConfig openaiConfig;
    private final AzureOpenAIService openAIService;
    private final ChatHistoryRepository chatHistoryRepository;
    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public ArchitectChatService(AzureOpenAIConfig openaiConfig, AzureOpenAIService openAIService,
                                ChatHistoryRepository chatHistoryRepository, ProjectRepository projectRepository,
                                ObjectMapper objectMapper) {
        this.openaiConfig = openaiConfig;
        this.openAIService = openAIService;
        this.chatHistoryRepository = chatHistoryRepository;
        this.projectRepository = projectRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ChatResponse chat(ChatRequest request) {
        String question = request.getQuestion();
        String context = request.getContextJson() != null ? request.getContextJson() : "";
        
        Project project = null;
        if (request.getProjectId() != null) {
            Optional<Project> projOpt = projectRepository.findById(request.getProjectId());
            if (projOpt.isPresent()) {
                project = projOpt.get();
                if (context.isEmpty()) {
                    context = "Project Requirements: " + project.getRequirements();
                }
            }
        }

        ChatResponse response;
        if (openaiConfig.isMockMode()) {
            response = getMockChatResponse(question);
        } else {
            response = getLiveChatResponse(question, context);
        }

        // Persist Chat History
        try {
            ChatHistory history = ChatHistory.builder()
                    .project(project)
                    .question(question)
                    .answer(response.getAnswer())
                    .reasoningJson(objectMapper.writeValueAsString(response.getReasoning()))
                    .build();
            chatHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to save chat history record: {}", e.getMessage(), e);
        }

        return response;
    }

    private ChatResponse getMockChatResponse(String question) {
        String qLower = question.toLowerCase();
        String answer;
        String decisionText;
        String reasoningText;

        if (qLower.contains("mysql")) {
            answer = "MySQL is recommended because the workload requires transactional consistency (ACID properties), complex relational table joins (such as joining dimension tables to fact logs), and sub-query indexing options. It serves as an optimal source for Fabric's Medallion staging.";
            decisionText = "MySQL selected for core relational store.";
            reasoningText = "Matches the transactional reliability required for analytical query sources.";
        } else if (qLower.contains("mongodb") || qLower.contains("nosql")) {
            answer = "MongoDB is an alternative, but it is not recommended for this specific workload. Since the business goals require structured aggregations, multi-table joins, and cohort analysis (which heavily rely on relational algebra), a structured SQL database prevents application-level sorting overhead.";
            decisionText = "Relational SQL selected over Document NoSQL.";
            reasoningText = "Avoids complex denormalization updates and custom JavaScript map-reduce functions in MongoDB.";
        } else if (qLower.contains("scale") || qLower.contains("performance")) {
            answer = "The architecture scales in two layers: 1. MySQL transactional indexing handles operational writes. 2. Analytical workloads are offloaded to Microsoft Fabric Lakehouse (Delta Parquet in OneLake) which separates compute from storage, allowing parallel serverless querying of millions of rows.";
            decisionText = "Hybrid transactional-analytical staging.";
            reasoningText = "Separates volatile operational queries from analytical query scans.";
        } else {
            answer = "The suggested data architecture follows a Star Schema topology. The dimension tables (e.g. dim_customers, dim_locations) isolate master profile data, while the central fact table records transaction metrics, enabling DirectLake semantic models to query data instantly.";
            decisionText = "Star Schema dimensional model selected.";
            reasoningText = "Guarantees low join-depth and high caching ratios inside Power BI/Fabric endpoints.";
        }

        Reasoning reasoning = Reasoning.builder()
                .decision(decisionText)
                .reasoning(reasoningText)
                .assumptions(List.of("Queries target structured database fields", "Tenant workloads scale independently"))
                .alternatives(List.of("MongoDB", "Direct flat wide CSV tables"))
                .confidenceScore(97)
                .build();

        return ChatResponse.builder()
                .answer(answer)
                .reasoning(reasoning)
                .build();
    }

    private ChatResponse getLiveChatResponse(String question, String context) {
        String systemInstruction = """
            You are a Principal Java Architect, Spring Boot Expert, Azure AI Engineer, and Microsoft Fabric specialist.
            Answer the user's architectural question concerning the generated project artifacts.
            
            Every response must contain:
            1. answer: A clear, expert paragraph explaining the decision.
            2. reasoning: A structured reasoning block containing:
               - decision: The core design answer.
               - reasoning: The technical rationale.
               - assumptions: Assumptions made to answer.
               - alternatives: Alternative configurations considered.
               - confidenceScore: Confidence score from 1 to 100.
            
            Format your entire response as a single, valid JSON object matching this schema exactly. Do not wrap in markdown ```json blocks, return only the JSON content.
            
            Schema:
            {
              "answer": "string",
              "reasoning": {
                "decision": "string",
                "reasoning": "string",
                "assumptions": ["string"],
                "alternatives": ["string"],
                "confidenceScore": 95
              }
            }
            """;

        String userMsg = String.format("Context:\n%s\n\nQuestion: %s", context, question);
        
        try {
            String jsonResponse = openAIService.generate(systemInstruction, userMsg);
            
            if (jsonResponse.contains("```json")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```json") + 7);
                jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            } else if (jsonResponse.contains("```")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```") + 3);
                jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            }
            jsonResponse = jsonResponse.trim();

            return objectMapper.readValue(jsonResponse, ChatResponse.class);
        } catch (Exception e) {
            log.error("Failed to generate chat response: {}", e.getMessage(), e);
            
            // Inline fallback in case LLM fails
            return getMockChatResponse(question);
        }
    }
}
