/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PITCH_SLIDES, 
  DEVELOPMENT_ROADMAP, 
  JUDGE_QNA, 
  SCOPE_MATRIX, 
  DEMO_STEPS 
} from '../data';
import { 
  Presentation, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Terminal,
  Play,
  ClipboardList,
  Sparkles,
  Zap
} from 'lucide-react';

interface HackathonTabProps {
  onSeedDemo?: () => void;
  isSeeding?: boolean;
}

export function HackathonTab({ onSeedDemo, isSeeding }: HackathonTabProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const prevSlide = () => {
    setActiveSlideIdx(prev => (prev === 0 ? PITCH_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlideIdx(prev => (prev === PITCH_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const activeSlide = PITCH_SLIDES[activeSlideIdx];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 0. Professional Judge One-Click Demonstration Trigger */}
      <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-[-20%] right-[5%] opacity-10 select-none pointer-events-none">
          <Zap className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              ✦ Competition Judge Demo Mode ✦
            </div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Evaluate DataPilot AI under Peak Ingestion Constraints
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Click to bypass manual specifications typing. In 5 seconds, our Multi-Agent Orchestrator will synthesize an extreme-readiness <b>"Global Logistics Fleet Telemetry Predictive Maintenance Suite"</b>, complete with 10 agent reasoning logs, cost matrices, ERD zoom nodes, and Spring Boot templates!
            </p>
          </div>

          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className={`cursor-pointer font-bold select-none text-xs flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl shadow-lg transition active:scale-[0.98] border border-indigo-400/20 shrink-0 ${
              isSeeding ? 'opacity-50 cursor-not-allowed animate-pulse' : 'hover:shadow-indigo-500/15'
            }`}
          >
            <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            <span>🚀 GENERATE HACKATHON DEMO WORKSPACE</span>
          </button>
        </div>
      </div>
      
      {/* 1. Pitch Slides Carousel */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Presentation className="w-5 h-5 text-blue-500" /> Pitch Deck Presentation Slides
        </h3>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white min-h-[380px] flex flex-col justify-between relative">
          
          {/* Azure Accent Border at bottom of slide */}
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>

          {/* Slide Inner Body */}
          <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between space-y-6">
            
            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-blue-400 font-bold tracking-wider">{activeSlide.focus}</span>
                <span className="text-slate-500">Slide {activeSlide.id} of {PITCH_SLIDES.length}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                {activeSlide.title}
              </h2>
              <p className="text-sm text-slate-400 mt-1">{activeSlide.subtitle}</p>
            </div>

            {/* Slide Bullets */}
            <ul className="space-y-2.5 max-w-4xl">
              {activeSlide.bullets.map((b, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <span className="w-4.5 h-4.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 font-bold flex items-center justify-center text-xs mt-0.5">
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Slide Footer Layer info */}
            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-500 font-mono">datapilot-ai-pitchboard</span>
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 font-semibold text-slate-200 rounded text-[10px] uppercase font-mono tracking-wider">
                Platform: {activeSlide.azureAlloy}
              </span>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="bg-slate-950/80 px-6 py-3 flex items-center justify-between border-t border-slate-850 shrink-0">
            <button
              onClick={prevSlide}
              className="p-1 px-3 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex gap-1.5">
              {PITCH_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeSlideIdx === idx ? 'bg-blue-500 w-4' : 'bg-slate-750'
                  }`}
                ></button>
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-1 px-3 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Step-by-Step Demo Script Guide */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-600 animate-pulse" /> Live Pitch & Demo Script (5-Minute Outline)
        </h3>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-emerald-50 border-b border-rose-50/10 flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
            <Play className="w-4 h-4 fill-current text-emerald-600" /> Executive Demo Runbook for Presenters
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto p-2">
            {DEMO_STEPS.map((step) => (
              <div key={step.stepNumber} className="p-4 space-y-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    {step.stepNumber}
                  </span>
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-tight">{step.title}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7 text-xs text-slate-600 leading-normal">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Presenter Action</span>
                    <p>{step.action}</p>
                  </div>
                  <div className="p-2.5 bg-blue-50/30 border border-blue-50/80 rounded-lg space-y-1">
                    <span className="font-bold text-blue-500 uppercase text-[9px] block text-blue-600">What to Say</span>
                    <p className="italic text-slate-700">"{step.say}"</p>
                  </div>
                  <div className="p-2.5 bg-green-50/30 border border-green-55 rounded-lg space-y-1">
                    <span className="font-bold text-green-700 uppercase text-[9px] block">Judges Verify</span>
                    <p>{step.verify}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Judge Interrogation Q&A */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-500" /> Judge Interrogation Q&A
          </h3>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
            {JUDGE_QNA.map((qna, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-2.5">
                <div className="font-bold text-xs text-purple-700 flex items-start gap-1.5 leading-snug">
                  <span className="shrink-0 mt-0.5">Q:</span>
                  <span>{qna.question}</span>
                </div>
                <div className="text-xs text-slate-600 border-t border-slate-100 pt-2 flex items-start gap-1.5 leading-relaxed">
                  <span className="font-bold shrink-0 text-slate-400">A:</span>
                  <p>{qna.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Development Roadmap & MVP vs Stretch Scope */}
        <div className="space-y-6">
          {/* Phase Roadmap list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-blue-500" /> Project Milestones Timeline
            </h3>

            <div className="space-y-3.5">
              {DEVELOPMENT_ROADMAP.map((mile, mIdx) => (
                <div key={mIdx} className="flex items-start gap-3 text-xs leading-normal">
                  <div className="relative pt-1">
                    {mile.status === "Completed" ? (
                      <div className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 bg-blue-55 text-blue-500 border border-blue-200 rounded-full flex items-center justify-center font-bold text-[9px] animate-pulse">
                        ⌛
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1 pb-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-800">{mile.phase}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{mile.timeline}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1 text-[11px] leading-relaxed">
                      {mile.tasks.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MVP vs Stretch Scope definition */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ClipboardList className="w-4.5 h-4.5 text-blue-500" /> Capability Boundaries Grid
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-2">
                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase text-[10px] font-mono tracking-wider">
                  ✓ Hackathon MVP
                </span>
                <ul className="list-none space-y-1.5 pl-0 text-slate-500 text-[11px] leading-relaxed">
                  {SCOPE_MATRIX.mvp.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-550 shrink-0">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase text-[10px] font-mono tracking-wider">
                  ✦ Stretch Targets
                </span>
                <ul className="list-none space-y-1.5 pl-0 text-slate-500 text-[11px] leading-relaxed">
                  {SCOPE_MATRIX.stretch.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-indigo-400 shrink-0">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
