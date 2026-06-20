import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ArrowRight, CheckCircle2, ChevronLeft, Sparkles, Layout, Palette, FileText } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

function BuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [step, setStatus] = useState('idle'); // idle, generating, done
  const [formData, setFormData] = useState({
    businessName: location.state?.editData?.business_name || '',
    industry: location.state?.editData?.industry || '',
    description: location.state?.editData?.description || location.state?.initialPrompt || '',
    colorPreference: location.state?.editData?.color_preference || 'modern-slate',
    pages: location.state?.editData?.pages || ['Home', 'About', 'Services', 'Contact']
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePage = (page) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.includes(page) 
        ? prev.pages.filter(p => p !== page)
        : [...prev.pages, page]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('generating');
    
    try {
      const response = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.id) {
        // Simulate a more realistic generation time
        setTimeout(() => {
          setStatus('done');
          setTimeout(() => {
            navigate(`/preview/${data.id}`);
          }, 1500);
        }, 3000);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-brand-slate text-white font-inter flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight font-jakarta">PANDA</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <span className={step === 'idle' ? 'text-brand-green' : ''}>1. Design</span>
          <span className="w-4 h-[1px] bg-white/10"></span>
          <span className={step === 'generating' ? 'text-brand-green' : ''}>2. Generate</span>
          <span className="w-4 h-[1px] bg-white/10"></span>
          <span className={step === 'done' ? 'text-brand-green' : ''}>3. Preview</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-8">
        <div className="max-w-4xl w-full grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Side: Instructions */}
          <div className="lg:col-span-2 space-y-8 pt-8">
            <div>
              <h1 className="text-3xl font-bold mb-4 font-jakarta">Create your professional <span className="text-brand-green italic">presence.</span></h1>
              <p className="text-slate-400 leading-relaxed">Fill out the details about your business. Our AI will handle the design, copy, and structural integrity of your new site.</p>
            </div>
            
            <div className="space-y-6">
              {[
                { icon: <Layout className="w-5 h-5" />, title: 'Smart Layouts', desc: 'Optimized for conversion and readability.' },
                { icon: <FileText className="w-5 h-5" />, title: 'Professional Copy', desc: 'AI-written content tailored to your industry.' },
                { icon: <Palette className="w-5 h-5" />, title: 'Brand Identity', desc: 'Colors and typography that match your vibe.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-brand-green">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form Container */}
          <div className="lg:col-span-3 bg-slate-800/50 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {step === 'idle' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                    <input 
                      type="text" 
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                      placeholder="Sweet Loaf Bakery"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Industry</label>
                    <input 
                      type="text" 
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                      placeholder="Artisan Food"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description & Vibe</label>
                  <textarea 
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition resize-none"
                    placeholder="Tell us what you do and who your customers are..."
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Included Pages</label>
                  <div className="flex flex-wrap gap-3">
                    {['Home', 'About', 'Services', 'Contact', 'Blog', 'Gallery'].map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => togglePage(page)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          formData.pages.includes(page) 
                            ? 'bg-brand-green text-brand-slate shadow-lg shadow-brand-green/20' 
                            : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Color Theme</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'modern-slate', name: 'Slate', color: 'bg-slate-900' },
                      { id: 'ocean-blue', name: 'Ocean', color: 'bg-blue-600' },
                      { id: 'sunset-orange', name: 'Sunset', color: 'bg-orange-600' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, colorPreference: theme.id }))}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          formData.colorPreference === theme.id 
                            ? 'border-brand-green bg-white/5' 
                            : 'border-white/5 bg-slate-900 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${theme.color}`}></div>
                        <span className={`text-xs font-bold ${formData.colorPreference === theme.id ? 'text-white' : 'text-slate-500'}`}>{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green-dark text-brand-slate py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand-green/10 mt-4"
                >
                  Generate My Website
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </form>
            ) : step === 'generating' ? (
              <div className="py-20 text-center space-y-8">
                <div className="relative inline-block">
                  <div className="w-24 h-24 border-4 border-brand-green/10 rounded-full animate-spin border-t-brand-green mx-auto"></div>
                  <Sparkles className="w-10 h-10 text-brand-green absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold font-jakarta">Generating Magic...</h3>
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-green animate-progress-fast"></div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium italic">Assembling components & writing copy</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-8 animate-fade-in">
                <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto border-2 border-brand-green/50 shadow-2xl shadow-brand-green/20">
                  <CheckCircle2 className="w-12 h-12 text-brand-green" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-jakarta text-brand-green">Success!</h3>
                  <p className="text-slate-400">Your site is ready for preview.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-white/5 text-slate-500 text-xs font-medium flex justify-between items-center">
        <p>© 2026 PANDA AI Builder</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}

export default BuilderPage;
