/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { LandingTab } from './components/LandingTab';
import { AnalysisTab } from './components/AnalysisTab';
import { SchemaTab } from './components/SchemaTab';
import { SQLGeneratorTab } from './components/SQLGeneratorTab';
import { PipelineTab } from './components/PipelineTab';
import { JavaSDKTab } from './components/JavaSDKTab';
import { HackathonTab } from './components/HackathonTab';
import { ReasoningTimeline } from './components/ReasoningTimeline';
import { ArchitectChat } from './components/ArchitectChat';

import { 
  Terminal, 
  Cpu, 
  Database, 
  Network, 
  GitFork, 
  Sparkles, 
  Code, 
  Presentation, 
  Activity,
  Layers,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_ecommerce_sales');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [activeAgentIdx, setActiveAgentIdx] = useState<number>(-1);
  const [errorText, setErrorText] = useState<string>('');

  // Hydrate projects from backend
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to connect to full-stack Express backend API:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Handles dynamic sequencing of agents with visual log streams!
  const handleSubmitRequirements = async (name: string, requirements: string) => {
    setIsAnalyzing(true);
    setErrorText('');
    setAgentLogs(["[Orchestrator] Spin up Multi-Agent Reasoning Workspace..."]);
    setActiveAgentIdx(0);

    // Simulate ticking of agent stages to make the multi-agent collaboration look alive & highly visual!
    const logIntervals = [
      { delay: 1000, log: "[Agent: Requirement Analyst] Parsing client objectives, listing target business goals...", agent: 0 },
      { delay: 2200, log: "[Agent: Requirement Analyst] Cataloging primary actors, metric targets, and geographic constraints.", agent: 0 },
      { delay: 3500, log: "[Agent: Data Architect] Inheriting goals & objects. Provisioning relational 3NF normalized tables...", agent: 1 },
      { delay: 4800, log: "[Agent: Data Architect] Drawing foreign relations and auditing primary constraint maps.", agent: 1 },
      { delay: 6250, log: "[Agent: SQL Engineer] Writing high-fidelity core aggregated queries & CTE structures...", agent: 2 },
      { delay: 7800, log: "[Agent: SQL Engineer] Compiling window tracking alerts and index configuration parameters.", agent: 2 },
      { delay: 9200, log: "[Agent: Pipeline Advisor] Formulating Medallion sequence (Bronze-Silver-Gold) inside OneLake...", agent: 3 },
      { delay: 10500, log: "[Agent: Pipeline Advisor] Integrating Fabric Notebook definitions & DirectLake semantic bindings.", agent: 3 },
      { delay: 11800, log: "[Orchestrator] Consolidation complete. Hydrating project catalog workspace.", agent: -1 }
    ];

    logIntervals.forEach((item) => {
      setTimeout(() => {
        setAgentLogs(prev => [...prev, item.log]);
        if (item.agent !== undefined) {
          setActiveAgentIdx(item.agent);
        }
      }, item.delay);
    });

    try {
      const response = await fetch('/api/full-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, requirements })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Wait a small bit to let the animation logs play out harmoniously
        setTimeout(() => {
          setProjects(prev => {
            const exists = prev.findIndex(p => p.id === result.id);
            if (exists >= 0) {
              const updated = [...prev];
              updated[exists] = result;
              return updated;
            }
            return [...prev, result];
          });
          setActiveProjectId(result.id);
          setIsAnalyzing(false);
          setActiveAgentIdx(-1);
          // Auto route them to the Analyst results tab to marvel at the output!
          setActiveTab('analysis');
        }, 12500);
      } else {
        const errObj = await response.json();
        setErrorText(errObj.error || "Collaborative execution timed out.");
        setIsAnalyzing(false);
        setActiveAgentIdx(-1);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText("Communication failed with LLM Orchestration agent.");
      setIsAnalyzing(false);
      setActiveAgentIdx(-1);
    }
  };

  const handleSelectProject = (project: Project) => {
    setActiveProjectId(project.id);
    // Auto shift theme depending on status
    if (activeTab === 'landing') {
      setActiveTab('analysis');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) {
          setActiveProjectId('proj_ecommerce_sales');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateHackathonDemo = async () => {
    setIsAnalyzing(true);
    setActiveTab('analysis');
    setAgentLogs([
      "[Orchestrator] JUDGE DEMO MODE TRACE ENGAGED...",
      "[Orchestrator] Overriding prompt buffer. Injecting extreme-readiness Fleet IoT Telemetry specifications."
    ]);
    setActiveAgentIdx(0);

    const demoLogs = [
      { delay: 800, log: "[Agent: Requirement Analyst] Cataloging 13 telemetry parameters including latitude, heading, oil_viscosity, secondary fuel buffers.", agent: 0 },
      { delay: 1800, log: "[Orchestrator] Core objectives mapped. Transitioning schema compilation handoff to Data Architect.", agent: 1 },
      { delay: 2800, log: "[Agent: Data Architect] Generating Star Schema. Designing high-density dimensional keys for vessels, voyages, and diagnostic alert states.", agent: 1 },
      { delay: 3800, log: "[Orchestrator] Physical schema compiled with 0 integrity errors. Directing SQL Engineer to aggregates.", agent: 2 },
      { delay: 4800, log: "[Agent: SQL Engineer] Compiling SQL. Synthesizing CTEs with partitioning, window alerts, and dynamic telemetry rolling-averages.", agent: 2 },
      { delay: 5800, log: "[Orchestrator] Queries audited successfully. Handing over to Pipeline Advisor for Medallion mapping.", agent: 3 },
      { delay: 6800, log: "[Agent: Pipeline Advisor] Deploying bronze ingestion buffers. Formulating Microsoft Fabric notebooks and capacity reservations...", agent: 3 },
      { delay: 7800, log: "[Orchestrator] Multi-agent collaboration complete. Deploying Enterprise Readiness Report & Copilot Studio config.", agent: -1 }
    ];

    demoLogs.forEach((item) => {
      setTimeout(() => {
        setAgentLogs(prev => [...prev, item.log]);
        if (item.agent !== undefined) {
          setActiveAgentIdx(item.agent);
        }
      }, item.delay);
    });

    try {
      const response = await fetch('/api/projects/seed-demo', {
        method: 'POST'
      });
      
      if (response.ok) {
        const demoProject = await response.json();
        
        setTimeout(async () => {
          await fetchProjects();
          setActiveProjectId(demoProject.id);
          setIsAnalyzing(false);
          setActiveAgentIdx(-1);
          setActiveTab('analysis'); 
        }, 9000);
      } else {
        setIsAnalyzing(false);
        setActiveAgentIdx(-1);
      }
    } catch (err) {
      console.error("Demo seed failed:", err);
      setIsAnalyzing(false);
      setActiveAgentIdx(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-800 select-none antialiased">
      
      {/* 1. TOP HEADER & TELEMETRY INDICATOR */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">DataPilot <span className="text-blue-600">AI</span></span>
              <span className="text-[9px] bg-blue-50 border border-blue-200 text-blue-600 font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold hidden xs:inline-block">
                Multi-Agent
              </span>
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold leading-tight mt-0.5 hidden sm:block">
              Multi-Agent Data Engineering Copilot
            </div>
          </div>
        </div>

        {/* Dynamic header progress loops during reasoning runs! */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAnalyzing ? (
            <div className="flex items-center gap-1.5 sm:gap-3 bg-blue-50/70 p-1.5 px-2 sm:px-3 rounded-lg border border-blue-100">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((stepIdx) => {
                  const isCurrent = activeAgentIdx === stepIdx;
                  const isDone = activeAgentIdx > stepIdx;
                  return (
                    <div
                      key={stepIdx}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border transition ${
                        isCurrent 
                          ? 'bg-blue-600 border-blue-400 scale-120 animate-pulse' 
                          : isDone 
                            ? 'bg-green-600 border-green-500' 
                            : 'bg-slate-200 border-slate-300'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 whitespace-nowrap">
                {activeAgentIdx === 0 && "Analyst..."}
                {activeAgentIdx === 1 && "Architect..."}
                {activeAgentIdx === 2 && "SQL..."}
                {activeAgentIdx === 3 && "Pipelines..."}
                {activeAgentIdx === -1 && "Finalizing..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] sm:text-xs font-medium hidden sm:flex">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Azure AI Foundry Active
            </div>
          )}

          <button
            onClick={() => {
              setActiveTab('landing');
            }}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition"
          >
            Generate<span className="hidden sm:inline"> New Solution</span>
          </button>
        </div>
      </header>

      {/* ERROR BANNER DISPLAY */}
      {errorText && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-700 flex items-center gap-2 font-mono shrink-0">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Error during Agent sequence: {errorText}. falling back.</span>
        </div>
      )}

      {/* LIVE PROGRESS WORKSPACE WRAPPER */}
      {isAnalyzing && (
        <div className="bg-slate-950 text-slate-300 px-6 py-3 border-b border-slate-900 shrink-0 font-mono text-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 space-y-1 overflow-hidden min-w-0">
            <div className="flex items-center gap-2 text-slate-200">
              <Terminal className="w-4 h-4 text-blue-400 animate-spin-slow shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px] text-blue-400">Agentic Workspace Reasoning Stream</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate tracking-tight">
              {agentLogs[agentLogs.length - 1]}
            </div>
          </div>
          
          <div className="text-[10px] uppercase text-slate-500 shrink-0 border border-slate-800 p-1 px-2.5 rounded bg-slate-900 font-semibold">
            Streams: {agentLogs.length} logged
          </div>
        </div>
      )}

      {/* 2. MAIN LAYOUT AND STAGE PANELS */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT NAV PANEL - workspace switcher options */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col p-4 shrink-0 justify-between text-slate-600 hidden md:flex">
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
            
            {/* Context project section */}
            {activeProject && (
              <div className="space-y-2">
                <div className="p-4 bg-slate-900 rounded-xl text-white shadow-sm">
                  <p className="text-[10px] text-slate-450 font-bold tracking-wider uppercase mb-1.5 font-mono">Project Context</p>
                  <p className="text-xs font-semibold leading-relaxed line-clamp-3">"{activeProject.name}"</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Target: PostgreSQL</span>
                    <span className="text-blue-400 font-bold uppercase tracking-wider text-[9px]">ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Tab options */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Project Lifecycle</div>
              
              <button
                onClick={() => setActiveTab('landing')}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'landing' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'landing' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>H</span>
                <span>Dashboard Home</span>
              </button>

              <button
                onClick={() => setActiveTab('analysis')}
                disabled={!activeProject?.analysis}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'analysis' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'analysis' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>1</span>
                <span>Requirements</span>
              </button>

              <button
                onClick={() => setActiveTab('schema')}
                disabled={!activeProject?.schema}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'schema' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'schema' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>2</span>
                <span>Schema designer</span>
              </button>

              <button
                onClick={() => setActiveTab('sql')}
                disabled={!activeProject?.sql}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'sql' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'sql' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>3</span>
                <span>SQL aggregator</span>
              </button>

              <button
                onClick={() => setActiveTab('pipeline')}
                disabled={!activeProject?.pipeline}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'pipeline' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'pipeline' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>4</span>
                <span>ETL Pipeline</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Integration & Pitch</div>
              
              <button
                onClick={() => setActiveTab('javasdk')}
                disabled={!activeProject?.schema}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'javasdk' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'javasdk' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>S</span>
                <span>Spring Boot SDK</span>
              </button>

              <button
                onClick={() => setActiveTab('hackathon')}
                className={`w-full text-left py-2 px-3 rounded-md text-xs font-medium flex items-center gap-3 transition cursor-pointer border ${
                  activeTab === 'hackathon' 
                    ? 'bg-blue-50 text-blue-600 border-blue-150 font-bold' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-bold shrink-0 ${
                  activeTab === 'hackathon' ? 'bg-blue-100 text-blue-600 border-blue-300' : 'bg-slate-50 border-slate-200 text-slate-450'
                }`}>P</span>
                <span>Presentation Panel</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer credit */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between shrink-0 font-medium">
            <span>Enterprise Suite</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" /> Live Link
            </span>
          </div>
        </aside>

        {/* CONTAINER VIEWPORTS PORT STAGES */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] relative z-10">
          
          {/* TAB BAR FOR MOBILE COMPATIBILITY */}
          <div className="flex md:hidden gap-1.5 overflow-x-auto pb-4 shrink-0 font-sm border-b border-slate-200 mb-4 select-none">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'landing' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={!activeProject?.analysis}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-550'} disabled:opacity-40`}
            >
              Requirements
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              disabled={!activeProject?.schema}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'schema' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-550'} disabled:opacity-40`}
            >
              Schema
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              disabled={!activeProject?.sql}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'sql' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-550'} disabled:opacity-40`}
            >
              SQL queries
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              disabled={!activeProject?.pipeline}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-550'} disabled:opacity-40`}
            >
              ETL Flow
            </button>
            <button
              onClick={() => setActiveTab('javasdk')}
              disabled={!activeProject?.schema}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'javasdk' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-550'} disabled:opacity-40`}
            >
              Spring Boot
            </button>
            <button
              onClick={() => setActiveTab('hackathon')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${activeTab === 'hackathon' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-650'}`}
            >
              Pitch Board
            </button>
          </div>

          {/* ACTIVE TAB STAGE INJECTION */}
          <div>
            {activeTab !== 'landing' && (
              <ReasoningTimeline 
                isAnalyzing={isAnalyzing} 
                activeAgentIdx={activeAgentIdx} 
                hasActiveProject={!!activeProject} 
              />
            )}

            {activeTab === 'landing' && (
              <LandingTab
                projects={projects}
                activeProject={activeProject}
                onSelectProject={handleSelectProject}
                onDeleteProject={handleDeleteProject}
                onSubmitRequirements={handleSubmitRequirements}
                isAnalyzing={isAnalyzing}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisTab 
                analysis={activeProject?.analysis} 
                reasoning={activeProject?.analysisReasoning} 
              />
            )}

            {activeTab === 'schema' && (
              <SchemaTab 
                schema={activeProject?.schema} 
                reasoning={activeProject?.schemaReasoning} 
              />
            )}

            {activeTab === 'sql' && (
              <SQLGeneratorTab 
                sqlData={activeProject?.sql} 
                reasoning={activeProject?.sqlReasoning} 
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineTab 
                pipeline={activeProject?.pipeline} 
                reasoning={activeProject?.pipelineReasoning}
                options={activeProject?.optionsComparison}
                scorecard={activeProject?.scorecard}
                costEstimate={activeProject?.fabricCostEstimate}
                copilotExport={activeProject?.copilotStudioExport}
                readiness={activeProject?.enterpriseReadiness}
              />
            )}

            {activeTab === 'javasdk' && activeProject && (
              <JavaSDKTab 
                schema={activeProject.schema} 
                projectName={activeProject.name} 
              />
            )}

            {activeTab === 'hackathon' && (
              <HackathonTab 
                onSeedDemo={handleGenerateHackathonDemo} 
                isSeeding={isAnalyzing} 
              />
            )}
          </div>
        </main>
      </div>

      <ArchitectChat 
        projectId={activeProjectId} 
        activeTab={activeTab} 
        projectName={activeProject?.name || "DataPilot Custom Application"} 
      />

      {/* FOOTER BAR */}
      <footer className="min-h-10 h-auto py-2 sm:py-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-medium text-slate-400 shrink-0 select-none gap-2 sm:gap-0">
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
          <span>Build: v1.0.4-hackathon</span>
          <span className="hidden xs:inline">Memory: 1.2GB allocated</span>
          <span>Agent State: idle</span>
        </div>
        <div className="flex gap-3 sm:gap-4 items-center justify-center">
          <span 
            className="text-blue-500 hover:underline cursor-pointer font-semibold"
            onClick={() => {
              if (activeProject) setActiveTab('analysis');
            }}
          >
            View Full Reasoning Logs
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
}
