import React, { useState } from 'react';
import { AgentReasoning } from '../types';
import { 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  GitBranch, 
  ShieldCheck 
} from 'lucide-react';

interface AgentReasoningPanelProps {
  reasoning?: AgentReasoning;
  agentLabel?: string;
}

export function AgentReasoningPanel({ reasoning, agentLabel = "Agent" }: AgentReasoningPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!reasoning) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-950/80 hover:bg-slate-950 transition border-b border-slate-800/80 cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{agentLabel} Reasoning Logs</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                Transparent Execution
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Click to monitor the active cognitive thought process trace representation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidence: {reasoning.confidenceScore}%</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-6 bg-slate-900 text-slate-300 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Decisions */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h5 className="font-bold text-slate-100 uppercase tracking-wider text-[10px] text-blue-400 mb-2 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  Thought Process Summary
                </h5>
                <p className="leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                  {reasoning.thoughtProcess}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-100 uppercase tracking-wider text-[10px] text-blue-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  Decision Logic & Selection
                </h5>
                <p className="leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                  {reasoning.decisionLogic}
                </p>
              </div>
            </div>

            {/* Confidence Metrics */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
              <h5 className="font-bold text-slate-100 uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Confidence Diagnostics
              </h5>
              <div className="space-y-3 font-mono">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Data Completeness</span>
                    <span className="text-slate-200">{reasoning.confidenceReasons.dataCompleteness}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${reasoning.confidenceReasons.dataCompleteness}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Business Ambiguity</span>
                    <span className="text-slate-200">{reasoning.confidenceReasons.businessAmbiguity}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${reasoning.confidenceReasons.businessAmbiguity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Schema Certainty</span>
                    <span className="text-slate-200">{reasoning.confidenceReasons.schemaCertainty}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                      style={{ width: `${reasoning.confidenceReasons.schemaCertainty}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Pipeline Certainty</span>
                    <span className="text-slate-200">{reasoning.confidenceReasons.pipelineCertainty}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500" 
                      style={{ width: `${reasoning.confidenceReasons.pipelineCertainty}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
            {/* Assumptions */}
            <div>
              <h5 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Assumptions Formulated
              </h5>
              <ul className="space-y-1.5 pl-4 list-disc leading-relaxed text-slate-400 text-[11px]">
                {reasoning.assumptions?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Constraints */}
            <div>
              <h5 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                Active Constraints Evaluated
              </h5>
              <ul className="space-y-1.5 pl-4 list-disc leading-relaxed text-slate-400 text-[11px]">
                {reasoning.constraints?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Alternatives */}
            <div>
              <h5 className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                Alternative Scopes Considered
              </h5>
              <ul className="space-y-1.5 pl-4 list-disc leading-relaxed text-slate-400 text-[11px]">
                {reasoning.alternatives?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
