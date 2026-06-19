import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Globe, BarChart3, Check } from 'lucide-react';
import Logo from '../components/Logo';

function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleStartBuilding = (e) => {
    e.preventDefault();
    navigate('/builder', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="min-h-screen bg-white text-brand-slate font-inter">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <span className="text-2xl font-bold tracking-tight font-jakarta">PANDA</span>
            </div>
            <div className="hidden md:flex space-x-10 items-center text-sm font-semibold">
              <a href="#features" className="text-slate-600 hover:text-brand-green transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-brand-green transition-colors">How it Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-brand-green transition-colors">Pricing</a>
              <Link to="/builder" className="bg-brand-slate text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-brand-green/10">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden bg-brand-slate text-white">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-green/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-brand-green text-sm font-bold mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Website Generation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 font-jakarta leading-[1.1]">
              Describe your business. <br/>
              <span className="brand-gradient-text italic">Get a website. In seconds.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              PANDA uses advanced AI to instantly generate a professional, multi-page website based on a simple description. No coding, no templates, no waiting.
            </p>
            
            {/* Mock Prompt Input Bar */}
            <form onSubmit={handleStartBuilding} className="relative max-w-2xl mx-auto mb-16 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-green to-brand-green-dark rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-slate-800 rounded-2xl p-2 border border-white/10 shadow-2xl">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A boutique coffee shop in Brooklyn with a minimalist vibe..."
                  className="flex-grow bg-transparent border-none text-white px-6 py-4 focus:ring-0 outline-none text-lg placeholder:text-slate-500"
                />
                <button type="submit" className="bg-brand-green hover:bg-brand-green-dark text-brand-slate font-bold px-8 py-4 rounded-xl transition-all flex items-center gap-2 group">
                  Generate
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            <div className="flex justify-center items-center gap-8 text-slate-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-green" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-green" />
                1-minute setup
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section id="how-it-works" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 font-jakarta">Website Building Redefined</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg font-medium">Three simple steps to a professional online presence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Describe', desc: 'Tell us about your business, industry, and the vibe you want in plain English.', icon: <Zap className="w-6 h-6" /> },
              { step: '02', title: 'Generate', desc: 'Our AI designs your layout, writes your copy, and finds the perfect images in seconds.', icon: <Sparkles className="w-6 h-6" /> },
              { step: '03', title: 'Publish', desc: 'Tweak the content if you like, then launch instantly to your own domain or a PANDA subdomain.', icon: <Globe className="w-6 h-6" /> }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-6 -left-6 text-8xl font-black text-slate-200 group-hover:text-brand-green/10 transition-colors pointer-events-none">{item.step}</div>
                <div className="relative bg-white p-10 rounded-3xl shadow-sm border border-slate-200 group-hover:border-brand-green transition-all group-hover:shadow-xl group-hover:shadow-brand-green/5">
                  <div className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mb-8">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-jakarta">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 font-jakarta">Everything you need to <span className="text-brand-green italic text-5xl">scale.</span></h2>
              <div className="space-y-8">
                {[
                  { title: 'AI-Powered Design', desc: 'Unique layouts generated specifically for your industry and brand personality.', icon: <Sparkles className="w-6 h-6" /> },
                  { title: 'SEO Optimized', desc: 'Pre-written meta tags, high-performance code, and mobile-first responsiveness.', icon: <BarChart3 className="w-6 h-6" /> },
                  { title: 'Instant Publishing', desc: 'Deploy to your own custom domain or a free .panda.build subdomain.', icon: <Globe className="w-6 h-6" /> }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 text-brand-slate rounded-xl flex items-center justify-center font-bold">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 font-jakarta">{feature.title}</h4>
                      <p className="text-slate-600 font-medium">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-brand-slate rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-50">
                 <div className="h-10 bg-slate-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="aspect-video bg-gradient-to-br from-slate-900 to-brand-slate flex items-center justify-center">
                    <div className="text-center">
                      <Logo className="w-16 h-16 mx-auto mb-4 opacity-50 grayscale" />
                      <p className="text-slate-500 font-mono text-xs">PREVIEW_GEN_PROCESS.EXEC</p>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-brand-green p-6 rounded-2xl shadow-xl animate-bounce">
                <BarChart3 className="w-8 h-8 text-brand-slate" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 font-jakarta">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 font-medium">Choose the plan that fits your business stage.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Freemium */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col hover:border-brand-green/30 transition-colors">
              <h3 className="text-lg font-bold mb-2 text-slate-500 uppercase tracking-widest">Freemium</h3>
              <p className="text-5xl font-bold mb-10 font-jakarta">$0<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="text-slate-600 space-y-6 mb-10 flex-grow font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> 1 Page Site</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> PANDA Subdomain</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> AI Generation</li>
              </ul>
              <Link to="/builder" className="w-full py-4 rounded-xl border border-slate-200 text-brand-slate font-bold hover:bg-slate-50 transition-all text-center">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-brand-slate text-white p-10 rounded-[2rem] shadow-2xl border border-white/5 flex flex-col relative scale-105 z-10">
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-brand-green text-brand-slate text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                Most Popular
              </div>
              <h3 className="text-lg font-bold mb-2 text-brand-green uppercase tracking-widest">Pro</h3>
              <p className="text-5xl font-bold mb-10 font-jakarta">$29<span className="text-sm font-normal text-slate-500">/mo</span></p>
              <ul className="text-slate-300 space-y-6 mb-10 flex-grow font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Multi-page Sites</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Custom Domain</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> AI Content Editing</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Basic Analytics</li>
              </ul>
              <Link to="/builder" className="w-full py-4 rounded-xl bg-brand-green text-brand-slate font-bold hover:bg-brand-green-dark transition-all shadow-lg shadow-brand-green/20 text-center">
                Build Now
              </Link>
            </div>

            {/* Business */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col hover:border-brand-green/30 transition-colors">
              <h3 className="text-lg font-bold mb-2 text-slate-500 uppercase tracking-widest">Business</h3>
              <p className="text-5xl font-bold mb-10 font-jakarta">$79<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="text-slate-600 space-y-6 mb-10 flex-grow font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> E-commerce</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Team Access</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> White-label Export</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Priority Support</li>
              </ul>
              <Link to="/builder" className="w-full py-4 rounded-xl border border-slate-200 text-brand-slate font-bold hover:bg-slate-50 transition-all text-center">
                Contact Sales
              </Link>
            </div>

            {/* Panda Instant */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border-2 border-brand-slate flex flex-col hover:shadow-xl transition-all">
              <h3 className="text-lg font-bold mb-2 text-slate-500 uppercase tracking-widest">Panda Instant</h3>
              <p className="text-5xl font-bold mb-10 font-jakarta">$99<span className="text-sm font-normal text-slate-400">/one-off</span></p>
              <ul className="text-slate-600 space-y-6 mb-10 flex-grow font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Fully Published Site</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Custom Domain Inc.</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> Lifetime Hosting</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-brand-green" /> 0 Recurring Fees</li>
              </ul>
              <Link to="/builder" className="w-full py-4 rounded-xl bg-brand-slate text-white font-bold hover:bg-slate-800 transition-all text-center">
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-slate text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-10">
            <Logo className="w-12 h-12 grayscale brightness-200" />
            <span className="text-3xl font-bold tracking-tight font-jakarta">PANDA</span>
          </div>
          <p className="text-slate-500 mb-12 max-w-md mx-auto font-medium">
            Building the future of the web, one prompt at a time. Empowering businesses with the magic of AI.
          </p>
          <div className="flex justify-center gap-10 mb-12 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-brand-green transition-colors">Twitter</a>
            <a href="#" className="hover:text-brand-green transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-brand-green transition-colors">Instagram</a>
          </div>
          <div className="pt-12 border-t border-white/5 text-slate-600 text-xs font-bold uppercase tracking-tighter">
            © 2026 PANDA AI Website Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
