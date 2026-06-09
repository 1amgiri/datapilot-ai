package com.datapilot.controller;

import com.datapilot.dto.*;
import com.datapilot.entity.Project;
import com.datapilot.service.AgentOrchestratorService;
import com.datapilot.service.ArchitectChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@Tag(name = "DataPilot AI Multi-Agent API", description = "Endpoints for multi-agent reasoning, data architecture design, SQL generation, and ETL pipeline designs.")
public class AgentController {

    private final AgentOrchestratorService orchestratorService;
    private final ArchitectChatService chatService;

    @Autowired
    public AgentController(AgentOrchestratorService orchestratorService, ArchitectChatService chatService) {
        this.orchestratorService = orchestratorService;
        this.chatService = chatService;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Step 1: Requirement Analyst Agent", description = "Analyzes business goals, extracts entities, metrics, constraints, and reasoning based on natural language requirements.")
    @ApiResponse(responseCode = "200", description = "Requirements analyzed successfully",
            content = @Content(schema = @Schema(implementation = RequirementAnalysisResponse.class)))
    public ResponseEntity<RequirementAnalysisResponse> analyze(@Valid @RequestBody AnalysisRequest request) {
        // Create transient/temp project for step-by-step API requests
        Project project = Project.builder()
                .name("Temp_Project")
                .requirements(request.getRequirements())
                .build();
        RequirementAnalysisResponse response = orchestratorService.runRequirementsAnalysis(request.getRequirements(), project);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/schema")
    @Operation(summary = "Step 2: Data Architect Agent", description = "Generates a normalized relational database schema (DDL tables and relationships) from requirements and requirements analysis.")
    @ApiResponse(responseCode = "200", description = "Schema designed successfully",
            content = @Content(schema = @Schema(implementation = SchemaResponse.class)))
    public ResponseEntity<SchemaResponse> generateSchema(@Valid @RequestBody SchemaRequest request) {
        Project project = Project.builder()
                .name("Temp_Project")
                .requirements(request.getRequirements())
                .build();
        SchemaResponse response = orchestratorService.runSchemaGeneration(request.getRequirements(), request.getAnalysis(), project);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sql")
    @Operation(summary = "Step 3: SQL Engineer Agent", description = "Generates aggregated and optimized analytical SQL queries based on database schema definitions.")
    @ApiResponse(responseCode = "200", description = "SQL queries generated successfully",
            content = @Content(schema = @Schema(implementation = SqlResponse.class)))
    public ResponseEntity<SqlResponse> generateSql(@Valid @RequestBody SqlRequest request) {
        Project project = Project.builder()
                .name("Temp_Project")
                .requirements(request.getRequirements())
                .build();
        SqlResponse response = orchestratorService.runSqlGeneration(request.getRequirements(), request.getSchema(), project);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/pipeline")
    @Operation(summary = "Step 4: Pipeline Advisor Agent", description = "Designs ETL steps, Lakehouse layouts, and Microsoft Fabric components based on database schema definitions.")
    @ApiResponse(responseCode = "200", description = "Pipeline layout suggested successfully",
            content = @Content(schema = @Schema(implementation = PipelineResponse.class)))
    public ResponseEntity<PipelineResponse> generatePipeline(@Valid @RequestBody PipelineRequest request) {
        Project project = Project.builder()
                .name("Temp_Project")
                .requirements(request.getRequirements())
                .build();
        PipelineResponse response = orchestratorService.runPipelineGeneration(request.getRequirements(), request.getSchema(), project);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/full-analysis")
    @Operation(summary = "Full Orchestration Workflow", description = "Runs all 4 agents sequentially (Analyst -> Architect -> SQL -> Pipeline), persists data in PostgreSQL and aggregates outputs.")
    @ApiResponse(responseCode = "200", description = "Full analysis executed and aggregated successfully",
            content = @Content(schema = @Schema(implementation = FullAnalysisResponse.class)))
    public ResponseEntity<FullAnalysisResponse> fullAnalysis(@Valid @RequestBody AnalysisRequest request) {
        FullAnalysisResponse response = orchestratorService.runFullOrchestration(request.getRequirements());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/demo")
    @Operation(summary = "Demo Sandbox Mode", description = "Convenience endpoint to simulate or run a full agent reasoning pipeline instantly for retail/demo analytics.")
    @ApiResponse(responseCode = "200", description = "Demo workflow generated successfully",
            content = @Content(schema = @Schema(implementation = FullAnalysisResponse.class)))
    public ResponseEntity<FullAnalysisResponse> demo(@Valid @RequestBody AnalysisRequest request) {
        FullAnalysisResponse response = orchestratorService.runFullOrchestration(request.getRequirements());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    @Operation(summary = "Architect Chat Copilot", description = "Answers architectural and design questions contextually based on generated project artifacts.")
    @ApiResponse(responseCode = "200", description = "Chat response generated successfully",
            content = @Content(schema = @Schema(implementation = ChatResponse.class)))
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.chat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Service Health Check", description = "Returns the current state and status of the service.")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", System.currentTimeMillis());
        healthInfo.put("service", "DataPilot AI Backend Service");
        healthInfo.put("version", "1.0.0-MVP");
        return ResponseEntity.ok(healthInfo);
    }
}
