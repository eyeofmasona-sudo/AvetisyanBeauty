import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Image as ImageIcon, Video, Mic, Wand2, Play, Download, Loader2, History, Settings2, Trash2 } from 'lucide-react';

export function AIPanel() {
  const [activeTool, setActiveTool] = useState<'text' | 'image' | 'video' | 'tts' | 'podcast' | 'magic'>('text');
  
  // Base states
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History
  const [history, setHistory] = useState<any[]>([]);

  // Text Settings
  const [systemInstruction, setSystemInstruction] = useState('');
  const [textModel, setTextModel] = useState('gemini-3.5-flash');

  // Image Settings
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [numImages, setNumImages] = useState(1);

  // Video Settings
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [videoQuality, setVideoQuality] = useState('lite');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');

  // TTS Settings
  const [voiceName, setVoiceName] = useState('Kore');
  const [language, setLanguage] = useState('ru');
  const [speed, setSpeed] = useState('normal');
  const [emotion, setEmotion] = useState('neutral');

  // Podcast Settings
  const [podcastTitle, setPodcastTitle] = useState('');
  const [podcastDesc, setPodcastDesc] = useState('');
  const [speaker1, setSpeaker1] = useState('Joe');
  const [speaker2, setSpeaker2] = useState('Jane');
  const [voice1, setVoice1] = useState('Kore');
  const [voice2, setVoice2] = useState('Puck');
  
  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
  const languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'hy', label: 'Հայերեն (Armenian)' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFrame: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrame(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveToHistory = (item: any) => {
    setHistory(prev => [item, ...prev].slice(0, 20));
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setResult(null);
    setVideoStatus(null);
    setErrorMsg(null);

    try {
      if (activeTool === 'text') {
        const res = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, systemInstruction, model: textModel }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setResult(data.text);
        saveToHistory({ type: 'text', prompt, result: data.text, date: new Date().toISOString() });
      } 
      
      else if (activeTool === 'image') {
        const images = [];
        for (let i = 0; i < numImages; i++) {
          const res = await fetch('/api/gemini/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, negativePrompt, aspectRatio, imageSize }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          if (data.image) images.push(data.image);
        }
        setResult(images);
        saveToHistory({ type: 'image', prompt, result: images, date: new Date().toISOString() });
      } 
      
      else if (activeTool === 'video') {
        const res = await fetch('/api/gemini/video-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, firstFrame, lastFrame, aspectRatio: videoAspectRatio, quality: videoQuality }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        if (data.operationName) {
          setVideoStatus("Generating video (this may take a few minutes)...");
          pollVideoStatus(data.operationName);
        }
      } 
      
      else if (activeTool === 'tts') {
        const speedInstruction = speed !== 'normal' ? ` Speak at a ${speed} pace.` : '';
        const emotionInstruction = emotion !== 'neutral' ? ` Use a ${emotion} emotional tone.` : '';
        const enhancedPrompt = prompt + speedInstruction + emotionInstruction;

        const res = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: enhancedPrompt, voiceName, lang: language }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.audio) {
          setResult(data.audio);
          saveToHistory({ type: 'tts', prompt, result: data.audio, date: new Date().toISOString() });
        }
      } 
      
      else if (activeTool === 'podcast') {
        const fullScript = `Title: ${podcastTitle}\nDescription: ${podcastDesc}\n\n${prompt}`;
        const res = await fetch('/api/gemini/podcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullScript, speaker1, speaker2, voice1, voice2, lang: language }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.audio) {
          setResult(data.audio);
          saveToHistory({ type: 'podcast', prompt: podcastTitle, result: data.audio, date: new Date().toISOString() });
        }
      } 
      
      else if (activeTool === 'magic') {
        setVideoStatus("Generating magic campaign...");
        const [textRes, imageRes, ttsRes, videoRes] = await Promise.all([
          fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `Write a 2 sentence catchy ad copy for: ${prompt}`, isMagic: true }),
          }).then(r => r.json()),
          fetch('/api/gemini/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `A professional advertising photo for a beauty clinic related to: ${prompt}`, imageSize: '1K', aspectRatio: '16:9' }),
          }).then(r => r.json()),
          fetch('/api/gemini/podcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `A short engaging discussion about: ${prompt}`, speaker1: 'Host', speaker2: 'Guest', voice1: 'Kore', voice2: 'Puck', lang: language }),
          }).then(r => r.json()),
          fetch('/api/gemini/video-start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `A professional advertisement video about: ${prompt}`, quality: 'lite' }),
          }).then(r => r.json()),
        ]);
        
        const finalResult = {
          text: textRes.text,
          image: imageRes.image,
          audio: ttsRes.audio,
          videoReady: false,
          videoUrl: null
        };
        setResult(finalResult);
        
        if (videoRes.operationName) {
          setVideoStatus("Magic Campaign Text & Audio ready. Rendering Video in background...");
          pollVideoStatusMagic(videoRes.operationName, finalResult);
        } else {
          setVideoStatus(null);
        }
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An unexpected error occurred");
      setVideoStatus(null);
    } finally {
      if (activeTool !== 'video' && activeTool !== 'magic') setIsLoading(false);
    }
  };

  const pollVideoStatus = async (operationName: string) => {
    try {
      const res = await fetch('/api/gemini/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const data = await res.json();
      
      if (data.done) {
        setVideoStatus("Downloading video...");
        downloadVideo(operationName);
      } else {
        setTimeout(() => pollVideoStatus(operationName), 5000);
      }
    } catch (e) {
      setIsLoading(false);
      setVideoStatus("Error checking video status");
    }
  };

  const downloadVideo = async (operationName: string) => {
    try {
      const res = await fetch('/api/gemini/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      saveToHistory({ type: 'video', prompt, result: url, date: new Date().toISOString() });
      setVideoStatus(null);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setVideoStatus("Error downloading video");
    }
  };

  const pollVideoStatusMagic = async (operationName: string, currentResult: any) => {
    try {
      const res = await fetch('/api/gemini/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const data = await res.json();
      
      if (data.done) {
        setVideoStatus("Magic Campaign Video Ready! Downloading...");
        downloadVideoMagic(operationName, currentResult);
      } else {
        setTimeout(() => pollVideoStatusMagic(operationName, currentResult), 5000);
      }
    } catch (e) {
      setVideoStatus("Error checking magic video status");
      setIsLoading(false);
    }
  };

  const downloadVideoMagic = async (operationName: string, currentResult: any) => {
    try {
      const res = await fetch('/api/gemini/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const updatedResult = { ...currentResult, video: url, videoReady: true };
      setResult(updatedResult);
      saveToHistory({ type: 'magic', prompt, result: updatedResult, date: new Date().toISOString() });
      setVideoStatus(null);
      setIsLoading(false);
    } catch (e) {
      setVideoStatus("Error downloading magic video");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl text-graphite mb-2">AI Studio Hub</h1>
          <p className="text-graphite/60 font-light">Multimodal AI Generation Center</p>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'text', icon: Sparkles, label: 'Text' },
          { id: 'image', icon: ImageIcon, label: 'Images' },
          { id: 'video', icon: Video, label: 'Video' },
          { id: 'tts', icon: Mic, label: 'TTS' },
          { id: 'podcast', icon: Mic, label: 'Podcast' },
          { id: 'magic', icon: Wand2, label: 'Magic' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as any); setResult(null); setVideoStatus(null); }}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all whitespace-nowrap ${
              activeTool === tool.id 
                ? 'bg-graphite text-gold shadow-md' 
                : 'bg-white border border-graphite/10 text-graphite hover:border-gold/30'
            }`}
          >
            <tool.icon size={18} />
            <span className="font-medium text-sm">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-graphite/5">
            
            {/* Settings Panels based on Active Tool */}
            <div className="mb-6 space-y-4 bg-pearl/50 p-4 rounded-xl border border-graphite/5">
              <div className="flex items-center gap-2 mb-2 text-graphite/80">
                <Settings2 size={16} /> <span className="font-medium text-sm">Settings</span>
              </div>
              
              {activeTool === 'text' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Model</label>
                    <select value={textModel} onChange={e => setTextModel(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                      <option value="gemini-3.5-flash">Fast (Flash)</option>
                      <option value="gemini-3.1-pro-preview">Advanced (Pro)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">System Prompt</label>
                    <input type="text" value={systemInstruction} onChange={e => setSystemInstruction(e.target.value)} placeholder="e.g. You are a marketer..." className="w-full text-sm border rounded-lg px-3 py-2" />
                  </div>
                </div>
              )}

              {activeTool === 'image' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-4">
                    <label className="block text-xs text-graphite/60 mb-1">Negative Prompt</label>
                    <input type="text" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="What to exclude..." className="w-full text-sm border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Aspect Ratio</label>
                    <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                      <option value="1:1">1:1 Square</option>
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait</option>
                      <option value="4:3">4:3</option>
                      <option value="3:4">3:4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Quality</label>
                    <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Count</label>
                    <input type="number" min="1" max="4" value={numImages} onChange={e => setNumImages(Number(e.target.value))} className="w-full text-sm border rounded-lg px-3 py-2" />
                  </div>
                </div>
              )}

              {activeTool === 'video' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Quality</label>
                    <select value={videoQuality} onChange={e => setVideoQuality(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                      <option value="lite">Standard (Veo Lite)</option>
                      <option value="high">High Quality (Veo Pro)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Aspect Ratio</label>
                    <select value={videoAspectRatio} onChange={e => setVideoAspectRatio(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Portrait</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">First Frame (Opt)</label>
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setFirstFrame)} className="text-xs w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-graphite/60 mb-1">Last Frame (Opt)</label>
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setLastFrame)} className="text-xs w-full" />
                  </div>
                </div>
              )}

              {(activeTool === 'tts' || activeTool === 'podcast') && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-graphite/60 mb-1">Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                      {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  {activeTool === 'tts' && (
                    <>
                      <div>
                        <label className="block text-xs text-graphite/60 mb-1">Voice</label>
                        <select value={voiceName} onChange={e => setVoiceName(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                          {voices.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-graphite/60 mb-1">Emotion</label>
                        <select value={emotion} onChange={e => setEmotion(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
                          <option value="neutral">Neutral</option>
                          <option value="happy">Happy</option>
                          <option value="serious">Serious</option>
                          <option value="excited">Excited</option>
                        </select>
                      </div>
                    </>
                  )}
                  {activeTool === 'podcast' && (
                    <div className="col-span-2 sm:col-span-4 grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1">
                          <label className="text-xs text-graphite/60">Speaker 1</label>
                          <div className="flex gap-2">
                            <input type="text" value={speaker1} onChange={e => setSpeaker1(e.target.value)} className="w-1/2 text-sm border rounded-lg px-2 py-1" />
                            <select value={voice1} onChange={e => setVoice1(e.target.value)} className="w-1/2 text-sm border rounded-lg px-2 py-1">{voices.map(v => <option key={v} value={v}>{v}</option>)}</select>
                          </div>
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-xs text-graphite/60">Speaker 2</label>
                          <div className="flex gap-2">
                            <input type="text" value={speaker2} onChange={e => setSpeaker2(e.target.value)} className="w-1/2 text-sm border rounded-lg px-2 py-1" />
                            <select value={voice2} onChange={e => setVoice2(e.target.value)} className="w-1/2 text-sm border rounded-lg px-2 py-1">{voices.map(v => <option key={v} value={v}>{v}</option>)}</select>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {activeTool === 'podcast' && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <input type="text" value={podcastTitle} onChange={e => setPodcastTitle(e.target.value)} placeholder="Podcast Title" className="w-full border-b border-graphite/20 p-2 focus:outline-none focus:border-gold" />
                <input type="text" value={podcastDesc} onChange={e => setPodcastDesc(e.target.value)} placeholder="Short Description" className="w-full border-b border-graphite/20 p-2 focus:outline-none focus:border-gold" />
              </div>
            )}

            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={activeTool === 'podcast' ? "Enter podcast script here...\nExample:\nJoe: Hello everyone!\nJane: Welcome back to the show!" : "Enter your prompt here..."}
              className="w-full bg-pearl border-none rounded-xl p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none font-mono text-sm"
            ></textarea>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
              <div className="text-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-graphite/60">
                  {isLoading && <Loader2 size={16} className="animate-spin text-gold" />}
                  {videoStatus && <span className="text-gold font-medium">{videoStatus}</span>}
                </div>
                {errorMsg && <div className="text-red-500 font-medium">{errorMsg}</div>}
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="flex items-center justify-center gap-2 bg-graphite text-white px-8 py-3 rounded-full hover:bg-gold transition-colors text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
              >
                <BrainCircuit size={16} />
                Generate {activeTool}
              </button>
            </div>
          </div>

          {/* Results Area */}
          {result && (
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gold/30 relative mt-8">
              <h3 className="text-xs font-medium text-graphite/60 uppercase tracking-widest mb-4">Output Result</h3>
              
              {activeTool === 'text' && <div className="whitespace-pre-wrap text-graphite">{result}</div>}
              
              {activeTool === 'image' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={img || undefined} alt={`Generated ${idx}`} className="w-full rounded-xl shadow-sm object-contain" />
                      <a href={img} download={`image-${idx}.jpg`} className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity text-graphite hover:text-gold"><Download size={16} /></a>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTool === 'video' && (
                <div className="relative">
                  <video src={result || undefined} controls autoPlay loop className="w-full rounded-xl bg-black max-h-[500px]"></video>
                  <a href={result} download="video.mp4" className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow text-graphite hover:text-gold"><Download size={16} /></a>
                </div>
              )}
              
              {(activeTool === 'tts' || activeTool === 'podcast') && (
                <div className="bg-pearl p-6 rounded-xl">
                  <audio src={result || undefined} controls className="w-full outline-none"></audio>
                  <div className="mt-4 flex justify-end">
                    <a href={result} download={`${activeTool}.wav`} className="flex items-center gap-2 text-sm text-graphite hover:text-gold font-medium"><Download size={16} /> Download Audio</a>
                  </div>
                </div>
              )}
              
              {activeTool === 'magic' && (
                <div className="space-y-6">
                  <div className="bg-pearl p-4 rounded-xl border border-graphite/10">
                    <h4 className="font-bold mb-2 text-gold">Ad Copy</h4>
                    <p className="text-graphite">{result.text}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-2 text-gold">Key Visual</h4>
                      <div className="relative group">
                        <img src={result.image || undefined} alt="Generated Campaign" className="w-full rounded-xl object-cover shadow-sm" />
                        <a href={result.image} download="magic-visual.jpg" className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity text-graphite hover:text-gold"><Download size={16} /></a>
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="font-bold mb-2 text-gold">Audio Spot</h4>
                        <audio src={result.audio || undefined} controls className="w-full"></audio>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2 text-gold">Video Ad</h4>
                        {result.videoReady ? (
                          <div className="relative">
                            <video src={result.video || undefined} controls autoPlay loop className="w-full rounded-xl bg-black shadow-sm"></video>
                            <a href={result.video} download="magic-video.mp4" className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow text-graphite hover:text-gold"><Download size={16} /></a>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3 text-sm text-graphite/60 bg-pearl p-8 rounded-xl border border-dashed border-graphite/20">
                             <Loader2 size={24} className="animate-spin text-gold" />
                             <span>Generating video preview...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5 h-full max-h-[800px] overflow-y-auto">
            <h3 className="font-display text-xl text-graphite mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><History size={18} className="text-gold" /> History</span>
              {history.length > 0 && <button onClick={() => setHistory([])} className="text-graphite/40 hover:text-red-400"><Trash2 size={16} /></button>}
            </h3>
            
            {history.length === 0 ? (
              <p className="text-sm text-graphite/40 text-center py-8">No generation history yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-graphite/10 bg-pearl/30 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-xs uppercase tracking-wider text-gold">{item.type}</span>
                      <span className="text-xs text-graphite/40">{new Date(item.date).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-graphite/80 line-clamp-2 mb-2 text-xs">{item.prompt}</p>
                    
                    {item.type === 'image' && <div className="flex gap-1 overflow-hidden">{item.result.map((img:string, i:number) => <img key={i} src={img || undefined} className="h-10 w-10 object-cover rounded" />)}</div>}
                    {item.type === 'text' && <p className="text-xs text-graphite/60 line-clamp-1 italic">{item.result}</p>}
                    {(item.type === 'video' || item.type === 'magic') && <div className="text-xs text-graphite/60">Video ready</div>}
                    {(item.type === 'tts' || item.type === 'podcast') && <audio src={item.result || undefined} controls className="w-full h-6"></audio>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
