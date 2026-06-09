/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SQLEngineerOutput } from '../types';
import { 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  HelpCircle,
  Database,
  ArrowDownToLine,
  Zap
} from 'lucide-react';
import { AgentReasoningPanel } from './AgentReasoningPanel';

interface SQLGeneratorProps {
  sqlData?: SQLEngineerOutput;
  reasoning?: any;
}

export function SQLGeneratorTab({ sqlData, reasoning }: SQLGeneratorProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!sqlData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
        <Terminal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm">Initiate collaborative agents to render optimized analytics SQL queries.</p>
      </div>
    );
  }

  const handleCopy = (sqlText: string, id: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Agent Persona Card */}
      <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            A3
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">SQL Engineer Agent</h3>
            <p className="text-xs text-slate-500">Query Performance Optimization & Aggregate Calculations Specialist</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">ACTIVE ROLE</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Essential Business Reports */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" /> Standard Operational Reports
          </h3>

          {sqlData.queries?.map((q, idx) => (
            <div key={idx} className="bg-white border border-slate-250 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-slate-850 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {q.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{q.description}</p>
                </div>

                <button
                  onClick={() => handleCopy(q.sql, `std_${idx}`)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-650 rounded-lg transition active:scale-95 shrink-0 cursor-pointer"
                >
                  {copiedIndex === `std_${idx}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" />
                      <span className="text-green-600">Copied SQL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>

              {/* SQL box */}
              <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto select-all leading-relaxed whitespace-pre font-light border-b border-slate-900 border-t border-slate-100">
                {q.sql}
              </div>

              {/* Output columns expected */}
              {q.columnsExpected && q.columnsExpected.length > 0 && (
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-450 flex items-center gap-1 shrink-0">
                    <ArrowDownToLine className="w-3.5 h-3.5" /> Exposes columns:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {q.columnsExpected.map((col, cIdx) => (
                      <span key={cIdx} className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Analytical & Window Queries Section */}
        {sqlData.analyticsQueries && sqlData.analyticsQueries.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" /> Advanced Analytical Intelligence (CTEs / Window Functions)
            </h3>

            {sqlData.analyticsQueries.map((q, idx) => (
              <div key={idx} className="bg-white border border-slate-250 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-850 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      {q.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{q.description}</p>
                  </div>

                  <button
                    onClick={() => handleCopy(q.sql, `adv_${idx}`)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-650 rounded-lg transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    {copiedIndex === `adv_${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" />
                        <span className="text-green-600">Copied SQL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>

                {/* SQL Box */}
                <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto select-all leading-relaxed whitespace-pre font-light border-b border-slate-900 border-t border-slate-100">
                  {q.sql}
                </div>

                {/* Optimization box */}
                <div className="p-4 bg-emerald-500/5 text-slate-700 text-xs border-t border-slate-100 leading-relaxed font-sans space-y-2">
                  <div className="font-semibold text-emerald-850 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Agent Query Optimization Strategy:
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {q.optimizationExplanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RATIONALE REASONING BLOCK */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cpu className="w-24 h-24 text-emerald-500" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4.5 h-4.5 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Explainable Agentic Reasoning
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {sqlData.reasoning}
        </p>
      </div>

      <AgentReasoningPanel reasoning={reasoning} agentLabel="SQL Engineer Agent" />
    </div>
  );
}
