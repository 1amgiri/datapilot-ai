import React, { useState } from 'react';
import { 
  PipelineOutput, 
  OptionsComparison, 
  ArchitectureScorecard, 
  FabricCostEstimator, 
  CopilotStudioExport, 
  EnterpriseReadinessReport 
} from '../types';
import { 
  GitFork, 
  Columns, 
  HelpCircle, 
  Cpu, 
  Box, 
  Compass, 
  Layers,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Download,
  AlertTriangle,
  Lightbulb,
  Workflow,
  Sparkles,
  RefreshCw,
  Award,
  AlertOctagon,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AgentReasoningPanel } from './AgentReasoningPanel';

interface PipelineTabProps {
  pipeline?: PipelineOutput;
  reasoning?: any;
  options?: OptionsComparison;
  scorecard?: ArchitectureScorecard;
  costEstimate?: FabricCostEstimator;
  copilotExport?: CopilotStudioExport;
  readiness?: EnterpriseReadinessReport;
}

export function PipelineTab({ 
  pipeline, 
  reasoning, 
  options, 
  scorecard, 
  costEstimate, 
  copilotExport, 
  readiness 
}: PipelineTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'flow' | 'comparison' | 'costs' | 'readiness' | 'copilot'>('flow');
  const [copiedExport, setCopiedExport] = useState(false);

  if (!pipeline) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
        <GitFork className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
        <p className="text-sm">Initiate collaborative agents to design modern pipeline architectures.</p>
      </div>
    );
  }

  // Fallbacks for seeding demo compatibility
  const finalOptions = options || {
    optionA: { name: "Medallion Star Lakehouse (Fabric/OneLake)", description: "Spark Delta Parquet in OneLake with DirectLake BI connections", cost: "Medium", complexity: "Medium", scalability: "High", performance: "High", maintainability: "High", score: 92 },
    optionB: { name: "Traditional Relational (PostgreSQL Host)", description: "Standard relational store with cron script Python ingestion", cost: "Low", complexity: "Low", scalability: "Medium", performance: "Medium", maintainability: "Medium", score: 74 },
    optionC: { name: "Real-time Kappa Eventhouse", description: "Azure Event Hubs streaming directly into millisecond KQL tables", cost: "High", complexity: "High", scalability: "High", performance: "High", maintainability: "Low", score: 81 },
    recommendedOption: "Option A",
    rationale: "Optimizes parallel analytical query hits while maintaining sub-hourly batch replication windows."
  };

  const finalScorecard = scorecard || {
    scalability: 96,
    security: 90,
    performance: 92,
    maintainability: 94,
    costEfficiency: 88
  };

  const finalCostEstimate = costEstimate || {
    estimatedStorageGB: 150,
    estimatedComputeCU: 8,
    capacityRecommendation: "F8 Capacity reservation (8 Capacity Units, hourly billing)",
    monthlyCost: 512.00,
    breakdown: [
      { item: "OneLake Storage (Delta Parquet formatted clusters)", cost: 3.45, unit: "GB" },
      { item: "Fabric F8 Compute Reservation (24/7 provisioned nodes)", cost: 480.00, unit: "CU" },
      { item: "Automated Orchestrations (runs schemas & Data Factory runs)", cost: 28.55, unit: "Runs" }
    ]
  };

  const finalCopilotExport = copilotExport || {
    agentName: "DataPilot Intelligent Copilot",
    description: "Multi-agent system optimized to represent schemas in Copilot Studio dashboards.",
    instructions: "System guidelines detailing standard relational structures...",
    promptTemplates: [
      { title: "Query Daily Events summary", prompt: "Run queries over fact_vessel_telemetry to aggregate KPIs." }
    ],
    configurationJson: "{}"
  };

  const finalReadiness = readiness || {
    architectureSummary: "Enterprise Star Schema Lakehouse built on medallion patterns",
    securityAnalysis: ["Active row-level data segregation policy controls", "Standard column hashes on fields", "SSO Active Directory configurations"],
    dataGovernance: ["Automatic ingestion mapping logs in Microsoft Purview", "Automated pipelines lineage tracking charts"],
    compliance: ["PCI-DSS storage directives", "GDPR compliance constraints"],
    scalabilityReview: "Linearly matches workload increments utilizing auto-scaled Spark computing clusters",
    operationalCostDetails: "Estimated baseline sits around $512/month with active reservation benefits.",
    riskAssessments: [
      { risk: "Data replication delays due to ship connectivity drops", impact: "Medium", mitigation: "Configured exponential backups and dead-letter queue routing." }
    ],
    recommendedNextSteps: ["Verify physical schema statements", "Setup a Fabric tenant trial workspace"]
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(finalCopilotExport.configurationJson || "{}");
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Agent Persona Card */}
      <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            A4
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Pipeline Advisor Agent</h3>
            <p className="text-xs text-slate-500">Microsoft Fabric Architect & Medallion Data Lakehouse Schema Specialist</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">ACTIVE ROLE</span>
      </div>

      {/* Internal Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-0.5 scrollbar-thin overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('flow')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition flex items-center gap-1 px-1.5 cursor-pointer ${
            activeSubTab === 'flow' 
              ? 'border-amber-500 text-amber-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Medallion Pipeline
        </button>

        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition flex items-center gap-1 px-1.5 cursor-pointer ${
            activeSubTab === 'comparison' 
              ? 'border-amber-500 text-amber-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Award className="w-4 h-4" />
          Architecture Scorecard
        </button>

        <button
          onClick={() => setActiveSubTab('costs')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition flex items-center gap-1 px-1.5 cursor-pointer ${
            activeSubTab === 'costs' 
              ? 'border-amber-500 text-amber-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Fabric Cost Estimator
        </button>

        <button
          onClick={() => setActiveSubTab('readiness')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition flex items-center gap-1 px-1.5 cursor-pointer ${
            activeSubTab === 'readiness' 
              ? 'border-amber-500 text-amber-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Enterprise Readiness
        </button>

        <button
          onClick={() => setActiveSubTab('copilot')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition flex items-center gap-1 px-1.5 cursor-pointer ${
            activeSubTab === 'copilot' 
              ? 'border-amber-500 text-amber-700 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Copilot Studio Export
        </button>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {activeSubTab === 'flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: ETL Steps */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <Layers className="w-4.5 h-4.5 text-amber-500" />
                Ingestion & Transformation Pipeline (Medallion Layout)
              </h3>
              
              <div className="space-y-4">
                {pipeline.etlSteps?.map((step, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-100 space-y-2 pb-2">
                    <div className="absolute left-[-6px] top-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-4 ring-white"></div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-xs text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                        Step {idx + 1}: {step.step}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center p-3 border border-slate-100 bg-slate-55 rounded-lg text-xs font-mono">
                      <div className="text-slate-650 flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Source</span>
                        <span className="text-slate-700 truncate font-semibold">{step.source}</span>
                      </div>
                      <div className="text-center text-slate-400 flex flex-col justify-center items-center font-bold">
                        <span className="text-[8px] text-amber-600 bg-amber-50/50 px-1 rounded uppercase tracking-wide">Transforming</span>
                        <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-amber-500" />
                      </div>
                      <div className="text-slate-650 flex flex-col text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Target</span>
                        <span className="text-slate-700 truncate font-semibold">{step.target}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      <span className="font-semibold text-slate-600">Action:</span> {step.transformation}. {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {panelWarehouseModel()}
          </div>

          {/* Right Side: MS Fabric Recommendations details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
              SaaS Advisor Blueprint
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-450 block mb-1.5 font-mono">Recommended Modules</span>
                <div className="flex gap-1.5 flex-wrap">
                  {pipeline.fabricRecommendation?.componentsRecommended?.map((comp, idx) => (
                    <span key={idx} className="text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-150 px-2 py-0.5 rounded-full">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">1. Extraction Layer</span>
                <p className="text-slate-500 leading-relaxed">{pipeline.fabricRecommendation?.ingestionLayer}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">2. Spark Notebooks</span>
                <p className="text-slate-500 leading-relaxed">{pipeline.fabricRecommendation?.integrationFlow}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">3. Lakehouse tables sync</span>
                <p className="text-slate-500 leading-relaxed">{pipeline.fabricRecommendation?.analyticsLayer}</p>
              </div>

              <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block font-mono flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 shrink-0" /> 4. Power BI DirectLake BI
                </span>
                <p className="text-[11px] text-indigo-900 leading-relaxed">{pipeline.fabricRecommendation?.powerBiIntegration}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          {/* Radar scorecard metrics progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <Sliders className="w-4.5 h-4.5 text-amber-500" />
                Datalakehouse Scorecard
              </h3>
              <p className="text-xs text-slate-400">Multi-fact audit scorecard checking standard parameters suitability</p>
              
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Scalability Potential</span>
                    <span>{finalScorecard.scalability}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${finalScorecard.scalability}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Security & Access Control</span>
                    <span>{finalScorecard.security}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${finalScorecard.security}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Analytical query Speed</span>
                    <span>{finalScorecard.performance}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${finalScorecard.performance}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Maintenance & Simplicity</span>
                    <span>{finalScorecard.maintainability}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${finalScorecard.maintainability}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Infrastruct Cost Efficiency</span>
                    <span>{finalScorecard.costEfficiency}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${finalScorecard.costEfficiency}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Selection reasons card */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wide">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Orchestrator Decision Rationale
                </h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/60 p-4 border border-amber-500/10 rounded-lg">
                  {finalOptions.rationale}
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 text-center font-mono text-[11px] text-amber-900 rounded font-bold border border-amber-500/20">
                Recommended Workspace Design: {finalOptions.recommendedOption}
              </div>
            </div>
          </div>

          {/* Table comparing options A, B, C */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-900 text-white font-mono text-xs flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-blue-400">
                <Box className="w-4 h-4" /> Multi-Architecture Selection Matrix
              </span>
              <span className="text-[10px] text-slate-400">DataPilot Decider Module</span>
            </div>

            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono text-[10px] uppercase">
                    <th className="p-4 min-w-[200px]">Architectural Option</th>
                    <th className="p-4 min-w-[300px]">Core Implementation Description</th>
                    <th className="p-4 text-center">Cost</th>
                    <th className="p-4 text-center">Complexity</th>
                    <th className="p-4 text-center">Scalability</th>
                    <th className="p-4 text-center font-bold text-amber-700">Suitability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Option A row */}
                  <tr className="hover:bg-slate-50/50 bg-amber-500/5">
                    <td className="p-4 font-semibold text-slate-800 flex flex-col gap-1">
                      <span className="text-amber-800">{finalOptions.optionA.name}</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-800 border border-amber-500/20 px-1.5 py-0.5 rounded w-fit uppercase font-semibold font-mono">Recommended Option</span>
                    </td>
                    <td className="p-4 text-slate-500 leading-relaxed">{finalOptions.optionA.description}</td>
                    <td className="p-4 text-center font-semibold text-indigo-700">{finalOptions.optionA.cost}</td>
                    <td className="p-4 text-center">{finalOptions.optionA.complexity}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{finalOptions.optionA.scalability}</td>
                    <td className="p-4 text-center font-bold text-slate-900 font-mono text-sm">{finalOptions.optionA.score}</td>
                  </tr>

                  {/* Option B row */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800 flex flex-col gap-1">
                      <span>{finalOptions.optionB.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Traditional</span>
                    </td>
                    <td className="p-4 text-slate-500 leading-relaxed">{finalOptions.optionB.description}</td>
                    <td className="p-4 text-center font-semibold text-indigo-700">{finalOptions.optionB.cost}</td>
                    <td className="p-4 text-center">{finalOptions.optionB.complexity}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{finalOptions.optionB.scalability}</td>
                    <td className="p-4 text-center font-bold text-slate-900 font-mono text-sm">{finalOptions.optionB.score}</td>
                  </tr>

                  {/* Option C row */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800 flex flex-col gap-1">
                      <span>{finalOptions.optionC.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Streaming Kappa</span>
                    </td>
                    <td className="p-4 text-slate-500 leading-relaxed">{finalOptions.optionC.description}</td>
                    <td className="p-4 text-center font-semibold text-indigo-700">{finalOptions.optionC.cost}</td>
                    <td className="p-4 text-center">{finalOptions.optionC.complexity}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{finalOptions.optionC.scalability}</td>
                    <td className="p-4 text-center font-bold text-slate-900 font-mono text-sm">{finalOptions.optionC.score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'costs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estimate overview block */}
          <div className="md:col-span-1 bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] text-amber-400 font-bold font-mono tracking-wider uppercase block">Total Cost Indicator</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-white">${finalCostEstimate.monthlyCost.toFixed(2)}</span>
                <span className="text-slate-400 text-xs">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                Simulated budget model representing standard compute hours and storage parquet volumes with basic operational loads.
              </p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-[10px] mt-4 font-mono space-y-1 text-slate-300">
              <div className="text-amber-400 font-bold">Capacity Recommendation:</div>
              <div>{finalCostEstimate.capacityRecommendation}</div>
            </div>
          </div>

          {/* Granular Cost Tables */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="p-4 bg-slate-55 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Line Item Operational Billing Matrix
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">Microsoft Region Standard</span>
            </div>

            <div className="overflow-x-auto text-xs flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-450 font-bold tracking-wide font-mono text-[9px] uppercase">
                    <th className="p-3.5">Fabric Resource Segment</th>
                    <th className="p-3.5 text-center">Unit Metric</th>
                    <th className="p-3.5 text-right font-bold text-slate-800">Operational Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {finalCostEstimate.breakdown?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="p-3.5 font-semibold text-slate-700">{row.item}</td>
                      <td className="p-3.5 text-center font-mono text-[10px]">{row.unit}</td>
                      <td className="p-3.5 text-right font-bold font-mono text-slate-900">${row.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-slate-55 border-t-2 border-slate-150 font-bold text-slate-800">
                    <td className="p-3.5 text-right font-mono text-[10px]" colSpan={2}>Aggregate Estimated Total:</td>
                    <td className="p-3.5 text-right font-mono text-slate-900 font-bold text-sm">${finalCostEstimate.monthlyCost.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50 text-[10px] text-blue-700 leading-relaxed border-t border-slate-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span><b>Pro-Tip:</b> Activating standard Fabric 1-year Capacity Reservations will reduce estimated compute fees by up to <b>41%</b>.</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'readiness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Audited elements */}
            <div className="lg:col-span-2 space-y-6">
              {/* Architecture overview and security analysis */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck className="w-4.5 h-4.5 text-green-600 animate-pulse" />
                  Security & Access Policy Controls
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {finalReadiness.architectureSummary}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finalReadiness.securityAnalysis?.map((itm, idx) => (
                    <div key={idx} className="p-3 border border-slate-100 bg-slate-55 rounded-lg flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                      <ShieldCheck className="w-4.5 h-4.5 text-green-500 shrink-0 mt-0.5" />
                      <div>{itm}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data governance and compliance */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Compass className="w-4.5 h-4.5 text-indigo-500" />
                  Governance Cataloging & Purview Lineage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-2">Governance Audit Protocols</h4>
                    <ul className="space-y-2 text-xs">
                      {finalReadiness.dataGovernance?.map((gov, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{gov}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-2">Active Regulatory Compliance policies</h4>
                    <ul className="space-y-2 text-xs">
                      {finalReadiness.compliance?.map((comp, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk profile sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4 h-fit">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-400" /> Enterprise Risk Profiler
                </h3>
                <div className="space-y-4 text-xs">
                  {finalReadiness.riskAssessments?.map((risk, idx) => (
                    <div key={idx} className="p-3 rounded bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-100 text-[11px]">Risk #{idx + 1}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                          risk.impact === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {risk.impact} impact
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium">{risk.risk}</p>
                      <div className="text-slate-450 text-[10px] pt-1 border-t border-slate-800 leading-relaxed font-mono">
                        <span className="text-indigo-400 font-bold uppercase">Mitigation:</span> {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next steps checklist */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 uppercase">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Active Implementation Chronology
                </h4>
                <ul className="space-y-2 text-xs">
                  {finalReadiness.recommendedNextSteps?.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-slate-600">
                      <span className="w-4.5 h-4.5 bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-[10px] shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Instructions panel */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
                  CS
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{finalCopilotExport.agentName}</h4>
                  <p className="text-[10px] text-slate-400">Microsoft Copilot Studio Specialist Schema</p>
                </div>
              </div>

              <p className="text-slate-500 leading-relaxed">{finalCopilotExport.description}</p>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">Specialized System Guidelines</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-6 leading-relaxed select-all">
                  {finalCopilotExport.instructions}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyConfig}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition active:scale-[0.98] shadow-md cursor-pointer mt-4"
            >
              {copiedExport ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>Config JSON Copied!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Copilot studio Schema</span>
                </>
              )}
            </button>
          </div>

          {/* Config Json viewport */}
          <div className="lg:col-span-2 bg-slate-950 rounded-xl overflow-hidden shadow-xl flex flex-col font-mono text-[11px] border border-slate-800">
            <div className="p-3 bg-slate-900 border-b border-slate-850 flex items-center justify-between text-slate-400">
              <span className="text-blue-400 font-bold">copilot-studio-config-manifest.json</span>
              <span>JSON Manifest</span>
            </div>
            <pre className="p-5 overflow-auto text-slate-250 select-all leading-normal max-h-[380px] bg-slate-950 font-light">
              {finalCopilotExport.configurationJson}
            </pre>
          </div>
        </div>
      )}

      {/* RATIONALE REASONING BLOCK */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cpu className="w-24 h-24 text-amber-500" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4.5 h-4.5 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Explainable Agentic Reasoning
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {pipeline.reasoning}
        </p>
      </div>

      <AgentReasoningPanel reasoning={reasoning} agentLabel="Pipeline Advisor Agent" />
    </div>
  );

  function panelWarehouseModel() {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
          <Columns className="w-4.5 h-4.5 text-amber-500" />
          Enterprise Warehouse Architecture
        </h3>
        
        <div className="space-y-3 font-sans">
          <div className="text-xs text-slate-700 bg-slate-50 p-3 border border-slate-100 rounded-lg">
            <span className="font-bold text-slate-800 uppercase text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded shrink-0 mr-2">
              Schema Framework: {pipeline.dataWarehouseDesign?.modelType} modeling
            </span>
            <div className="mt-1.5 text-slate-500 leading-relaxed text-xs">
              {pipeline.dataWarehouseDesign?.brief}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Facts catalog</span>
              <div className="flex gap-1.5 flex-wrap">
                {pipeline.dataWarehouseDesign?.facts?.map((fac, fIdx) => (
                  <span key={fIdx} className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-250 px-2 py-1 rounded font-mono">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Dimensions catalog</span>
              <div className="flex gap-1.5 flex-wrap">
                {pipeline.dataWarehouseDesign?.dimensions?.map((dim, dIdx) => (
                  <span key={dIdx} className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded font-mono">
                    {dim}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
