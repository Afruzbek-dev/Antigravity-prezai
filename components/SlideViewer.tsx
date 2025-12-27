
import React, { useState } from 'react';
import { Presentation } from '../types';
import { PPTX_GENERATION_PROMPT, PPTX_API_SCHEMA } from '../constants';

interface SlideViewerProps {
  presentation: Presentation;
  onReset: () => void;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ presentation, onReset }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  const nextSlide = () => {
    if (currentIdx < presentation.slides.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevSlide = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const currentSlide = presentation.slides[currentIdx];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header Info */}
      <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Presentation Project</span>
          <h2 className="text-lg font-bold text-slate-800 truncate max-w-md">{presentation.title}</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-code"></i>
            Dev Export
          </button>
          <button 
            onClick={onReset}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
          >
            <i className="fa-solid fa-arrow-left"></i>
            New Doc
          </button>
        </div>
      </div>

      {/* Slide Content Area */}
      <div className="flex-grow flex flex-col justify-center items-center p-12 min-h-[500px] relative bg-gradient-to-br from-white to-slate-50/50">
        <div className="w-full max-w-3xl animate-fadeIn">
            <div className="mb-6 inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                <i className="fa-solid fa-display"></i>
                SLIDE {currentIdx + 1} / {presentation.slides.length}
            </div>
          
          <h3 className="text-4xl font-extrabold text-slate-900 mb-10 leading-tight border-l-4 border-blue-600 pl-6">
            {currentSlide.title}
          </h3>
          
          <ul className="space-y-6">
            {currentSlide.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-4 group">
                <div className="mt-2.5 h-2.5 w-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform shrink-0" />
                <p className="text-xl text-slate-700 leading-relaxed font-normal">
                  {bullet}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <div className="flex gap-2">
            <button
                disabled={currentIdx === 0}
                onClick={prevSlide}
                className={`p-3 rounded-lg flex items-center gap-2 font-bold transition-all ${
                    currentIdx === 0 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:bg-white hover:shadow-md'
                }`}
            >
                <i className="fa-solid fa-chevron-left"></i>
                PREV
            </button>
            <button
                disabled={currentIdx === presentation.slides.length - 1}
                onClick={nextSlide}
                className={`p-3 rounded-lg flex items-center gap-2 font-bold transition-all ${
                    currentIdx === presentation.slides.length - 1 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:bg-white hover:shadow-md'
                }`}
            >
                NEXT
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </div>

        <div className="flex items-center gap-4">
            <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / presentation.slides.length) * 100}%` }}
                />
            </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Developer Export Tools</h3>
                <p className="text-sm text-slate-500 font-medium">PPTX Generation Schema & Logic</p>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-400"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg"><i className="fa-brands fa-python"></i></div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">python-pptx prompt</h4>
                </div>
                <div className="bg-slate-900 rounded-2xl p-6 relative">
                  <pre className="text-blue-400 text-sm font-mono whitespace-pre-wrap">{PPTX_GENERATION_PROMPT}</pre>
                  <button className="absolute top-4 right-4 bg-white/10 text-white hover:bg-white/20 px-3 py-1 rounded text-xs font-bold transition-all">COPY SCRIPT</button>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><i className="fa-solid fa-network-wired"></i></div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">API Request/Response Schema</h4>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <pre className="text-slate-600 text-sm font-mono whitespace-pre-wrap">{JSON.stringify(PPTX_API_SCHEMA, null, 2)}</pre>
                </div>
              </section>

              <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
                <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1"></i>
                <div className="text-amber-800 text-sm leading-relaxed">
                  <p className="font-bold mb-1">Implementation Note:</p>
                  To use this export logic, set up a microservice (e.g., Flask or FastAPI) that accepts the JSON payload produced by Antigravity AI and uses the provided Python script to generate a downloadable .pptx file.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideViewer;
