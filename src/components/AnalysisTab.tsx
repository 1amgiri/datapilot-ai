/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RequirementOutput } from '../types';
import { 
  Target, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle,
  Cpu
} from 'lucide-react';
import { AgentReasoningPanel } from './AgentReasoningPanel';

interface AnalysisTabProps {
  analysis?: RequirementOutput;
  reasoning?: any;
}

export function AnalysisTab({ analysis, reasoning }: AnalysisTabProps) {
  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
        <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm">Initiate collaborative agents to render deep requirement analysis trees.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Persona Card */}
      <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            A1
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Requirement Analyst Agent</h3>
            <p className="text-xs text-slate-500">Business Decomposition & Target Modeling Pipeline Specialist</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">ACTIVE ROLE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Hand: Goals & Entities */}
        <div className="space-y-6">
          {/* Goals section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <Target className="w-4.5 h-4.5 text-red-500" />
              Identified Business Goals
            </h3>
            <ul className="space-y-2.5">
              {analysis.businessGoals?.map((goal, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          {/* Extracted Entities */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <Database className="w-4.5 h-4.5 text-blue-500" />
              Identified Operational Entities
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {analysis.entities?.map((ent, idx) => (
                <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                  <div className="font-semibold text-xs text-slate-800 flex items-center justify-between">
                    <span>{ent.name}</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                      Keys: {ent.keyAttributes?.join(', ') || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {ent.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand: Metrics & Constraints */}
        <div className="space-y-6">
          {/* KPIs with formula block */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp className="w-4.5 h-4.5 text-green-600" />
              Metrics & Target KPIs
            </h3>
            <div className="space-y-3">
              {analysis.metrics?.map((m, idx) => (
                <div key={idx} className="p-3 border border-slate-150 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">{m.name}</span>
                    {m.targetKPIs?.map((k, kIdx) => (
                      <span key={kIdx} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                        Target: {k}
                      </span>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-900 rounded-md font-mono text-[10px] text-green-400 border border-slate-800">
                    <span className="text-slate-500 mr-2">// Calculation Logic</span>
                    <div>{m.calculationLogic}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle className="w-4.5 h-4.5 text-yellow-500" />
              Technical Constraints
            </h3>
            <ul className="space-y-2">
              {analysis.constraints?.map((con, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 bg-yellow-50/40 p-2 border border-yellow-100 rounded-lg leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* RATIONALE REASONING BLOCK */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cpu className="w-24 h-24 text-blue-500" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4.5 h-4.5 text-blue-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Explainable Agentic Reasoning
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {analysis.reasoning}
        </p>
      </div>

      <AgentReasoningPanel reasoning={reasoning} agentLabel="Requirements Analyst Agent" />
    </div>
  );
}
