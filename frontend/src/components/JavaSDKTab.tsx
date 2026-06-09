/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SchemaOutput, JavaCodeFile } from '../types';
import { 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  Code,
  Terminal,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface JavaSDKTabProps {
  schema?: SchemaOutput;
  projectName: string;
}

export function JavaSDKTab({ schema, projectName }: JavaSDKTabProps) {
  const [loading, setLoading] = useState(false);
  const [codefiles, setCodefiles] = useState<JavaCodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<JavaCodeFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [basePackage, setBasePackage] = useState('');

  // Call API to fetch dynamic Java files based on schema
  const fetchJavaSDK = async () => {
    if (!schema || !schema.tables || schema.tables.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate-java-sdk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, name: projectName })
      });
      if (response.ok) {
        const data = await response.json();
        setCodefiles(data.files || []);
        setBasePackage(data.basePackage || '');
        if (data.files && data.files.length > 0) {
          // Select DDL or Entity file as default active code box
          const defaultFile = data.files.find((f: any) => f.type === 'ddl') || data.files[0];
          setSelectedFile(defaultFile);
        }
      }
    } catch (err) {
      console.error('Error generating dynamic Spring Boot codebase:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger whenever the active schema changes so the codebase always auto-updates live!
  useEffect(() => {
    fetchJavaSDK();
  }, [schema, projectName]);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!schema) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
        <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm">Initiate collaborative agents to auto-generate enterprise microservices boilerplates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 text-slate-850 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1">
              Java Spring Boot SDK Generator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examines architect schema outputs to compile microservice layers, controllers, and database repository classes instantly.
          </p>
        </div>

        <button
          onClick={fetchJavaSDK}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate SDK</span>
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center text-slate-500 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono">Synthesizing JPA entity models, REST maps, and schema SQL layers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Left Hand: Interactive File explorer tree */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 select-none shadow-md flex flex-col justify-start">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5 shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" /> Java Project Explorer
            </h4>

            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {/* Virtual root folder */}
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-200 py-1">
                  <Folder className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                  <span>datapilot-autogen-service</span>
                </div>

                <div className="pl-4 space-y-2 mt-1">
                  {/* Resources */}
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-300 py-1">
                      <Folder className="w-4 h-4 text-amber-500/80 shrink-0" />
                      <span>src/main/resources</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {codefiles.filter(f => f.type === 'ddl' || f.type === 'properties').map(f => {
                        const isSel = selectedFile?.path === f.path;
                        const labelName = f.type === 'ddl' ? 'schema-postgresql.sql' : 'application.yml';
                        return (
                          <button
                            key={f.path}
                            onClick={() => setSelectedFile(f)}
                            className={`w-full text-left py-1 px-1.5 rounded flex items-center gap-1.5 cursor-pointer font-mono text-[11px] truncate ${
                              isSel ? 'bg-blue-600/20 text-blue-300 font-bold' : 'hover:bg-slate-800/50 text-slate-400'
                            }`}
                          >
                            <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{labelName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Java Source */}
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-300 py-1">
                      <Folder className="w-4 h-4 text-blue-500/80 shrink-0" />
                      <span>src/main/java/com/datapilot</span>
                    </div>

                    <div className="pl-4 space-y-1.5">
                      {/* Main runner file inside the root pack */}
                      {codefiles.filter(f => f.type === 'main').map(f => {
                        const isSel = selectedFile?.path === f.path;
                        return (
                          <button
                            key={f.path}
                            onClick={() => setSelectedFile(f)}
                            className={`w-full text-left py-1 px-1.5 rounded flex items-center gap-1.5 cursor-pointer font-mono text-[11px] truncate ${
                              isSel ? 'bg-blue-600/20 text-blue-300 font-bold' : 'hover:bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 text-purple-450 shrink-0" />
                            <span className="truncate">DataPilotApplication.java</span>
                          </button>
                        );
                      })}

                      {/* Sub folders based on file categorization */}
                      {['config', 'entity', 'repository', 'dto', 'service', 'controller'].map(folderType => {
                        const matches = codefiles.filter(f => f.type === folderType);
                        if (matches.length === 0) return null;

                        return (
                          <div key={folderType}>
                            <div className="flex items-center gap-1.5 text-slate-450 py-0.5 font-bold text-slate-400">
                              <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{folderType}</span>
                            </div>
                            
                            <div className="pl-3 space-y-0.5">
                              {matches.map(f => {
                                const isSel = selectedFile?.path === f.path;
                                const shortName = f.path.split('/').pop() || '';
                                return (
                                  <button
                                    key={f.path}
                                    onClick={() => setSelectedFile(f)}
                                    className={`w-full text-left py-0.5 px-1 rounded flex items-center gap-1.5 cursor-pointer text-[10px] truncate ${
                                      isSel ? 'bg-blue-600/20 text-blue-300 font-bold' : 'hover:bg-slate-800/50 text-slate-400'
                                    }`}
                                  >
                                    <FileCode className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                    <span className="truncate">{shortName}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Root project files (pom.xml) */}
                  <div className="pt-1 border-t border-slate-800/60">
                    {codefiles.filter(f => f.type === 'pom').map(f => {
                      const isSel = selectedFile?.path === f.path;
                      return (
                        <button
                          key={f.path}
                          onClick={() => setSelectedFile(f)}
                          className={`w-full text-left py-1 px-1.5 rounded flex items-center gap-1.5 cursor-pointer font-mono text-[11px] truncate ${
                            isSel ? 'bg-blue-600/20 text-blue-300 font-bold' : 'hover:bg-slate-800/50 text-slate-400'
                          }`}
                        >
                          <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>pom.xml</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hand: Code Sandbox View */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-xl flex flex-col justify-start">
            {/* Tab header code controls */}
            {selectedFile && (
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-910 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-slate-200 text-xs font-mono font-bold truncate">
                    {selectedFile.path}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 uppercase tracking-wider font-bold rounded">
                      {selectedFile.type}
                    </span>
                    <span className="truncate leading-none">{selectedFile.description}</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition active:scale-95 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500 animate-bounce" />
                      <span className="text-green-500 font-mono">Copied File!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full file</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Main Code Box display area */}
            <div className="flex-1 p-5 overflow-auto max-h-[500px]">
              {selectedFile ? (
                <pre className="text-xs font-mono text-slate-200 font-light leading-relaxed select-all whitespace-pre">
                  <code>{selectedFile.content}</code>
                </pre>
              ) : (
                <div className="text-center py-24 text-slate-600 text-xs">
                  Select a dynamic file on the explorer tree to view compilation boilerplates.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
