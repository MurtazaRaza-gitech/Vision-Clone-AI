
import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';
import { geminiService } from './services/geminiService';
import { GenerationResult, GenerationStatus } from './types';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Recreate this image with professional studio lighting');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setStatus(GenerationStatus.GENERATING);
    setError(null);

    try {
      const base64 = await readFileAsBase64(selectedFile);
      const generatedUrl = await geminiService.generateImageVariation(
        base64, 
        selectedFile.type, 
        prompt
      );

      if (generatedUrl) {
        const newResult: GenerationResult = {
          id: Math.random().toString(36).substring(7),
          originalImage: base64,
          generatedImage: generatedUrl,
          prompt: prompt,
          timestamp: Date.now()
        };
        setResults(prev => [newResult, ...prev]);
        setStatus(GenerationStatus.SUCCESS);
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error("Failed to generate image.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrompt('Recreate this image with professional studio lighting');
    setStatus(GenerationStatus.IDLE);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full"></div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Title */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
            Transform Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">Vision into Reality</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Upload an image and describe your creative vision. Our AI will recreate or transform it while preserving the essence.
          </p>
        </div>
          
        {/* Main Generator Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-4 md:p-8 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="space-y-8">
              {/* Image Upload Area */}
              <div className="relative">
                {!previewUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-[2rem] py-16 px-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">Select a Base Image</p>
                      <p className="text-slate-500 mt-1">Drag and drop or click to browse</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-[16/9] md:aspect-[21/9]">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button 
                      onClick={clearSelection}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-red-500 text-white p-3 rounded-2xl backdrop-blur-xl transition-all border border-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-6 left-6 right-6">
                       <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-md">Original Reference</span>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Prompt Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">The Instruction</label>
                  <span className="text-[10px] text-slate-600 font-mono">GEMINI-2.5-FLASH</span>
                </div>
                <div className="relative">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all outline-none resize-none h-32 leading-relaxed"
                    placeholder="Describe the transformation... e.g., 'Change the daytime sky to a cosmic nebula' or 'Recreate in the style of cyberpunk 2077'"
                  />
                  <div className="absolute bottom-4 right-4 text-slate-700 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <Button 
                onClick={handleGenerate}
                isLoading={status === GenerationStatus.GENERATING}
                disabled={!selectedFile}
                className="w-full text-lg"
              >
                Launch Clone Sequence
              </Button>
            </div>
          </div>
        </div>

        {/* Loading Overlay State */}
        {status === GenerationStatus.GENERATING && (
          <div className="mt-12 text-center space-y-4 animate-pulse">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">Processing Neural Networks</p>
          </div>
        )}

        {/* Results Section */}
        <div id="results-section" className="mt-32">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Generation History</h2>
              <p className="text-slate-500">Your recent visual syntheses across the network</p>
            </div>
            {results.length > 0 && (
              <button 
                onClick={() => setResults([])}
                className="text-xs font-bold text-slate-600 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center"
              >
                Clear All Logs
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-24 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-white/5 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-600 tracking-tight">Library Empty</h3>
              <p className="text-slate-700 mt-2 max-w-xs text-sm">Every clone starts with a spark of an idea. Start generating above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map((result) => (
                <div key={result.id} className="group relative bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl hover:border-blue-500/30 transition-all duration-500">
                  <div className="grid grid-cols-2 gap-px bg-white/5">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={result.originalImage} alt="Input" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-tighter border border-white/5">Reference</div>
                    </div>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={result.generatedImage} alt="Generated" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-blue-600/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-tighter border border-blue-400/20">Clone Output</div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-gradient-to-b from-transparent to-black/40">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Iter: {result.id}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = result.generatedImage;
                            link.download = `clone-${result.id}.png`;
                            link.click();
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                          title="Download"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteResult(result.id)}
                          className="p-2 bg-red-500/5 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/10 text-red-400/50 hover:text-red-400"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-300 italic line-clamp-2 bg-white/5 p-4 rounded-xl border border-white/5">
                      "{result.prompt}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Mini Footer */}
      <footer className="mt-40 pb-12 border-t border-white/5 pt-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">Made by Setra Solutionz by Murtaza Raza</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
