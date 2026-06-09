/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import { PRESET_TEMPLATES } from '../data';
import { 
  Play, 
  Sparkles, 
  FolderOpen, 
  Trash2, 
  Lightbulb, 
  Layers 
} from 'lucide-react';

interface LandingTabProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onSubmitRequirements: (name: string, text: string) => void;
  isAnalyzing: boolean;
}

export function LandingTab({
  projects,
  activeProject,
  onSelectProject,
  onDeleteProject,
  onSubmitRequirements,
  isAnalyzing
}: LandingTabProps) {
  const [name, setName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const handleSelectPreset = (idx: number) => {
    setActivePreset(idx);
    setName(`Smart ${PRESET_TEMPLATES[idx].name}`);
    setRequirements(PRESET_TEMPLATES[idx].text);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !requirements.trim()) return;
    onSubmitRequirements(name, requirements);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Microsoft Agents League Entry
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
            Transform Requirements Into Core Architectures
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            DataPilot AI leverages 4 specialized reasoning agents to convert unstructured operational business requests into 3NF schema tables, ready-to-run optimized SQL reporting metrics, and modern Microsoft Fabric Lakehouse pipelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Scope Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Design New Analytics Platform
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail Inventory Control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Business Scope & Metrics Statement
                </label>
                <textarea
                  rows={6}
                  placeholder="Describe your data pipeline inputs, operational events, tracking metrics, and processing SLAs..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 font-sans leading-relaxed"
                  required
                ></textarea>
              </div>

              {/* In-app guidelines summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-600">
                <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Multi-Agent Handshake Mode:</span> We serialize requirements through 4 isolated processes. They design normalization models, draft window functions, analyze indexing strategies, and construct the Fabric medallion flow sequentially.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing || !name.trim() || !requirements.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Collaborative Agents...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Initiate Collaborative Enterprise Agents
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Presets Cards Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" /> Apply Corporate Use-Case Presets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  disabled={isAnalyzing}
                  className={`text-left p-4 rounded-xl border transition shadow-sm cursor-pointer hover:border-blue-300 hover:bg-slate-50/50 ${
                    activePreset === idx 
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <h4 className="font-semibold text-sm text-slate-800 flex items-center justify-between">
                    {tmpl.name}
                    {activePreset === idx && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <FolderOpen className="w-4.5 h-4.5 text-blue-600" />
              Project Catalog History
            </h2>
            
            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No telemetry projects captured yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {projects.map((proj) => {
                  const isActive = activeProject?.id === proj.id;
                  return (
                    <div
                      key={proj.id}
                      className={`group flex items-center justify-between p-3 rounded-lg border transition ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <button
                        onClick={() => onSelectProject(proj)}
                        className="text-left flex-1 cursor-pointer min-w-0"
                      >
                        <div className="font-semibold text-xs text-slate-800 truncate">
                          {proj.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(proj.createdAt).toLocaleDateString()} • {proj.status}
                        </div>
                      </button>

                      {/* We prevent deleting default preloaded data for solid demos! */}
                      {proj.id !== "proj_ecommerce_sales" && (
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-1 px-2 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Purge analysis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="text-[11px] text-slate-400 leading-normal border-t border-slate-100 pt-3">
              * The catalog keeps record state persisted over local disk files, enabling recovery across test scenarios.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
