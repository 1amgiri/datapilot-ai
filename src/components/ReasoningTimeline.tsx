import React from 'react';
import { 
  CheckCircle2, 
  PlayCircle, 
  HelpCircle, 
  Circle, 
  Bot, 
  Activity 
} from 'lucide-react';

interface TimelineStep {
  id: number;
  name: string;
  role: string;
  action: string;
}

interface ReasoningTimelineProps {
  isAnalyzing: boolean;
  activeAgentIdx: number;
  hasActiveProject: boolean;
}

const STEPS: TimelineStep[] = [
  { id: 0, name: "Requirement Analyst", role: "Agent #1", action: "Identify entities & metrics" },
  { id: 1, name: "Data Architect", role: "Agent #2", action: "Synthesize table schemas & keys" },
  { id: 2, name: "SQL Engineer", role: "Agent #3", action: "Write analytical aggregates" },
  { id: 3, name: "Pipeline Advisor", role: "Agent #4", action: "Design medallion Lakehouses" }
];

export function ReasoningTimeline({ isAnalyzing, activeAgentIdx, hasActiveProject }: ReasoningTimelineProps) {
  if (!hasActiveProject && !isAnalyzing) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-600"></div>
      
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600 animate-bounce" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-750">
              Multi-Agent Reasoning Trace Grid
            </h4>
            <p className="text-[10px] text-slate-400">Sequence flow metrics representing consecutive active agent compiler handoffs</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-mono shrink-0 select-none">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold uppercase tracking-wider text-slate-600">
            {isAnalyzing ? `Agent ${activeAgentIdx + 1} processing...` : "Continuous state: Synced"}
          </span>
        </div>
      </div>

      {/* Horizontal Nodes List */}
      <div className="relative pt-2">
        {/* Connection Wire lines */}
        <div className="absolute left-[10%] right-[10%] top-[34px] h-[3px] bg-slate-100" />
        
        {/* Connection active color line */}
        <div 
          className="absolute left-[10%] top-[34px] h-[3px] bg-emerald-500 transition-all duration-[800ms] ease-in-out" 
          style={{ 
            width: isAnalyzing 
              ? `${Math.max(0, activeAgentIdx) * 26.6}%` 
              : "80%" 
          }}
        />

        <div className="grid grid-cols-4 gap-4 relative z-10 select-none">
          {STEPS.map((step) => {
            let status: 'complete' | 'active' | 'pending' = 'pending';
            
            if (isAnalyzing) {
              if (activeAgentIdx > step.id) {
                status = 'complete';
              } else if (activeAgentIdx === step.id) {
                status = 'active';
              }
            } else if (hasActiveProject) {
              status = 'complete';
            }

            return (
              <div key={step.id} className="flex flex-col items-center text-center space-y-2">
                {/* Visual Circle Node icon */}
                <div className="relative">
                  {status === 'complete' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {status === 'active' && (
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse transition-all border-2 border-white">
                      <PlayCircle className="w-5 h-5 shrink-0" />
                    </div>
                  )}
                  {status === 'pending' && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-slate-200 transition-all">
                      <Circle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Text Labels block */}
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                    {step.role}
                  </div>
                  <div className={`text-[10px] sm:text-xs font-bold truncate max-w-[70px] sm:max-w-[130px] font-sans ${
                    status === 'active' ? 'text-amber-800' : 'text-slate-800'
                  }`} title={step.name}>
                    {step.name}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-450 italic line-clamp-1 max-w-[70px] sm:max-w-[140px] font-mono leading-tight hidden xs:block">
                    {step.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
