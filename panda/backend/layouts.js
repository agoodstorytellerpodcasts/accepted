
function getTheme(color) {
  const colors = {
    'modern-slate': { primary: '#0F172A', accent: '#10B981', light: '#F8FAFC', text: '#334155' },
    'ocean-blue': { primary: '#1E40AF', accent: '#38BDF8', light: '#F0F9FF', text: '#1E293B' },
    'sunset-orange': { primary: '#7C2D12', accent: '#FB923C', light: '#FFF7ED', text: '#431407' },
    'minimal-white': { primary: '#000000', accent: '#6366F1', light: '#FFFFFF', text: '#171717' },
    'royal-purple': { primary: '#4C1D95', accent: '#A78BFA', light: '#F5F3FF', text: '#1E1B4B' }
  };
  return colors[color] || colors['modern-slate'];
}

const commonHead = (name, industry, theme) => `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | ${industry}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${theme.primary}',
              accent: '${theme.accent}',
              brandlight: '${theme.light}',
              brandtext: '${theme.text}',
            },
            fontFamily: {
              jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
              inter: ['Inter', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }
    </style>
</head>
`;

const layouts = {
  startup: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext scroll-smooth">
        <nav class="fixed w-full z-50 glass border-b border-slate-100">
            <div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                <div class="text-2xl font-black text-primary tracking-tighter">${name.toUpperCase()}</div>
                <div class="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest text-slate-500">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#contact">Contact</a>
                </div>
                <button class="bg-accent text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-accent/20">Get Started</button>
            </div>
        </nav>
        <section class="min-h-screen pt-40 pb-20 px-8 flex flex-col items-center text-center bg-gradient-to-br from-brandlight via-white to-white">
            <div class="max-w-4xl">
                <div class="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest mb-8">v1.0 is officially here</div>
                <h1 class="text-6xl md:text-8xl font-black text-primary tracking-tighter leading-[0.9] mb-8">Modern solutions for <span class="text-accent italic">${industry}.</span></h1>
                <p class="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">${desc}</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl">Start Building Now</button>
                    <button class="border-2 border-primary/10 px-10 py-5 rounded-2xl font-black text-lg text-primary hover:bg-slate-50 transition-all">View Demo</button>
                </div>
            </div>
        </section>
        <section id="features" class="py-32 px-8">
            <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                ${[1,2,3,4,5,6].map(i => `
                    <div class="p-10 rounded-[2.5rem] bg-brandlight border border-slate-100 hover:shadow-xl transition-all">
                        <div class="w-12 h-12 bg-accent rounded-2xl mb-8"></div>
                        <h3 class="text-2xl font-bold mb-4">Feature 0${i}</h3>
                        <p class="text-slate-500">Scale your ${industry} operations with our advanced automated infrastructure.</p>
                    </div>
                `).join('')}
            </div>
        </section>
        <section id="pricing" class="py-32 px-8 bg-primary text-white rounded-[4rem] mx-4">
            <div class="max-w-3xl mx-auto text-center mb-20">
                <h2 class="text-5xl font-black mb-6">Simple Pricing</h2>
                <p class="text-slate-400">Choose the plan that fits your growth stage.</p>
            </div>
            <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-slate-900">
                <div class="bg-white p-12 rounded-[3rem] space-y-8">
                    <div class="text-xl font-bold uppercase tracking-widest text-slate-400">Basic</div>
                    <div class="text-5xl font-black">$29<span class="text-lg text-slate-400">/mo</span></div>
                    <ul class="space-y-4 text-slate-500">
                        <li>✓ 1 User</li>
                        <li><li>✓ Core Analytics</li></li>
                        <li>✓ Community Support</li>
                    </ul>
                    <button class="w-full py-4 bg-slate-100 rounded-xl font-bold">Select Plan</button>
                </div>
                <div class="bg-accent p-12 rounded-[3rem] space-y-8 scale-105 text-white">
                    <div class="text-xl font-bold uppercase tracking-widest text-white/50">Pro</div>
                    <div class="text-5xl font-black">$79<span class="text-lg text-white/50">/mo</span></div>
                    <ul class="space-y-4 text-white/80">
                        <li>✓ 5 Users</li>
                        <li>✓ Advanced SEO</li>
                        <li>✓ Priority Support</li>
                    </ul>
                    <button class="w-full py-4 bg-white text-accent rounded-xl font-bold">Select Plan</button>
                </div>
                <div class="bg-white p-12 rounded-[3rem] space-y-8">
                    <div class="text-xl font-bold uppercase tracking-widest text-slate-400">Enterprise</div>
                    <div class="text-5xl font-black">$199<span class="text-lg text-slate-400">/mo</span></div>
                    <ul class="space-y-4 text-slate-500">
                        <li>✓ Unlimited Users</li>
                        <li>✓ Custom Integration</li>
                        <li>✓ 24/7 Phone Support</li>
                    </ul>
                    <button class="w-full py-4 bg-slate-100 rounded-xl font-bold">Select Plan</button>
                </div>
            </div>
        </section>
        <footer class="py-20 px-8 text-center">
            <div class="text-3xl font-black text-primary mb-4">${name}</div>
            <p class="text-slate-400">© 2026. Powering the ${industry} ecosystem.</p>
        </footer>
    </body>
    </html>
  `,

  professional: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-slate-50 text-brandtext scroll-smooth">
        <header class="bg-white border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-12 py-6 flex justify-between items-center">
                <div class="text-xl font-bold text-primary">${name}</div>
                <nav class="flex gap-10 text-sm font-semibold">
                    <a href="#about">About</a>
                    <a href="#services">Services</a>
                    <a href="#contact">Contact</a>
                </nav>
            </div>
        </header>
        <section class="grid lg:grid-cols-2">
            <div class="p-12 lg:p-24 flex flex-col justify-center bg-white">
                <h1 class="text-5xl lg:text-7xl font-bold text-primary mb-8 leading-tight">Trust. Integrity. <br/><span class="text-accent italic">Expertise.</span></h1>
                <p class="text-xl text-slate-600 mb-12 leading-relaxed border-l-4 border-accent pl-8">${desc}</p>
                <div class="flex items-center gap-8">
                    <button class="bg-primary text-white px-8 py-4 rounded font-bold">Our Services</button>
                    <div class="flex -space-x-4">
                        ${[1,2,3].map(i => `<div class="w-12 h-12 rounded-full border-4 border-white bg-slate-200"></div>`).join('')}
                        <div class="pl-6 text-sm font-bold text-slate-400">Trusted by 500+ firms</div>
                    </div>
                </div>
            </div>
            <div class="bg-slate-200 min-h-[400px]">
                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" class="w-full h-full object-cover" />
            </div>
        </section>
        <section id="services" class="py-24 px-12 max-w-7xl mx-auto">
            <div class="grid md:grid-cols-3 gap-12">
                ${['Strategic Consulting', 'Market Analysis', 'Risk Management'].map(s => `
                    <div class="p-12 bg-white border border-slate-100 hover:border-accent transition-all group">
                        <h3 class="text-2xl font-bold mb-4 text-primary">${s}</h3>
                        <p class="text-slate-500 mb-8">Delivering bespoke outcomes for ${industry} leaders worldwide.</p>
                        <a href="#" class="font-bold text-accent group-hover:underline">Learn more →</a>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="bg-primary text-white py-32 px-12 text-center">
            <h2 class="text-4xl font-bold mb-16 underline decoration-accent underline-offset-8">Frequently Asked Questions</h2>
            <div class="max-w-3xl mx-auto space-y-4 text-left">
                ${[1,2,3].map(i => `
                    <div class="p-8 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                        <div class="flex justify-between items-center">
                            <span class="font-bold">What makes ${name} different in the ${industry} space?</span>
                            <span class="text-accent">+</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        <section id="contact" class="py-24 px-12 bg-white">
            <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-20">
                <div>
                    <h2 class="text-4xl font-bold mb-6">Connect with our team today.</h2>
                    <p class="text-slate-500 mb-10">We are ready to discuss your next big project.</p>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <span class="w-10 h-10 bg-brandlight flex items-center justify-center rounded">📍</span>
                            <span class="font-medium">100 Wall Street, New York</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="w-10 h-10 bg-brandlight flex items-center justify-center rounded">📞</span>
                            <span class="font-medium">+1 (212) 555-0198</span>
                        </div>
                    </div>
                </div>
                <form class="space-y-6">
                    <input type="text" placeholder="Your Name" class="w-full p-4 border border-slate-200 rounded" />
                    <input type="email" placeholder="Email Address" class="w-full p-4 border border-slate-200 rounded" />
                    <textarea rows="4" placeholder="How can we help?" class="w-full p-4 border border-slate-200 rounded"></textarea>
                    <button class="w-full py-5 bg-accent text-white font-bold rounded">Send Message</button>
                </form>
            </div>
        </section>
        <footer class="py-12 bg-slate-900 text-white/50 text-center text-xs font-bold uppercase tracking-widest">
            © 2026 ${name}. All Rights Reserved. Private & Confidential.
        </footer>
    </body>
    </html>
  `,

  portfolio: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext">
        <header class="fixed top-0 w-full p-8 z-50 flex justify-between items-center mix-blend-difference text-white">
            <div class="text-2xl font-black tracking-tighter">${name}</div>
            <nav class="flex gap-10 font-bold text-xs uppercase tracking-widest">
                <a href="#work">Work</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </nav>
        </header>
        <section class="h-screen bg-slate-100 relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/20 flex flex-col justify-end p-12 lg:p-24 text-white">
                <h1 class="text-7xl lg:text-9xl font-black mb-6 tracking-tighter leading-none">${name}.</h1>
                <p class="text-xl lg:text-3xl max-w-xl font-medium">${desc}</p>
            </div>
        </section>
        <section id="work" class="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            ${[1,2,3,4].map(i => `
                <div class="aspect-[4/5] bg-slate-200 relative group overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                    <div class="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-12 text-white">
                        <div class="text-xs font-bold uppercase tracking-widest mb-4">Project ${i}</div>
                        <h3 class="text-4xl font-black mb-2">Digital Vision</h3>
                        <p class="text-white/60">Creative Direction for ${industry}</p>
                    </div>
                </div>
            `).join('')}
        </section>
        <section class="py-32 px-12 text-center bg-brandlight">
            <h2 class="text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-12">Clients we've worked with</h2>
            <div class="flex flex-wrap justify-center gap-16 text-4xl font-black text-slate-200 italic">
                <span>NIKE</span><span>APPLE</span><span>DISNEY</span><span>GOOGLE</span>
            </div>
        </section>
        <section id="about" class="py-32 px-12 max-w-5xl mx-auto flex flex-col items-center text-center">
            <h2 class="text-5xl font-black mb-12 italic">Driven by curiosity.</h2>
            <div class="grid grid-cols-3 gap-12 w-full border-y border-slate-200 py-12 mb-12">
                <div><div class="text-4xl font-black text-accent mb-2">12+</div><div class="text-xs font-bold uppercase text-slate-400">Years Exp</div></div>
                <div><div class="text-4xl font-black text-accent mb-2">80+</div><div class="text-xs font-bold uppercase text-slate-400">Clients</div></div>
                <div><div class="text-4xl font-black text-accent mb-2">15</div><div class="text-xs font-bold uppercase text-slate-400">Awards</div></div>
            </div>
            <p class="text-xl text-slate-500 leading-relaxed">${desc}</p>
        </section>
        <footer id="contact" class="py-32 px-12 flex flex-col items-center">
            <h2 class="text-6xl md:text-8xl font-black mb-12 tracking-tighter hover:text-accent cursor-pointer transition-colors">Let's talk.</h2>
            <div class="flex gap-10 font-bold uppercase tracking-widest text-xs text-slate-400">
                <a href="#">Instagram</a><a href="#">Twitter</a><a href="#">Email</a>
            </div>
        </footer>
    </body>
    </html>
  `,

  restaurant: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-[#FCF9F5] text-brandtext scroll-smooth">
        <section class="h-screen relative flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1600" class="absolute inset-0 w-full h-full object-cover brightness-50" />
            <div class="relative z-10 text-center text-white px-8">
                <p class="uppercase tracking-[0.5em] text-sm font-bold mb-8">Est. 2026 — Austin</p>
                <h1 class="text-8xl lg:text-[10rem] font-black italic tracking-tighter mb-10 leading-none">${name}</h1>
                <p class="text-xl lg:text-2xl max-w-xl mx-auto font-medium mb-12">${desc}</p>
                <button class="bg-white text-primary px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-accent hover:text-white transition-all">Book Table</button>
            </div>
        </section>
        <section class="py-32 px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div class="relative">
                <div class="aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover" />
                </div>
                <div class="absolute -bottom-10 -right-10 bg-accent p-12 rounded-full w-48 h-48 flex items-center justify-center text-white text-center animate-bounce">
                    <div class="font-black italic text-xl leading-none">The Best <br/>${industry}</div>
                </div>
            </div>
            <div>
                <h2 class="text-5xl font-black text-primary mb-8 tracking-tighter italic leading-none">The Craft of <br/>Atmosphere.</h2>
                <div class="space-y-12">
                    ${[
                        { title: 'Hand-Selected', desc: 'Every ingredient is sourced from local sustainable farms.' },
                        { title: 'Expertly Prepared', desc: 'Our chefs have mastered the art of the fire and the blade.' },
                        { title: 'Unforgettable', desc: 'A dining experience that lingers long after the meal is done.' }
                    ].map(item => `
                        <div class="border-l-4 border-accent pl-8">
                            <h4 class="font-black text-2xl mb-2 text-primary uppercase italic">${item.title}</h4>
                            <p class="text-slate-500">${item.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
        <section class="py-32 bg-white px-8">
            <div class="max-w-4xl mx-auto text-center mb-24">
                <h2 class="text-6xl font-black italic tracking-tighter text-primary">On the Menu</h2>
            </div>
            <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-x-20 gap-y-12">
                ${[1,2,3,4,5,6].map(i => `
                    <div class="flex justify-between items-end border-b-2 border-dotted border-slate-200 pb-2">
                        <div>
                            <h3 class="font-black text-xl uppercase italic">Signature Dish ${i}</h3>
                            <p class="text-sm text-slate-400">Fresh herbs, sea salt, olive oil infusion</p>
                        </div>
                        <div class="font-black text-accent text-xl">$24</div>
                    </div>
                `).join('')}
            </div>
        </section>
        <footer class="bg-primary py-24 text-white px-8">
            <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-20">
                <div class="space-y-6">
                    <div class="text-4xl font-black italic tracking-tighter">${name}</div>
                    <p class="text-white/40">${desc}</p>
                </div>
                <div class="space-y-4">
                    <h4 class="font-black uppercase tracking-widest text-accent italic">Location</h4>
                    <p>123 Culinary Way<br/>Austin, TX 78701</p>
                </div>
                <div class="space-y-4">
                    <h4 class="font-black uppercase tracking-widest text-accent italic">Hours</h4>
                    <p>Tue — Sun: 5pm - 11pm<br/>Mon: Closed</p>
                </div>
            </div>
        </footer>
    </body>
    </html>
  `,

  ecommerce: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext scroll-smooth">
        <nav class="border-b border-slate-100 sticky top-0 bg-white z-50">
            <div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                <div class="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <a href="#">Shop</a><a href="#">Story</a>
                </div>
                <div class="text-3xl font-black tracking-tighter text-primary">${name.toUpperCase()}</div>
                <div class="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                    <a href="#">Search</a><a href="#" class="text-accent">Cart (0)</a>
                </div>
            </div>
        </nav>
        <section class="py-20 px-8">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="col-span-2 lg:col-span-2 bg-brandlight p-12 lg:p-24 flex flex-col justify-center rounded-[3rem]">
                    <h1 class="text-5xl lg:text-7xl font-black text-primary mb-8 tracking-tighter">The ${name} <br/>Collection.</h1>
                    <p class="text-slate-500 mb-10 text-lg">${desc}</p>
                    <button class="bg-primary text-white py-5 rounded-full font-black uppercase tracking-widest text-xs w-fit px-12">Shop New Arrivals</button>
                </div>
                <div class="aspect-square rounded-[3rem] bg-slate-100 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
                <div class="aspect-square rounded-[3rem] bg-slate-100 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
            </div>
        </section>
        <section class="py-32 px-8 max-w-7xl mx-auto">
            <div class="flex justify-between items-end mb-16">
                <h2 class="text-4xl font-black tracking-tight text-primary">Featured Drops</h2>
                <a href="#" class="text-xs font-black uppercase tracking-widest border-b-2 border-accent pb-1">View all</a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                ${[1,2,3,4,5,6].map(i => `
                    <div class="space-y-6 group cursor-pointer">
                        <div class="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div class="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">New</div>
                        </div>
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-primary">${name} Essential 0${i}</h3>
                                <p class="text-slate-400 text-sm italic">${industry} Edition</p>
                            </div>
                            <div class="font-black text-primary">$120</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="bg-brandlight py-32 rounded-[5rem] mx-4 mb-32 flex flex-col items-center text-center px-8">
            <div class="max-w-2xl">
                <h2 class="text-5xl font-black text-primary mb-6 tracking-tight">Never miss a drop.</h2>
                <p class="text-slate-500 mb-10">Join 10,000+ others and get exclusive early access to our limited runs for the ${industry} market.</p>
                <form class="flex w-full max-w-md gap-2">
                    <input type="email" placeholder="email@example.com" class="flex-1 p-5 rounded-2xl border-none ring-2 ring-primary/5 focus:ring-accent outline-none font-bold" />
                    <button class="bg-primary text-white px-8 rounded-2xl font-black uppercase text-xs">Join</button>
                </form>
            </div>
        </section>
        <footer class="bg-primary py-24 text-white/50 text-[10px] font-black uppercase tracking-[0.3em] text-center">
            © 2026 ${name} — Curated ${industry} Store — Built with PANDA
        </footer>
    </body>
    </html>
  `,

  blog: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-slate-800 scroll-smooth">
        <header class="py-16 px-8 max-w-5xl mx-auto border-b border-slate-100 flex flex-col items-center text-center">
            <h1 class="text-5xl font-black tracking-tighter text-primary mb-4">${name}</h1>
            <p class="text-xs font-black uppercase tracking-[0.4em] text-accent mb-8">${industry} Insights</p>
            <nav class="flex gap-10 text-xs font-bold uppercase tracking-widest text-slate-400">
                <a href="#" class="text-primary border-b-2 border-accent pb-1">Journal</a>
                <a href="#">Manifesto</a>
                <a href="#">Archive</a>
            </nav>
        </header>
        <main class="max-w-3xl mx-auto px-8 py-24">
            <article class="mb-32">
                <div class="aspect-video bg-slate-100 rounded-3xl mb-10 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200" class="w-full h-full object-cover" />
                </div>
                <p class="text-slate-400 font-bold mb-4">June 15, 2026</p>
                <h2 class="text-5xl font-black text-primary mb-8 tracking-tighter leading-none">The Future of ${industry} in a Post-Digital World.</h2>
                <p class="text-2xl text-slate-500 leading-relaxed font-medium mb-12">${desc}</p>
                <button class="font-black uppercase tracking-widest text-sm text-primary border-b-4 border-accent pb-1">Continue Reading</button>
            </article>
            <div class="grid gap-24">
                ${[1,2,3].map(i => `
                    <div class="group cursor-pointer">
                        <p class="text-slate-300 font-bold mb-2 text-sm italic">June 0${i}, 2026</p>
                        <h3 class="text-3xl font-black text-primary group-hover:text-accent transition-colors tracking-tight mb-4">Why traditional ${industry} is evolving faster than we think.</h3>
                        <p class="text-slate-500 leading-relaxed mb-6">A deep dive into the changing paradigms of value creation and community engagement in the modern era...</p>
                        <span class="text-xs font-black uppercase tracking-widest text-primary border-b border-primary">Read Case Study</span>
                    </div>
                `).join('')}
            </div>
        </main>
        <section class="bg-brandlight py-32 px-8 text-center mt-20">
            <h2 class="text-4xl font-black text-primary mb-12 italic">Subscribe to the Signal.</h2>
            <form class="max-w-md mx-auto">
                <input type="email" placeholder="Your email address" class="w-full bg-white border-b-2 border-primary p-4 outline-none focus:border-accent text-lg font-medium text-center mb-6" />
                <button class="bg-primary text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs">Join the Circle</button>
            </form>
        </section>
        <footer class="py-20 text-center border-t border-slate-100">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">© 2026 ${name} | Built with PANDA</p>
        </footer>
    </body>
    </html>
  `,

  local: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext scroll-smooth">
        <nav class="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-50">
            <div class="text-2xl font-bold text-primary tracking-tight">${name}</div>
            <div class="flex gap-4">
                <a href="tel:555" class="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm">Call Now</a>
            </div>
        </nav>
        <section class="relative py-32 px-8 text-center bg-slate-900 text-white overflow-hidden">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1600" class="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div class="relative z-10">
                <h1 class="text-6xl md:text-8xl font-bold mb-6 tracking-tight">${name}</h1>
                <p class="text-2xl mb-12 max-w-2xl mx-auto text-slate-300 font-medium">${desc}</p>
                <button class="bg-accent text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-accent/20">Book Online Today</button>
                <div class="mt-12 flex justify-center gap-12 font-bold uppercase tracking-widest text-xs">
                    <span class="flex items-center gap-2 text-accent">★ ★ ★ ★ ★ <span class="text-white">4.9/5 Rating</span></span>
                </div>
            </div>
        </section>
        <section class="py-24 px-8 max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold text-center mb-20">Our ${industry} Services</h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${[1,2,3,4,5,6].map(i => `
                    <div class="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all">
                        <div class="text-3xl mb-4">⚡</div>
                        <h3 class="text-xl font-bold mb-2">Service Name 0${i}</h3>
                        <p class="text-slate-500 mb-6 text-sm italic">Starting at $99.00</p>
                        <p class="text-slate-600 text-sm leading-relaxed mb-6">Expert solutions for your home or business in the ${industry} field.</p>
                        <button class="text-accent font-bold text-sm">Book Service →</button>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="py-24 px-8 bg-brandlight">
            <div class="max-w-4xl mx-auto bg-white rounded-[3rem] p-12 lg:p-24 shadow-2xl grid md:grid-cols-2 gap-16">
                <div>
                    <h2 class="text-4xl font-bold mb-8">Why Choose Us?</h2>
                    <div class="space-y-6">
                        ${['24/7 Availability', 'Licensed & Insured', 'Local Experts'].map(item => `
                            <div class="flex items-center gap-4">
                                <span class="w-8 h-8 bg-accent/20 text-accent flex items-center justify-center rounded-full text-[10px]">✓</span>
                                <span class="font-bold">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-slate-100 rounded-3xl p-8 flex flex-col justify-center text-center">
                    <h4 class="font-bold text-primary mb-4 text-xl">Visit Our Shop</h4>
                    <p class="text-slate-500 text-sm mb-6">123 Local Lane<br/>Austin, TX 78704</p>
                    <p class="text-primary font-bold text-sm">Mon-Fri: 8am - 6pm</p>
                </div>
            </div>
        </section>
        <footer class="py-12 px-8 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
            Serving our community since 2014. Professional ${industry} Solutions.
        </footer>
    </body>
    </html>
  `,

  minimal: (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext scroll-smooth">
        <header class="p-12 lg:p-24 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div class="text-4xl font-black text-primary tracking-tighter">${name}</div>
            <nav class="flex gap-12 text-sm font-black uppercase tracking-[0.2em]">
                <a href="#">About</a><a href="#">Story</a><a href="#">Inquiry</a>
            </nav>
        </header>
        <section class="w-full aspect-[21/9] bg-slate-200">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" class="w-full h-full object-cover" />
        </section>
        <section class="max-w-5xl mx-auto py-32 px-12">
            <div class="flex flex-col md:flex-row gap-20 items-center mb-32">
                <div class="flex-1">
                    <h2 class="text-5xl font-black mb-8 leading-tight">${industry} Reinvented.</h2>
                    <p class="text-2xl text-slate-400 font-medium italic">${desc}</p>
                </div>
                <div class="w-1/3 aspect-square bg-slate-50 rounded-full border-[20px] border-brandlight"></div>
            </div>
            <div class="flex flex-col md:flex-row-reverse gap-20 items-center">
                <div class="flex-1 text-right">
                    <h2 class="text-5xl font-black mb-8 leading-tight">Quietly Leading.</h2>
                    <p class="text-xl text-slate-500 leading-relaxed">Our approach to ${industry} is focused on the details that matter most. We eliminate the noise to focus on your success.</p>
                </div>
                <div class="w-1/2 aspect-video bg-slate-100 rounded-3xl"></div>
            </div>
        </section>
        <footer class="p-24 bg-brandlight text-center">
            <h2 class="text-2xl font-black text-primary mb-8 tracking-widest uppercase">${name}</h2>
            <div class="flex justify-center gap-12 text-slate-300 font-bold uppercase text-[10px] tracking-[0.5em]">
                <a href="#">TW</a><a href="#">IG</a><a href="#">LI</a>
            </div>
        </footer>
    </body>
    </html>
  `
};

function detectLayout(industry, desc) {
  const text = (industry + ' ' + desc).toLowerCase();
  
  if (text.includes('saas') || text.includes('software') || text.includes('platform') || text.includes('tech') || text.includes('app') || text.includes('startup')) return 'startup';
  if (text.includes('restaurant') || text.includes('food') || text.includes('bakery') || text.includes('cafe') || text.includes('dining')) return 'restaurant';
  if (text.includes('portfolio') || text.includes('photographer') || text.includes('designer') || text.includes('creative') || text.includes('artist') || text.includes('agency')) return 'portfolio';
  if (text.includes('store') || text.includes('shop') || text.includes('ecommerce') || text.includes('retail') || text.includes('buy') || text.includes('marketplace')) return 'ecommerce';
  if (text.includes('law') || text.includes('consultant') || text.includes('accountant') || text.includes('professional') || text.includes('attorney') || text.includes('legal') || text.includes('advisory')) return 'professional';
  if (text.includes('blog') || text.includes('writer') || text.includes('news') || text.includes('journal') || text.includes('magazine')) return 'blog';
  if (text.includes('local') || text.includes('plumber') || text.includes('dentist') || text.includes('gym') || text.includes('fitness') || text.includes('wellness') || text.includes('repair')) return 'local';
  
  return 'minimal';
}

function generateSite(name, industry, desc, color) {
  const layoutType = detectLayout(industry, desc);
  const theme = getTheme(color);
  const layoutFn = layouts[layoutType] || layouts['minimal'];
  return layoutFn(name, industry, desc, theme);
}

module.exports = { generateSite, generateProfessionalSiteHtml: generateSite };
