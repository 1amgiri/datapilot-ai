import React, { useState } from 'react';
import { SchemaOutput } from '../types';
import { 
  Network, 
  Database, 
  ArrowRightLeft, 
  HelpCircle,
  Cpu,
  Key,
  LayoutGrid,
  Map
} from 'lucide-react';
import { AgentReasoningPanel } from './AgentReasoningPanel';
import { ERDiagram } from './ERDiagram';

interface SchemaTabProps {
  schema?: SchemaOutput;
  reasoning?: any;
}

export function SchemaTab({ schema, reasoning }: SchemaTabProps) {
  const [viewMode, setViewMode] = useState<'tables' | 'erd'>('erd');

  if (!schema) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm animate-fade-in">
        <Network className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm">Initiate collaborative agents to render architectural tables.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Persona Card */}
      <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            A2
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Data Architect Agent</h3>
            <p className="text-xs text-slate-500">Relational Database Normalization & Primary Schema Specialist</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">ACTIVE ROLE</span>
      </div>

      {/* Switcher Controls */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
        <span className="text-xs font-semibold text-slate-600 pl-2">Enterprise Schema Representation</span>
        <div className="flex gap-1.5 select-none text-xs">
          <button
            onClick={() => setViewMode('erd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'erd' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>ERD Entity Diagram Visualizer</span>
          </button>
          <button
            onClick={() => setViewMode('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              viewMode === 'tables' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Table Definition Catalog</span>
          </button>
        </div>
      </div>

      {/* Content Rendering Zone */}
      {viewMode === 'erd' ? (
        <ERDiagram schema={schema} />
      ) : (
        <div className="space-y-6">
          {/* Grid of Tables */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" /> Relational Physical Schema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schema.tables?.map((table, tIdx) => {
                const isFact = table.name.startsWith('fact_');
                return (
                  <div key={tIdx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    {/* Table Header */}
                    <div className={`p-4 border-b ${
                      isFact 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-900' 
                        : 'bg-indigo-600/10 border-indigo-600/20 text-indigo-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold tracking-tight">{table.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                          isFact 
                            ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' 
                            : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}>
                          {isFact ? 'Fact' : 'Dimension'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        {table.description}
                      </p>
                    </div>

                    {/* Table Body - Columns */}
                    <div className="p-3 divide-y divide-slate-100 text-xs flex-1">
                      {table.columns?.map((col, cIdx) => (
                        <div key={cIdx} className="py-2.5 flex items-start justify-between gap-1.5">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800 font-mono flex items-center gap-1">
                              {col.isPrimaryKey && <Key className="w-3 h-3 text-amber-500" strokeWidth={3} />}
                              {col.isForeignKey && <Key className="w-3 h-3 text-blue-500" strokeWidth={3} />}
                              {col.name}
                            </div>
                            {col.constraints && col.constraints.length > 0 && (
                              <div className="text-[9px] text-slate-400 uppercase font-mono">
                                {col.constraints.join(' | ')}
                              </div>
                            )}
                          </div>

                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <span className="font-mono text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded font-bold">
                              {col.type}
                            </span>
                            {col.isPrimaryKey && (
                              <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded font-bold uppercase font-mono">
                                PK
                              </span>
                            )}
                            {col.isForeignKey && col.referencesTable && (
                              <span className="text-[9px] text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded font-bold uppercase truncate max-w-[120px]" title={`Refs: ${col.referencesTable}(${col.referencesColumn})`}>
                                FK ➔ {col.referencesTable}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relationships section */}
          {schema.relationships && schema.relationships.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-500" /> Key-Referential Integrity Constraints (FK Maps)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schema.relationships.map((rel, rIdx) => (
                  <div key={rIdx} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between text-xs font-mono bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-bold">{rel.fromTable}</span>
                      <span className="text-slate-400">({rel.fromColumn})</span>
                    </div>
                    <div className="flex flex-col items-center px-3 text-[10px] text-indigo-600 font-bold shrink-0 animate-pulse">
                      <span>{rel.type}</span>
                      <span className="text-slate-350 shrink-0">➔</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-bold">{rel.toTable}</span>
                      <span className="text-slate-400">({rel.toColumn})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RATIONALE REASONING BLOCK */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cpu className="w-24 h-24 text-purple-500" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4.5 h-4.5 text-purple-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Explainable Agentic Reasoning
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {schema.reasoning}
        </p>
      </div>

      <AgentReasoningPanel reasoning={reasoning} agentLabel="Data Architect Agent" />
    </div>
  );
}
