import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Cpu, 
  Bot, 
  Activity, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Coins, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  Table, 
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Gauge,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'architect';
  text: string;
  timestamp: string;
  data?: ArchitectResponse;
}

interface ArchitectResponse {
  decisionSummary: string;
  reasoning: string;
  assumptions: string[];
  tradeoffs: string[];
  alternatives: string[];
  confidenceScore: number;
  mainExplanation: string;
  extraMetadata?: {
    type: "standard_chat" | "review" | "judge" | "challenge";
    judgeQuestions?: { question: string; answer: string; }[];
    reviewScorecard?: {
      strengths: string[];
      weaknesses: string[];
      risks: string[];
      missingComponents: string[];
      readinessScore: number;
      judgeScore: number;
    };
  };
}

interface ArchitectChatProps {
  projectId: string;
  activeTab: string;
  projectName: string;
}

export function ArchitectChat({ projectId, activeTab, projectName }: ArchitectChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'model'; text: string; }[]>([]);
  
  // Interactive accordions inside the chat panel
  const [expandedSection, setExpandedSection] = useState<'challenges' | 'suggestions' | 'none'>('suggestions');
  const [expandedJudgeIdx, setExpandedJudgeIdx] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message from the Lead Solution Architect
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'architect',
          text: `Greetings, Team! I am DataPilot's **Lead Enterprise Solution Architect Advisor**.\n\nI act as your explainability framework on top of our generated architectures.\n\nChallenge my choices, ask about cost impacts, scale bounds, or standard security constraints.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: {
            decisionSummary: "Lead Enterprise Architect Companion online.",
            reasoning: "Standing by to provide structural explainability across all DataPilot generated outputs.",
            assumptions: ["Assumes enterprise compliance (GDPR/SOC2) is a business mandate."],
            tradeoffs: ["Provides higher explainability at the cost of sidebar real estate."],
            alternatives: ["Standard plain-text chat templates with zero context retrieval."],
            confidenceScore: 99,
            mainExplanation: "Use the interactive panels below to **Review Entire Solution**, **Simulate Judge Questions**, or select specific **Challenge Options** (like Serverless Postgres MongoDB, or Event-Driven patterns)."
          }
        }
      ]);
    }
  }, [projectId]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Context-Aware Suggested Questions list based on active view tab
  const getSuggestedQuestions = () => {
    switch (activeTab) {
      case 'schema':
        return [
          { label: "Why this schema?", q: "Explain the current database schema strategy. Why was this layout selected?" },
          { label: "Explain normalization decisions", q: "Why did you structure this in third normal form (3NF) relational nodes? Explain normalization decisions." },
          { label: "What are the tradeoffs?", q: "What are the core schema modeling tradeoffs in this star-schema?" },
          { label: "Generate a NoSQL alternative", q: "How would you rewrite this schema/database structure as a NoSQL document database alternative?" },
          { label: "Optimize for scalability", q: "How can we optimize these table schemas for extremely rapid write scaling?" }
        ];
      case 'sql':
        return [
          { label: "Explain this query", q: "Translate and explain the execution path of the generated analytical reporting queries." },
          { label: "Improve performance", q: "Suggest execution tuning parameters, clusters, and index parameters to improve performance." },
          { label: "Create indexed version", q: "Generate the SQL DDL statements creating composite indices for the filters." },
          { label: "Reduce execution cost", q: "How can we structure our analytical aggregates to reduce active execution cost on production?" }
        ];
      case 'pipeline':
        return [
          { label: "Why Medallion Architecture?", q: "Why did you select the Medallion (Bronze-Silver-Gold) Spark architecture over a classic staging ETL?" },
          { label: "Cheaper alternative", q: "How can we redesign our Fabric/OneLake data pipeline to minimize monthly pipeline charges?" },
          { label: "More scalable alternative", q: "How would you design this data pipeline to process 10,000 continuous Kafka events per second?" },
          { label: "Azure Synapse alternative", q: "What does this gold delta pipeline look like inside Azure Synapse Dedicated SQL clusters?" },
          { label: "Snowflake alternative", q: "Explain how to migrate this OneLake setup to run over a Snowflake stage directory." }
        ];
      case 'javasdk':
        return [
          { label: "Explain Spring Boot layout", q: "Explain how Spring Boot handles JPA transactions over these fact and dimension entities." },
          { label: "How can this connect to AWS?", q: "What application properties are required to connect this Spring template to an AWS RDS instance?" },
          { label: "Secure Database credentials", q: "How can we secure database passwords in production using secure enterprise properties?" }
        ];
      default:
        return [
          { label: "Why PostgreSQL?", q: "Why did we select PostgreSQL instead of other engines for our transactions?" },
          { label: "Why Fabric instead of Synapse?", q: "What are the architectural benefits of using Microsoft Fabric instead of standard Azure Synapse?" },
          { label: "How would you design for Healthcare?", q: "How would you redesign this entire solution to support clinical Healthcare (HIPAA constraints)?" },
          { label: "How would you design for Banking?", q: "How would you scale and redesign this schema for a Banking Ledger (PCI-DSS)?" }
        ];
    }
  };

  // Dispatch API Call for Chat/Evaluation Actions
  const handleAction = async (messageText: string, customAction?: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setExpandedJudgeIdx(null); // Clear judge expand state

    // If text is not provided, use action label
    const userMsg = messageText || `Trigger architect challenge: ${customAction}`;
    
    // Add User Message to listing
    const newUserMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: userMsg,
          history,
          activeTab,
          action: customAction
        })
      });

      if (response.ok) {
        const data: ArchitectResponse = await response.json();
        
        // Append model response to stream
        const mainTextSummary = data.mainExplanation || "Architect evaluation trace completed.";
        
        const newArchitectMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'architect',
          text: mainTextSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: data
        };

        setMessages(prev => [...prev, newArchitectMessage]);
        
        // Update history
        setHistory(prev => [
          ...prev, 
          { role: 'user', text: userMsg },
          { role: 'model', text: JSON.stringify(data) }
        ]);
      } else {
        const failMessage: Message = {
          id: 'error_' + Math.random().toString(36).substr(2, 9),
          sender: 'architect',
          text: "Forgive me. I encountered a pipeline parsing bottleneck while reviewing the artifacts. Let me analyze that statement again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, failMessage]);
      }
    } catch (e) {
      console.error(e);
      const failMessage: Message = {
        id: 'error_network',
        sender: 'architect',
        text: "Direct feedback channel interrupted. Let me reconstruct our reasoning stream once network binds initialize.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, failMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    handleAction(inputText, 'chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderEvaluatedText = (text: string) => {
    // Basic formatting helper for markdown display logs
    return text.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2 first:mt-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} className="text-xs font-bold text-slate-700 mt-3 mb-1 first:mt-1">{line.replace('#### ', '')}</h5>;
      }
      // Bullet points
      if (line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="text-xs text-slate-650 ml-4 list-disc mb-1 leading-relaxed">
            {line.trim().replace('- ', '')}
          </li>
        );
      }
      if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
        return (
          <li key={idx} className="text-xs text-slate-650 ml-4 list-decimal mb-1 leading-relaxed">
            {line.trim().replace(/^\d+\.\s+/, '')}
          </li>
        );
      }
      // Code or quotes block
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-indigo-400 bg-slate-50 p-2 my-2 rounded text-[11px] text-slate-600 italic">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Table content separation
      if (line.startsWith('|')) {
        // Simple visual divider
        return null; 
      }
      // Line formatting
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      
      return <p key={idx} className="text-xs text-slate-650 leading-relaxed mb-2">{line}</p>;
    });
  };

  const CHALLENGE_OPTIONS = [
    { id: 'cheaper', label: "Cheaper Host", icon: <Coins className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'scalable', label: "10M Scalability", icon: <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'secure', label: "Enterprise Secure", icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'availability', label: "High Availability", icon: <Layers className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'fabric', label: "Fabric Alternative", icon: <Cpu className="w-3.5 h-3.5 text-pink-500" /> },
    { id: 'synapse', label: "Synapse Setup", icon: <Table className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'mongodb', label: "MongoDB NoSQL", icon: <Brain className="w-3.5 h-3.5 text-teal-500" /> },
    { id: 'event_driven', label: "Event-PubSub", icon: <Activity className="w-3.5 h-3.5 text-rose-500" /> },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="btn_datapilot_chat_toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:scale-105 active:scale-95 transition-all text-sm font-semibold uppercase tracking-wider select-none focus:outline-none border border-indigo-500 cursor-pointer"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <Bot className="w-4.5 h-4.5 shrink-0" />
        <span>Ask DataPilot</span>
      </button>

      {/* Slide-out Sidebar Panel */}
      <div
        id="pnl_datapilot_architect_sidebar"
        className={`fixed top-0 right-0 h-screen sm:w-[480px] w-full bg-slate-50 border-l border-slate-200 shadow-[0_0_30px_rgba(15,23,42,0.15)] z-40 flex flex-col transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm relative">
          <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-600"></div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Architect Assistant
                </h3>
                <span className="px-1.5 py-0.5 bg-slate-150 rounded text-[8px] uppercase tracking-widest text-slate-500 font-mono">
                  Advisor
                </span>
              </div>
              <p className="text-[10px] text-slate-450 truncate max-w-[280px]">
                Auditing & justifying: <span className="font-bold text-slate-600">{projectName}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Global Action Controls Panel */}
        <div className="p-4.5 bg-white border-b border-slate-150 grid grid-cols-2 gap-2 text-xs shrink-0 select-none">
          <button
            onClick={() => handleAction("Review my entire analytics pipeline and SDK deliverables to calculate an overall score.", "review")}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 border border-indigo-100 hover:border-indigo-200 font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Review Solution
          </button>
          
          <button
            onClick={() => handleAction("Simulate 10 intense hackathon judge questions testing limits and provide optimal answers.", "judge")}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-100 hover:border-emerald-200 font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            Simulate Judges
          </button>
        </div>

        {/* Primary Interactive Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name tag */}
              <div className="flex items-center gap-1 mb-1 text-[10px] font-mono font-bold tracking-wide text-slate-400">
                {msg.sender === 'user' ? (
                  <span>YOU</span>
                ) : (
                  <>
                    <Cpu className="w-3 h-3 text-indigo-500 animate-pulse" />
                    <span>DATA-PILOT EA ADVISOR</span>
                    <span className="text-[8px] text-slate-350">{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Payload bubble */}
              <div
                className={`max-w-[92%] rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-slate-100 border-slate-700 rounded-tr-none'
                    : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                }`}
              >
                {/* User Message just plain rendering */}
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-4">
                    {/* Visual MD description Text */}
                    <div className="prose prose-sm max-w-none">
                      {renderEvaluatedText(msg.text)}
                    </div>

                    {/* Reasoning Investigator Card injection */}
                    {msg.data && (
                      <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50 text-xs">
                        {/* Header banner */}
                        <div className="bg-slate-800 px-3 py-2 text-white flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-wider font-mono">
                              Architect Reasoning trace
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500 text-[10px] font-bold font-mono">
                            <Gauge className="w-3 h-3 text-white" />
                            <span>{msg.data.confidenceScore}%</span>
                          </div>
                        </div>

                        {/* Card Blocks */}
                        <div className="p-3 space-y-2.5">
                          {/* Decision Summary */}
                          <div>
                            <span className="text-[10px] uppercase font-mono font-black text-slate-400 block tracking-wide">
                              Decision Summary
                            </span>
                            <div className="text-xs font-bold text-slate-850 flex items-center gap-1.5 mt-0.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <p>{msg.data.decisionSummary}</p>
                            </div>
                          </div>

                          {/* Technical Reasoning */}
                          <div>
                            <span className="text-[10px] uppercase font-mono font-black text-slate-400 block tracking-wide">
                              Logical Reasoning
                            </span>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed italic">
                              "{msg.data.reasoning}"
                            </p>
                          </div>

                          {/* Accordion List details */}
                          <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-200">
                            {/* Assumptions */}
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wide block mb-0.5">
                                Critical Assumptions
                              </span>
                              <div className="space-y-1">
                                {msg.data.assumptions.map((asm, i) => (
                                  <div key={i} className="flex items-start gap-1 text-[10px] text-slate-650">
                                    <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                                    <p className="leading-tight">{asm}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tradeoffs */}
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wide block mb-0.5">
                                Tradeoffs & Compromises
                              </span>
                              <div className="space-y-1">
                                {msg.data.tradeoffs.map((td, i) => (
                                  <div key={i} className="flex items-start gap-1 text-[10px] text-slate-650">
                                    <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
                                    <p className="leading-tight">{td}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Alternatives */}
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wide block mb-0.5">
                                Candidate Alternatives
                              </span>
                              <div className="space-y-1">
                                {msg.data.alternatives.map((alt, i) => (
                                  <div key={i} className="flex items-start gap-1 text-[10px] text-slate-650">
                                    <span className="text-emerald-500 mt-0.5 shrink-0">↪</span>
                                    <p className="leading-tight font-medium">{alt}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Scorecard injection */}
                          {msg.data.extraMetadata?.type === "review" && msg.data.extraMetadata.reviewScorecard && (
                            <div className="mt-3.5 p-3 bg-indigo-50 border border-indigo-150 rounded-xl space-y-3 font-sans">
                              {/* Title */}
                              <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5">
                                <span className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5" />
                                  Enterprise Audit Scorecard
                                </span>
                              </div>
                              
                              {/* Double Score dials */}
                              <div className="grid grid-cols-2 gap-3.5 py-1 text-center">
                                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-widest block">Readiness</span>
                                  <span className="text-xl font-black text-indigo-700 mt-0.5 block">
                                    {msg.data.extraMetadata.reviewScorecard.readinessScore}/100
                                  </span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-widest block">Judge Index</span>
                                  <span className="text-xl font-black text-emerald-600 mt-0.5 block">
                                    {msg.data.extraMetadata.reviewScorecard.judgeScore}/100
                                  </span>
                                </div>
                              </div>

                              {/* bullet metrics */}
                              <div className="space-y-2 text-[10.5px]">
                                <div>
                                  <span className="font-bold text-indigo-800 block">✓ Strengths</span>
                                  <ul className="list-disc pl-3.5 text-slate-600 leading-normal space-y-0.5">
                                    {msg.data.extraMetadata.reviewScorecard.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <span className="font-bold text-amber-700 block">⚠ Weaknesses & Risks</span>
                                  <ul className="list-disc pl-3.5 text-slate-600 leading-normal space-y-0.5">
                                    {msg.data.extraMetadata.reviewScorecard.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    {msg.data.extraMetadata.reviewScorecard.risks.map((r, i) => <li key={i}>{r}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <span className="font-bold text-purple-700 block">+ Missing Components</span>
                                  <ul className="list-disc pl-3.5 text-slate-600 leading-normal space-y-0.5">
                                    {msg.data.extraMetadata.reviewScorecard.missingComponents.map((m, i) => <li key={i}>{m}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Judge Questions rendering */}
                          {msg.data.extraMetadata?.type === "judge" && msg.data.extraMetadata.judgeQuestions && (
                            <div className="mt-3.5 space-y-2 font-sans select-none">
                              <span className="font-extrabold text-[11px] text-slate-700 uppercase tracking-widest block border-b border-slate-200 pb-1 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                                Interactive Judge Questions (10)
                              </span>
                              
                              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                {msg.data.extraMetadata.judgeQuestions.map((jq, idx) => (
                                  <div key={idx} className="border border-slate-200 rounded-lg bg-white overflow-hidden text-[11px]">
                                    <button 
                                      onClick={() => setExpandedJudgeIdx(expandedJudgeIdx === idx ? null : idx)}
                                      className="w-full text-left p-2 bg-slate-50 hover:bg-indigo-50 font-semibold text-slate-800 flex justify-between items-center transition-colors cursor-pointer"
                                    >
                                      <span>Q{idx + 1}: {jq.question}</span>
                                      {expandedJudgeIdx === idx ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                                    </button>
                                    
                                    {expandedJudgeIdx === idx && (
                                      <div className="p-2.5 border-t border-slate-100 bg-white leading-relaxed text-slate-650 leading-normal font-sans italic p-3">
                                        <strong>Optimal Answer:</strong> {jq.answer}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Skeleton Bot loading item */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 mb-1 text-[10px] font-mono font-bold tracking-wide text-slate-400">
                <Cpu className="w-3 h-3 text-indigo-500 animate-spin" />
                <span>ARCHITECT EVALUATING TRACE...</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 w-5/6 flex space-x-3 items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border animate-pulse shrink-0">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-150 rounded w-5/6 animate-pulse" />
                  <div className="h-3.5 bg-slate-150 rounded w-2/3 animate-pulse" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Collapsible Utility Rails */}
        <div className="bg-white border-t border-slate-200 text-xs shrink-0 select-none">
          {/* Challenge-the-AI accordions panel */}
          <div className="border-b border-slate-150">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'challenges' ? 'none' : 'challenges')}
              className="w-full text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 font-bold uppercase tracking-wider text-slate-650 flex justify-between items-center border-b border-transparent cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[10px] tracking-widest text-slate-500">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Challenge the AI Advisor
              </span>
              {expandedSection === 'challenges' ? <ChevronUp className="w-3.5 h-3.5 text-slate-450" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-450" />}
            </button>
            
            {expandedSection === 'challenges' && (
              <div className="p-3 bg-slate-50 border-t border-slate-150 grid grid-cols-2 gap-1.5">
                {CHALLENGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleAction(`Please formulate an alternate model using ${opt.label} parameters. What differs?`, opt.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 active:scale-95 disabled:opacity-50 text-[10px] font-semibold text-slate-700 border border-slate-200 rounded-lg shadow-sm transition-all text-left truncate cursor-pointer"
                  >
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Context Suggested Questions Panel */}
          <div>
            <button 
              onClick={() => setExpandedSection(expandedSection === 'suggestions' ? 'none' : 'suggestions')}
              className="w-full text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 font-bold uppercase tracking-wider text-slate-650 flex justify-between items-center cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[10px] tracking-widest text-slate-500">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                suggested for: <span className="text-indigo-700 lowercase font-mono">active {activeTab}</span>
              </span>
              {expandedSection === 'suggestions' ? <ChevronUp className="w-3.5 h-3.5 text-slate-450" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-450" />}
            </button>
            
            {expandedSection === 'suggestions' && (
              <div className="p-3 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-1.5">
                {getSuggestedQuestions().map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(item.q, 'chat')}
                    disabled={isLoading}
                    className="text-[10px] py-1 px-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-800 font-semibold border border-indigo-100 rounded-lg cursor-pointer transition-colors"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input box */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2 shadow-inner shrink-0 relative">
          <input
            id="txt_datapilot_chat_input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder={isLoading ? "Re-structuring parameters..." : "Challenge pg selection... Why Star schema?"}
            className="flex-1 px-3 py-2.5 text-xs border border-slate-200 hover:border-slate-350 focus:border-indigo-500 rounded-xl focus:outline-none bg-slate-50 hover:bg-white focus:bg-white text-slate-800 transition-colors disabled:placeholder-slate-300"
          />
          <button
            id="btn_datapilot_chat_send"
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-350 border border-indigo-600 disabled:border-slate-150 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
