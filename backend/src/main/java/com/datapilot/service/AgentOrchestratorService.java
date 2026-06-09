package com.datapilot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.datapilot.config.AzureOpenAIConfig;
import com.datapilot.agent.RequirementAgent;
import com.datapilot.agent.SchemaAgent;
import com.datapilot.agent.SqlAgent;
import com.datapilot.agent.PipelineAgent;
import com.datapilot.dto.*;
import com.datapilot.entity.*;
import com.datapilot.repository.*;
import com.datapilot.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class AgentOrchestratorService {

    private final AzureOpenAIConfig openaiConfig;
    private final ObjectMapper objectMapper;

    // Repositories
    private final ProjectRepository projectRepository;
    private final AnalysisHistoryRepository analysisHistoryRepository;
    private final GeneratedSchemaRepository generatedSchemaRepository;
    private final GeneratedSqlRepository generatedSqlRepository;
    private final GeneratedPipelineRepository generatedPipelineRepository;

    // Agents
    private final RequirementAgent realRequirementAgent;
    private final RequirementAgent mockRequirementAgent;
    private final SchemaAgent realSchemaAgent;
    private final SchemaAgent mockSchemaAgent;
    private final SqlAgent realSqlAgent;
    private final SqlAgent mockSqlAgent;
    private final PipelineAgent realPipelineAgent;
    private final PipelineAgent mockPipelineAgent;

    @Autowired
    public AgentOrchestratorService(
            AzureOpenAIConfig openaiConfig,
            ObjectMapper objectMapper,
            ProjectRepository projectRepository,
            AnalysisHistoryRepository analysisHistoryRepository,
            GeneratedSchemaRepository generatedSchemaRepository,
            GeneratedSqlRepository generatedSqlRepository,
            GeneratedPipelineRepository generatedPipelineRepository,
            @Qualifier("requirementAnalystAgent") RequirementAgent realRequirementAgent,
            @Qualifier("mockRequirementAgent") RequirementAgent mockRequirementAgent,
            @Qualifier("dataArchitectAgent") SchemaAgent realSchemaAgent,
            @Qualifier("mockSchemaAgent") SchemaAgent mockSchemaAgent,
            @Qualifier("sqlEngineerAgent") SqlAgent realSqlAgent,
            @Qualifier("mockSqlAgent") SqlAgent mockSqlAgent,
            @Qualifier("pipelineAdvisorAgent") PipelineAgent realPipelineAgent,
            @Qualifier("mockPipelineAgent") PipelineAgent mockPipelineAgent) {
        
        this.openaiConfig = openaiConfig;
        this.objectMapper = objectMapper;
        this.projectRepository = projectRepository;
        this.analysisHistoryRepository = analysisHistoryRepository;
        this.generatedSchemaRepository = generatedSchemaRepository;
        this.generatedSqlRepository = generatedSqlRepository;
        this.generatedPipelineRepository = generatedPipelineRepository;
        
        this.realRequirementAgent = realRequirementAgent;
        this.mockRequirementAgent = mockRequirementAgent;
        this.realSchemaAgent = realSchemaAgent;
        this.mockSchemaAgent = mockSchemaAgent;
        this.realSqlAgent = realSqlAgent;
        this.mockSqlAgent = mockSqlAgent;
        this.realPipelineAgent = realPipelineAgent;
        this.mockPipelineAgent = mockPipelineAgent;
    }

    private RequirementAgent getRequirementAgent() {
        return openaiConfig.isMockMode() ? mockRequirementAgent : realRequirementAgent;
    }

    private SchemaAgent getSchemaAgent() {
        return openaiConfig.isMockMode() ? mockSchemaAgent : realSchemaAgent;
    }

    private SqlAgent getSqlAgent() {
        return openaiConfig.isMockMode() ? mockSqlAgent : realSqlAgent;
    }

    private PipelineAgent getPipelineAgent() {
        return openaiConfig.isMockMode() ? mockPipelineAgent : realPipelineAgent;
    }

    @Transactional
    public RequirementAnalysisResponse runRequirementsAnalysis(String requirements, Project project) {
        RequirementAnalysisResponse response = getRequirementAgent().analyze(requirements);
        
        try {
            AnalysisHistory history = AnalysisHistory.builder()
                    .project(project)
                    .businessGoalsJson(objectMapper.writeValueAsString(response.getBusinessGoals()))
                    .entitiesJson(objectMapper.writeValueAsString(response.getEntities()))
                    .metricsJson(objectMapper.writeValueAsString(response.getMetrics()))
                    .constraintsJson(objectMapper.writeValueAsString(response.getConstraints()))
                    .reasoningJson(objectMapper.writeValueAsString(response.getReasoning()))
                    .build();
            analysisHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to persist requirements analysis record: {}", e.getMessage(), e);
        }
        
        return response;
    }

    @Transactional
    public SchemaResponse runSchemaGeneration(String requirements, RequirementAnalysisResponse analysis, Project project) {
        SchemaResponse response = getSchemaAgent().generateSchema(requirements, analysis);

        try {
            GeneratedSchema schemaEntity = GeneratedSchema.builder()
                    .project(project)
                    .tablesJson(objectMapper.writeValueAsString(response.getTables()))
                    .relationshipsJson(objectMapper.writeValueAsString(response.getRelationships()))
                    .reasoningJson(objectMapper.writeValueAsString(response.getReasoning()))
                    .build();
            generatedSchemaRepository.save(schemaEntity);
        } catch (Exception e) {
            log.error("Failed to persist generated schema record: {}", e.getMessage(), e);
        }

        return response;
    }

    @Transactional
    public SqlResponse runSqlGeneration(String requirements, SchemaResponse schema, Project project) {
        SqlResponse response = getSqlAgent().generateSql(requirements, schema);

        try {
            GeneratedSql sqlEntity = GeneratedSql.builder()
                    .project(project)
                    .queriesJson(objectMapper.writeValueAsString(response.getQueries()))
                    .analyticsQueriesJson(objectMapper.writeValueAsString(response.getAnalyticsQueries()))
                    .reasoningJson(objectMapper.writeValueAsString(response.getReasoning()))
                    .build();
            generatedSqlRepository.save(sqlEntity);
        } catch (Exception e) {
            log.error("Failed to persist generated SQL record: {}", e.getMessage(), e);
        }

        return response;
    }

    @Transactional
    public PipelineResponse runPipelineGeneration(String requirements, SchemaResponse schema, Project project) {
        PipelineResponse response = getPipelineAgent().generatePipeline(requirements, schema);

        try {
            GeneratedPipeline pipelineEntity = GeneratedPipeline.builder()
                    .project(project)
                    .etlStepsJson(objectMapper.writeValueAsString(response.getEtlSteps()))
                    .dataWarehouseDesignJson(objectMapper.writeValueAsString(response.getDataWarehouseDesign()))
                    .fabricRecommendationJson(objectMapper.writeValueAsString(response.getFabricRecommendation()))
                    .reasoningJson(objectMapper.writeValueAsString(response.getReasoning()))
                    .build();
            generatedPipelineRepository.save(pipelineEntity);
        } catch (Exception e) {
            log.error("Failed to persist generated pipeline record: {}", e.getMessage(), e);
        }

        return response;
    }

    @Transactional
    public FullAnalysisResponse runFullOrchestration(String requirements) {
        log.info("Starting Full Multi-Agent Orchestration workflow...");

        // 1. Create and save Project
        String projectName = "Project_" + System.currentTimeMillis();
        Project project = Project.builder()
                .name(projectName)
                .description("DataPilot generated analytics architecture for user request.")
                .requirements(requirements)
                .build();
        project = projectRepository.save(project);

        // 2. Analyst Agent
        RequirementAnalysisResponse analysis = runRequirementsAnalysis(requirements, project);

        // 3. Schema Agent
        SchemaResponse schema = runSchemaGeneration(requirements, analysis, project);

        // 4. SQL Agent
        SqlResponse sql = runSqlGeneration(requirements, schema, project);

        // 5. Pipeline Agent
        PipelineResponse pipeline = runPipelineGeneration(requirements, schema, project);

        log.info("Multi-Agent Orchestration complete. Returning consolidated response.");

        return FullAnalysisResponse.builder()
                .projectId(project.getId())
                .requirements(requirements)
                .analysis(analysis)
                .schema(schema)
                .sql(sql)
                .pipeline(pipeline)
                .build();
    }
}
