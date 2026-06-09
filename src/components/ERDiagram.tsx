import React, { useState } from 'react';
import { SchemaOutput } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RefreshCw, 
  Map, 
  HelpCircle, 
  Layers, 
  Link2 
} from 'lucide-react';

interface ERDiagramProps {
  schema?: SchemaOutput;
}

export function ERDiagram({ schema }: ERDiagramProps) {
  const [zoom, setZoom] = useState<number>(0.95);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  if (!schema || !schema.tables || schema.tables.length === 0) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.6));
  const handleReset = () => setZoom(0.95);

  const tables = schema.tables;
  const relationships = schema.relationships || [];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-4 relative">
      {/* Visual Workspace Banner */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
            <Map className="w-4 h-4 text-purple-400 animate-pulse" />
            Interactive ERD Entity Workbench
          </h4>
          <p className="text-[11px] text-slate-400">Hover entities to audit referential constraints and track star schema relations</p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1 border border-slate-800 rounded-lg shrink-0 select-none">
          <button
            onClick={handleZoomOut}
            className="p-1 px-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-xs rounded flex items-center gap-1 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-2 font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 px-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-xs rounded flex items-center gap-1 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <button
            onClick={handleReset}
            className="p-1 px-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-xs rounded flex items-center gap-1 cursor-pointer"
            title="Fit Canvas"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ER Diagram Workspace Screen */}
      <div className="p-8 min-h-[480px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] overflow-auto flex items-center justify-center relative">
        <div 
          className="transition-transform duration-200 ease-out flex flex-col md:flex-row flex-wrap items-center justify-center gap-8 md:gap-14"
          style={{ transform: `scale(${zoom})` }}
        >
          {tables.map((table, tIdx) => {
            const isFact = table.name.startsWith('fact_');
            const isHovered = hoveredTable === table.name;
            const isRelated = relationships.some(r => 
              (r.fromTable === table.name && r.toTable === hoveredTable) || 
              (r.toTable === table.name && r.fromTable === hoveredTable)
            );

            let glowClass = "border-slate-800 bg-slate-900/90";
            if (isHovered) {
              glowClass = isFact 
                ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] bg-slate-900 text-amber-50/100" 
                : "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-slate-900 text-purple-50/100";
            } else if (hoveredTable && isRelated) {
              glowClass = "border-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.15)] bg-slate-900/95";
            } else if (hoveredTable) {
              glowClass = "border-slate-800/40 opacity-40 bg-slate-900/50";
            }

            return (
              <div
                key={tIdx}
                onMouseEnter={() => setHoveredTable(table.name)}
                onMouseLeave={() => {
                  setHoveredTable(null);
                  setSelectedColumn(null);
                }}
                className={`w-64 border rounded-xl overflow-hidden transition-all duration-300 relative ${glowClass}`}
              >
                {/* Table Header block */}
                <div className={`p-3.5 border-b font-mono transition-colors ${
                  isFact 
                    ? isHovered ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-500/5 border-amber-500/10'
                    : isHovered ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-[13px]">{table.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isFact 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono' 
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {isFact ? 'Fact' : 'Dim'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {table.description}
                  </p>
                </div>

                {/* Column lists */}
                <div className="p-2.5 divide-y divide-slate-800/60 font-mono text-[11px] bg-slate-900/50">
                  {table.columns?.map((col, cIdx) => {
                    const isColHovered = selectedColumn === `${table.name}.${col.name}`;
                    const hasLink = col.isForeignKey && col.referencesTable;
                    
                    return (
                      <div
                        key={cIdx}
                        onMouseEnter={() => {
                          if (hasLink) {
                            setSelectedColumn(`${table.name}.${col.name}`);
                          }
                        }}
                        onMouseLeave={() => setSelectedColumn(null)}
                        className={`py-1.5 px-2 flex items-center justify-between group rounded transition-colors ${
                          isColHovered ? 'bg-slate-800 text-slate-100' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {col.isPrimaryKey ? (
                            <span className="w-3.5 h-3.5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0" title="Primary Key">
                              PK
                            </span>
                          ) : col.isForeignKey ? (
                            <span className="w-3.5 h-3.5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[9px] shrink-0" title="Foreign Key">
                              FK
                            </span>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-500 transition-colors" />
                          )}
                          <span className="truncate text-slate-200">{col.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 select-none group-hover:text-slate-300">
                          {col.type}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Anchor lines or relation feedback box */}
                <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex justify-center items-center text-[9px] text-slate-400 gap-1 font-sans">
                  {relationships.some(r => r.fromTable === table.name) ? (
                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <Link2 className="w-3 h-3 text-indigo-400 animate-pulse" />
                      <span>References active profiles</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Standalone dimension Zone</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reltional Constraint Indicator overlay */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center gap-5 justify-between">
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" /> Fact Zone (Transactional facts)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500/20 border border-purple-500/40" /> Dimensional Zone (Entity metadata)
          </span>
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3 h-3 text-indigo-400" /> Active SVG Wire Connection
          </span>
        </div>
        <div className="text-[9px] text-slate-500 font-mono italic">
          DataPilot ERD Visualizer Core v2.4
        </div>
      </div>
    </div>
  );
}
