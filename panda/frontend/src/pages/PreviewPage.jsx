import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Tablet, Edit3, Rocket, ChevronLeft, Loader2, Share2, ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';

function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('desktop');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading the preview
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [id]);

  const iframeUrl = `/api/sites/${id}`;

  const viewWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  return (
    <div className="h-screen bg-brand-slate flex flex-col overflow-hidden font-inter text-white">
      {/* Top Bar */}
      <div className="bg-brand-slate border-b border-white/5 px-6 py-4 flex items-center justify-between z-10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight font-jakarta hidden sm:block">PANDA</span>
          </div>
          <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm font-medium">Project:</span>
            <span className="text-sm font-bold text-white truncate max-w-[120px]">{id}</span>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-white/5">
          {[
            { id: 'desktop', icon: <Monitor className="w-4 h-4" /> },
            { id: 'tablet', icon: <Tablet className="w-4 h-4" /> },
            { id: 'mobile', icon: <Smartphone className="w-4 h-4" /> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id)}
              className={`p-2 rounded-lg transition-all ${view === item.id ? 'bg-brand-green text-brand-slate shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button 
            onClick={async () => {
              const res = await fetch(`/api/site-data/${id}`);
              const data = await res.json();
              navigate('/builder', { state: { editData: data } });
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Content</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-brand-slate bg-brand-green hover:bg-brand-green-dark rounded-xl transition-all shadow-lg shadow-brand-green/10">
            <Rocket className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-grow bg-slate-950 p-6 md:p-12 flex justify-center overflow-auto relative">
        {/* URL Bar Mockup */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-full max-w-md hidden md:flex items-center gap-3 bg-slate-800/50 border border-white/5 rounded-full px-4 py-1.5 text-[10px] text-slate-500 font-mono">
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-white/10"></div>
             <div className="w-2 h-2 rounded-full bg-white/10"></div>
             <div className="w-2 h-2 rounded-full bg-white/10"></div>
          </div>
          <span className="flex-grow text-center truncate">{id}.panda.build</span>
          <ExternalLink className="w-3 h-3 opacity-50" />
        </div>

        <div className={`${viewWidths[view]} bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 relative h-fit min-h-full rounded-t-xl overflow-hidden border-x border-t border-white/10`}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-slate z-20">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                   <div className="w-16 h-16 border-4 border-brand-green/10 rounded-full animate-spin border-t-brand-green"></div>
                   <Logo className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">Initializing Preview</p>
              </div>
            </div>
          ) : (
            <iframe 
              src={iframeUrl} 
              className="w-full h-[calc(100vh-180px)] border-none"
              title="Site Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewPage;
