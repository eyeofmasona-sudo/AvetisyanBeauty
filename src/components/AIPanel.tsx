import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Image as ImageIcon, Video, Mic, Wand2, Play, Download, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AIPanel() {
  const { t } = useTranslation();
  
  const [activeTool, setActiveTool] = useState<'text' | 'image' | 'video' | 'tts' | 'magic'>('text');
  
  // States for generation
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  
  // Specific states
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('Kore');
  
  // Podcast mode
  const [isPodcast, setIsPodcast] = useState(false);
  const [speaker1, setSpeaker1] = useState('Joe');
  const [speaker2, setSpeaker2] = useState('Jane');
  const [voice1, setVoice1] = useState('Kore');
  const [voice2, setVoice2] = useState('Puck');

  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  const promptStyles = [
    {
      styleName: "Строгий медицинский (Strict Medical)",
      prompts: [
        "Generate an educational post about the benefits of Ultraformer III for skin tightening.",
        "Create a detailed persona description of our ideal clinic client for targeted advertising.",
        "Draft a blog post outline on 'Preparing for Your First Chemical Peel: What to Expect'.",
        "Generate a professional LinkedIn post about the importance of continuous training for aesthetic practitioners.",
        "An animated infographic video explaining the science behind collagen production."
      ]
    },
    {
      styleName: "Instagram / Молодежный (Instagram / Youth)",
      prompts: [
        "Write an engaging Instagram ad for SMAS lifting emphasizing youth and long-lasting results. 3 short paragraphs with emojis.",
        "Create a TikTok script demonstrating a 3-step morning skincare routine using premium clinical products.",
        "Draft a post for Instagram Stories featuring a Q&A session with our lead dermatologist.",
        "A fast-paced, energetic reel showing behind-the-scenes of a busy day at the clinic.",
        "Write a catchy SMS campaign message for a flash sale on Botox treatments this weekend."
      ]
    },
    {
      styleName: "Премиальный маркетинг (Premium Marketing)",
      prompts: [
        "Create a special offer email for Mother's Day, promoting a 15% discount on all aesthetic procedures.",
        "Write a persuasive landing page headline and subheadline for our signature anti-aging facial treatment.",
        "Generate a script for a 30-second YouTube pre-roll ad about the confidence boost from aesthetic treatments.",
        "A photorealistic close-up of a modern laser device in a luxurious aesthetic clinic, soft lighting.",
        "A highly detailed photograph of our premium skincare product line arranged on a marble surface.",
        "Write a soothing and professional voiceover script for a clinic tour video."
      ]
    },
    {
      styleName: "Удержание клиентов (Client Retention)",
      prompts: [
        "Design an email newsletter welcoming new clients and offering a complimentary skin consultation.",
        "Write a heartfelt thank-you email template for clients after their first visit.",
        "A calming video loop of a facial massage for use as a background on our website.",
        "A bright, inviting photo of a comfortable treatment room with state-of-the-art equipment."
      ]
    }
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

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setResult(null);
    setVideoStatus(null);

    try {
      if (activeTool === 'text') {
        const res = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt, 
            systemInstruction: "You are a professional marketer for a high-end aesthetic medicine clinic." 
          }),
        });
        const data = await res.json();
        setResult(data.text);
      } else if (activeTool === 'image') {
        const res = await fetch('/api/gemini/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (data.image) setResult(data.image);
      } else if (activeTool === 'video') {
        const res = await fetch('/api/gemini/video-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, firstFrame, lastFrame }),
        });
        const data = await res.json();
        
        if (data.operationName) {
          setVideoStatus("Generating video (this may take a few minutes)...");
          pollVideoStatus(data.operationName);
        }
      } else if (activeTool === 'tts') {
        const endpoint = isPodcast ? '/api/gemini/podcast' : '/api/gemini/tts';
        const payload = isPodcast 
          ? { prompt, speaker1, speaker2, voice1, voice2 }
          : { prompt, voiceName };
          
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.audio) setResult(data.audio);
      } else if (activeTool === 'magic') {
        // Magic Mode generates text, image, TTS, and starts Video in parallel
        setVideoStatus("Generating magic campaign...");
        
        const [textRes, imageRes, ttsRes, videoRes] = await Promise.all([
          fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: `Write a 2 sentence catchy ad copy for: ${prompt}`,
              systemInstruction: "You are a professional marketer." 
            }),
          }).then(r => r.json()),
          fetch('/api/gemini/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `A professional advertising photo for a beauty clinic related to: ${prompt}` }),
          }).then(r => r.json()),
          fetch('/api/gemini/podcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `A short podcast discussion about: ${prompt}`, speaker1: 'Host', speaker2: 'Guest', voice1: 'Kore', voice2: 'Puck' }),
          }).then(r => r.json()),
          fetch('/api/gemini/video-start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `A professional advertisement video about: ${prompt}`, firstFrame, lastFrame }),
          }).then(r => r.json()),
        ]);
        
        setResult(JSON.stringify({
          text: textRes.text,
          image: imageRes.image,
          audio: ttsRes.audio,
          videoReady: false
        }));
        
        if (videoRes.operationName) {
          setVideoStatus("Magic Campaign Text & Audio ready. Rendering Video in background...");
          pollVideoStatusMagic(videoRes.operationName);
        } else {
          setVideoStatus(null);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error generating content");
    } finally {
      if (activeTool !== 'video') setIsLoading(false);
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
      setVideoStatus(null);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      setVideoStatus("Error downloading video");
    }
  };

  const pollVideoStatusMagic = async (operationName: string) => {
    try {
      const res = await fetch('/api/gemini/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const data = await res.json();
      
      if (data.done) {
        setVideoStatus("Magic Campaign Video Ready! Downloading...");
        downloadVideoMagic(operationName);
      } else {
        setTimeout(() => pollVideoStatusMagic(operationName), 5000);
      }
    } catch (e) {
      setVideoStatus("Error checking magic video status");
    }
  };

  const downloadVideoMagic = async (operationName: string) => {
    try {
      const res = await fetch('/api/gemini/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResult(prev => {
        if (!prev) return prev;
        try {
          const parsed = JSON.parse(prev);
          parsed.video = url;
          parsed.videoReady = true;
          return JSON.stringify(parsed);
        } catch {
          return prev;
        }
      });
      setVideoStatus(null);
    } catch (e) {
      setVideoStatus("Error downloading magic video");
    }
  };

  const parseMagicResult = (res: string) => {
    try {
      return JSON.parse(res);
    } catch {
      return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-graphite mb-2">
          AI Marketing Studio
        </h1>
        <p className="text-graphite/60 font-light">
          Generate professional content, ads, videos, and podcasts using Gemini AI.
        </p>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'text', icon: Sparkles, label: 'Copy & Ads' },
          { id: 'image', icon: ImageIcon, label: 'Photo Gen' },
          { id: 'video', icon: Video, label: 'Video Gen' },
          { id: 'tts', icon: Mic, label: 'TTS & Podcast' },
          { id: 'magic', icon: Wand2, label: 'Magic Mode' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as any); setResult(null); setPrompt(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
              activeTool === tool.id 
                ? 'bg-graphite text-gold' 
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
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5">
            
            {activeTool === 'tts' && (
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-graphite/10 pb-4 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-graphite">Mode:</span>
                  <button 
                    onClick={() => setIsPodcast(false)}
                    className={`text-sm ${!isPodcast ? 'text-gold font-bold' : 'text-graphite/60'}`}
                  >Standard</button>
                  <button 
                    onClick={() => setIsPodcast(true)}
                    className={`text-sm ${isPodcast ? 'text-gold font-bold' : 'text-graphite/60'}`}
                  >Podcast</button>
                </div>
                
                {!isPodcast ? (
                  <select 
                    value={voiceName} 
                    onChange={e => setVoiceName(e.target.value)}
                    className="border border-graphite/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-gold w-full sm:w-auto"
                  >
                    {voices.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="flex gap-2 items-center">
                      <input type="text" value={speaker1} onChange={e => setSpeaker1(e.target.value)} className="w-16 border rounded px-2 py-1 text-xs flex-1 sm:flex-none" placeholder="Spk 1" />
                      <select value={voice1} onChange={e => setVoice1(e.target.value)} className="border rounded px-2 py-1 text-xs flex-1 sm:flex-none">{voices.map(v => <option key={v} value={v}>{v}</option>)}</select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input type="text" value={speaker2} onChange={e => setSpeaker2(e.target.value)} className="w-16 border rounded px-2 py-1 text-xs flex-1 sm:flex-none" placeholder="Spk 2" />
                      <select value={voice2} onChange={e => setVoice2(e.target.value)} className="border rounded px-2 py-1 text-xs flex-1 sm:flex-none">{voices.map(v => <option key={v} value={v}>{v}</option>)}</select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeTool === 'video' || activeTool === 'image' || activeTool === 'magic') && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">First Frame (Opt)</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setFirstFrame)} className="text-sm w-full" />
                  {firstFrame && <img src={firstFrame} alt="First Frame" className="mt-2 h-16 rounded object-cover" />}
                </div>
                {(activeTool === 'video' || activeTool === 'magic') && (
                  <div>
                    <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">Last Frame (Opt)</label>
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setLastFrame)} className="text-sm w-full" />
                    {lastFrame && <img src={lastFrame} alt="Last Frame" className="mt-2 h-16 rounded object-cover" />}
                  </div>
                )}
              </div>
            )}

            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={activeTool === 'magic' ? "Describe your campaign goal (e.g. 'Promote our new laser hair removal service for summer')" : "Enter your prompt here..."}
              className="w-full bg-pearl border-none rounded-xl p-4 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
            ></textarea>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
              <div className="text-sm text-graphite/60">
                {isLoading && (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-gold" />
                    {videoStatus || "Generating..."}
                  </span>
                )}
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="flex items-center justify-center gap-2 bg-graphite text-white px-8 py-3 rounded-full hover:bg-gold transition-colors text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
              >
                <BrainCircuit size={16} />
                Generate
              </button>
            </div>
          </div>

          {/* Results Area */}
          {result && (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gold/30 relative">
              <h3 className="text-xs font-medium text-graphite/60 uppercase tracking-widest mb-4">Result</h3>
              
              {activeTool === 'text' && (
                <div className="whitespace-pre-wrap text-graphite">{result}</div>
              )}
              
              {activeTool === 'image' && (
                <img src={result} alt="Generated" className="w-full rounded-xl object-contain max-h-[500px]" />
              )}
              
              {activeTool === 'video' && (
                <video src={result} controls autoPlay className="w-full rounded-xl bg-black max-h-[500px]"></video>
              )}
              
              {activeTool === 'tts' && (
                <audio src={result} controls className="w-full mt-4"></audio>
              )}
              
              {activeTool === 'magic' && parseMagicResult(result) && (
                <div className="space-y-6">
                  <div className="bg-pearl p-4 rounded-xl">
                    <h4 className="font-bold mb-2">Ad Copy:</h4>
                    <p>{parseMagicResult(result).text}</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">Visual:</h4>
                      <img src={parseMagicResult(result).image} alt="Generated Campaign" className="w-full rounded-xl object-cover aspect-square" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">Voiceover/Radio Ad:</h4>
                      <audio src={parseMagicResult(result).audio} controls className="w-full"></audio>
                      
                      <h4 className="font-bold mt-6 mb-2">Video Advertisement:</h4>
                      {parseMagicResult(result).videoReady ? (
                        <video src={parseMagicResult(result).video} controls autoPlay className="w-full rounded-xl bg-black mt-2"></video>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-graphite/60 bg-pearl p-4 rounded-xl mt-2">
                           <Loader2 size={16} className="animate-spin text-gold" />
                           Video is generating in the background...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {['image', 'video'].includes(activeTool) && result && (
                <a href={result} download={`generated-${activeTool}`} className="absolute top-8 right-8 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:text-gold transition-colors">
                  <Download size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-graphite/5 h-full">
            <h3 className="font-display text-xl text-graphite mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-gold" />
              Prompt Library
            </h3>
            <div className="space-y-6">
              {promptStyles.map((styleGroup, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-sm font-bold text-graphite/80 border-b border-graphite/10 pb-1">
                    {styleGroup.styleName}
                  </h4>
                  {styleGroup.prompts.map((p, j) => (
                    <button 
                      key={j}
                      onClick={() => setPrompt(p)}
                      className="w-full text-left p-3 rounded-xl border border-graphite/10 hover:border-gold/50 hover:bg-gold/5 transition-colors text-xs text-graphite/80"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
