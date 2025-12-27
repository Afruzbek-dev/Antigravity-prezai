
import React, { useState } from 'react';
import { Language, AppState, InputType } from './types';
import { LANGUAGES } from './constants';
import { generatePresentation } from './services/geminiService';
import SlideViewer from './components/SlideViewer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputText: '',
    language: 'EN',
    inputType: 'document',
    isProcessing: false,
    isThinkingEnabled: false,
    error: null,
    presentation: null,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, inputText: e.target.value, error: null }));
  };

  const handleLangChange = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const setInputType = (type: InputType) => {
    setState(prev => ({ ...prev, inputType: type, error: null }));
  };

  const toggleThinking = () => {
    setState(prev => ({ ...prev, isThinkingEnabled: !prev.isThinkingEnabled }));
  };

  /**
   * Robust clipboard paste implementation with permission handling
   */
  const handleClipboardPaste = async () => {
    try {
      // Check if the Clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('Clipboard API not supported in this browser or context.');
      }

      const text = await navigator.clipboard.readText();
      if (!text) {
        setState(prev => ({ ...prev, error: 'Clipboard is empty.' }));
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        inputText: text, 
        error: null 
      }));
    } catch (err: any) {
      console.error('Clipboard access error:', err);
      // Detailed error messages based on common failures
      let errorMessage = 'Could not access clipboard. Please paste manually (Ctrl+V).';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Clipboard access denied. Please allow permissions or paste manually.';
      }
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ ...prev, inputText: event.target?.result as string, error: null }));
      };
      reader.readAsText(file);
    } else if (['pdf', 'doc', 'docx'].includes(extension || '')) {
      setState(prev => ({ 
        ...prev, 
        error: `Notice: Automated extraction for .${extension} is restricted in this demo. Please copy-paste the text content directly.` 
      }));
    } else {
      setState(prev => ({ ...prev, error: 'Unsupported file type. Please use a .txt file or paste text.' }));
    }
  };

  const handleSubmit = async () => {
    if (!state.inputText.trim()) {
      setState(prev => ({ ...prev, error: 'Input content is empty. Please provide text or a transcript.' }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const presentation = await generatePresentation(
        state.inputText, 
        state.language, 
        state.inputType,
        state.isThinkingEnabled
      );
      setState(prev => ({ ...prev, presentation, isProcessing: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: err.message || 'Generation failed. Please try again later.' 
      }));
    }
  };

  const reset = () => {
    setState({
      inputText: '',
      language: 'EN',
      inputType: 'document',
      isProcessing: false,
      isThinkingEnabled: false,
      error: null,
      presentation: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-700 to-blue-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fa-solid fa-brain text-2xl"></i>
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-slate-800">Antigravity AI</h1>
            <p className="text-[10px] uppercase font-black text-blue-600 tracking-[0.2em] leading-none mt-1">Smart Presenter</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex gap-8 text-sm font-bold text-slate-400">
            <span className="cursor-default uppercase tracking-widest text-[11px] font-black">AI-Powered Extraction</span>
          </div>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-md active:scale-95 uppercase tracking-widest">
            Workspace
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-6 md:p-12 lg:p-16">
        {!state.presentation ? (
          <div className="w-full max-w-5xl animate-fadeIn space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                Narrative to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Slides.</span>
              </h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                Professional presentations from documents or YouTube transcripts in seconds.
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 md:p-12 space-y-10">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Configuration Controls */}
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        1. Select Input Source
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setInputType('document')}
                          className={`py-4 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-3 ${
                            state.inputType === 'document'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          <i className="fa-solid fa-file-lines"></i>
                          Document
                        </button>
                        <button 
                          onClick={() => setInputType('youtube')}
                          className={`py-4 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-3 ${
                            state.inputType === 'youtube'
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          <i className="fa-brands fa-youtube"></i>
                          YouTube
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        2. Target Language
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.value}
                            onClick={() => handleLangChange(lang.value)}
                            className={`py-3 px-6 rounded-2xl border-2 font-black text-xs transition-all ${
                              state.language === lang.value
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${state.isThinkingEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                          <i className="fa-solid fa-microchip text-xl"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Thinking Mode</h4>
                          <p className="text-[11px] text-slate-500">Advanced reasoning for complex topics.</p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleThinking}
                        aria-label="Toggle Thinking Mode"
                        className={`w-14 h-8 rounded-full transition-all relative outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${state.isThinkingEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${state.isThinkingEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Input Methods */}
                  <div className="space-y-6">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      3. Content Input
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* PASTE BUTTON */}
                      <button 
                        onClick={handleClipboardPaste}
                        title="Paste from clipboard"
                        className="group bg-slate-900 text-white py-4 px-6 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                      >
                        <i className="fa-solid fa-paste text-lg group-hover:scale-110 transition-transform"></i>
                        Paste Text
                      </button>

                      <label className="cursor-pointer bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-2 hover:border-blue-200 transition-all text-slate-600 active:scale-95 uppercase tracking-widest">
                        <i className="fa-solid fa-cloud-arrow-up text-lg text-blue-500"></i>
                        Upload File
                        <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={state.inputText}
                        onChange={handleTextChange}
                        placeholder={state.inputType === 'youtube' ? "Paste YouTube Transcript here..." : "Paste Document content here..."}
                        className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none text-slate-800 text-lg font-medium placeholder:text-slate-300 shadow-inner"
                      />
                      {state.inputText && (
                        <div className="absolute top-4 right-6 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm">
                          {state.inputText.length.toLocaleString()} CHARS
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {state.error && (
                  <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl flex items-center gap-4 font-bold border border-rose-100 animate-fadeIn shadow-sm">
                    <i className="fa-solid fa-circle-exclamation text-xl"></i>
                    <span className="text-sm">{state.error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={state.isProcessing}
                  className={`w-full py-6 rounded-3xl text-white font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] uppercase tracking-[0.1em] ${
                    state.isProcessing 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-200'
                  }`}
                >
                  {state.isProcessing ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      Generate Deck
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-slate-900 px-10 py-6 flex flex-wrap items-center justify-center gap-10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-blue-500"></i> Auto-Cleaning</div>
                <div className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-blue-500"></i> PPTX Structure</div>
                <div className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-blue-500"></i> Multilingual</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl animate-scaleUp">
            <SlideViewer presentation={state.presentation} onReset={reset} />
          </div>
        )}
      </main>

      <footer className="p-10 text-center space-y-4">
        <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">
          © 2025 ANTIGRAVITY AI LABS — GEMINI POWERED
        </p>
        <div className="flex justify-center gap-6 text-slate-300">
           <a href="#" className="hover:text-slate-900 transition-colors"><i className="fa-brands fa-github text-lg"></i></a>
           <a href="#" className="hover:text-slate-900 transition-colors"><i className="fa-brands fa-linkedin text-lg"></i></a>
           <a href="#" className="hover:text-slate-900 transition-colors"><i className="fa-brands fa-twitter text-lg"></i></a>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
