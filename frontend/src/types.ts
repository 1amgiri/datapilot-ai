/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared Types between Frontend & Backend

export interface EntityAttr {
  name: string;
  description: string;
  keyAttributes: string[];
}

export interface MetricAttr {
  name: string;
  calculationLogic: string;
  targetKPIs: string[];
}

export interface RequirementOutput {
  businessGoals: string[];
  entities: EntityAttr[];
  metrics: MetricAttr[];
  constraints: string[];
  reasoning: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  constraints: string[];
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencesTable?: string;
  referencesColumn?: string;
}

export interface SchemaTable {
  name: string;
  description: string;
  columns: SchemaColumn[];
}

export interface SchemaRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-many' | 'one-to-one' | 'many-to-many';
}

export interface SchemaOutput {
  tables: SchemaTable[];
  relationships: SchemaRelationship[];
  reasoning: string;
}

export interface SQLQueryItem {
  title: string;
  sql: string;
  description: string;
  columnsExpected: string[];
}

export interface SQLAnalyticsQueryItem {
  title: string;
  sql: string;
  description: string;
  optimizationExplanation: string;
}

export interface SQLEngineerOutput {
  queries: SQLQueryItem[];
  analyticsQueries: SQLAnalyticsQueryItem[];
  reasoning: string;
}

export interface ETLStepItem {
  step: string;
  source: string;
  target: string;
  transformation: string;
  description: string;
}

export interface WarehouseDesignItem {
  modelType: 'Star' | 'Snowflake' | 'Data Vault' | 'Dimensional';
  brief: string;
  facts: string[];
  dimensions: string[];
}

export interface FabricRecommendationItem {
  componentsRecommended: string[];
  integrationFlow: string;
  ingestionLayer: string;
  analyticsLayer: string;
  powerBiIntegration: string;
}

export interface PipelineOutput {
  etlSteps: ETLStepItem[];
  dataWarehouseDesign: WarehouseDesignItem;
  fabricRecommendation: FabricRecommendationItem;
  reasoning: string;
}

// Advanced Reasoning Upgrades
export interface AgentReasoning {
  thoughtProcess: string;
  decisionLogic: string;
  assumptions: string[];
  constraints: string[];
  alternatives: string[];
  confidenceScore: number;
  confidenceReasons: {
    dataCompleteness: number; // 0-100
    businessAmbiguity: number; // 0-100
    schemaCertainty: number; // 0-100
    pipelineCertainty: number; // 0-100
  };
}

export interface DecisionOption {
  name: string;
  description: string;
  cost: 'Low' | 'Medium' | 'High';
  complexity: 'Low' | 'Medium' | 'High';
  scalability: 'Low' | 'Medium' | 'High';
  performance: 'Low' | 'Medium' | 'High';
  maintainability: 'Low' | 'Medium' | 'High';
  score: number; // 0-100
}

export interface OptionsComparison {
  optionA: DecisionOption;
  optionB: DecisionOption;
  optionC: DecisionOption;
  recommendedOption: 'Option A' | 'Option B' | 'Option C';
  rationale: string;
}

export interface ArchitectureScorecard {
  scalability: number; // 0-100
  security: number; // 0-100
  performance: number; // 0-100
  maintainability: number; // 0-100
  costEfficiency: number; // 0-100
}

export interface CostBreakdownItem {
  item: string;
  cost: number;
  unit: string;
}

export interface FabricCostEstimator {
  estimatedStorageGB: number;
  estimatedComputeCU: number;
  capacityRecommendation: string;
  monthlyCost: number;
  breakdown: CostBreakdownItem[];
}

export interface CopilotPromptTemplate {
  title: string;
  prompt: string;
}

export interface CopilotStudioExport {
  agentName: string;
  description: string;
  instructions: string;
  promptTemplates: CopilotPromptTemplate[];
  configurationJson: string;
}

export interface RiskItem {
  risk: string;
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface EnterpriseReadinessReport {
  architectureSummary: string;
  securityAnalysis: string[];
  dataGovernance: string[];
  compliance: string[];
  scalabilityReview: string;
  operationalCostDetails: string;
  riskAssessments: RiskItem[];
  recommendedNextSteps: string[];
}

// Complete Project Analytics State
export interface Project {
  id: string;
  name: string;
  description: string;
  requirements: string;
  createdAt: string;
  
  // Agentic States
  analysis?: RequirementOutput;
  schema?: SchemaOutput;
  sql?: SQLEngineerOutput;
  pipeline?: PipelineOutput;
  
  // Advanced Reasoning States
  requirementsReasoning?: AgentReasoning;
  schemaReasoning?: AgentReasoning;
  sqlReasoning?: AgentReasoning;
  pipelineReasoning?: AgentReasoning;
  optionsComparison?: OptionsComparison;
  scorecard?: ArchitectureScorecard;
  fabricCostEstimate?: FabricCostEstimator;
  copilotStudioExport?: CopilotStudioExport;
  enterpriseReadiness?: EnterpriseReadinessReport;

  // Active step
  status: 'draft' | 'analyzed' | 'architected' | 'engineered' | 'completed';
}

export interface JavaCodeFile {
  path: string;
  content: string;
  type: 'controller' | 'service' | 'entity' | 'dto' | 'repository' | 'config' | 'ddl' | 'properties' | 'pom' | 'main';
  description: string;
}
