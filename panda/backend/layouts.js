
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
    </style>
</head>
`;

const layouts = {
  'landing-page': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext scroll-smooth">
        <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                <div class="text-2xl font-extrabold tracking-tighter text-primary">${name.toUpperCase()}</div>
                <div class="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest">
                    <a href="#features" class="hover:text-accent transition-colors">Features</a>
                    <a href="#about" class="hover:text-accent transition-colors">About</a>
                    <a href="#contact" class="hover:text-accent transition-colors">Contact</a>
                </div>
                <a href="#contact" class="bg-primary text-white px-6 py-2 rounded-full font-bold text-xs hover:scale-105 transition-transform">Get Started</a>
            </div>
        </nav>
        <section class="pt-40 pb-20 px-8 text-center max-w-5xl mx-auto">
            <h1 class="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-12 text-primary">
                The future of <br/><span class="text-accent italic">everything.</span>
            </h1>
            <p class="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
                ${desc}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#contact" class="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xl hover:shadow-2xl transition-all">Join the waitlist</a>
                <a href="#features" class="border-2 border-primary/10 px-10 py-5 rounded-2xl font-black text-xl text-primary hover:bg-slate-50 transition-all">Learn more</a>
            </div>
        </section>
        <section id="features" class="py-32 px-8 bg-brandlight">
            <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
                <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                    <div class="w-12 h-12 bg-accent rounded-2xl mb-6"></div>
                    <h3 class="text-2xl font-bold mb-4">Innovation first</h3>
                    <p class="text-slate-500">We push the boundaries of what is possible in the ${industry} space.</p>
                </div>
                <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                    <div class="w-12 h-12 bg-primary rounded-2xl mb-6"></div>
                    <h3 class="text-2xl font-bold mb-4">Quality driven</h3>
                    <p class="text-slate-500">Our commitment to excellence is reflected in every project we deliver.</p>
                </div>
                <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                    <div class="w-12 h-12 bg-accent rounded-2xl mb-6"></div>
                    <h3 class="text-2xl font-bold mb-4">Scalable tech</h3>
                    <p class="text-slate-500">Built for the future, our solutions grow as your business grows.</p>
                </div>
            </div>
        </section>
        <footer class="py-20 px-8 text-center border-t border-slate-100">
            <div class="text-2xl font-black text-primary mb-4">${name.toUpperCase()}</div>
            <p class="text-slate-400 text-sm font-bold uppercase tracking-widest">© 2026. Built by PANDA.</p>
        </footer>
    </body>
    </html>
  `,

  'professional-services': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-slate-50 text-brandtext scroll-smooth">
        <nav class="w-full bg-primary text-white py-6 px-12 flex justify-between items-center">
            <div class="text-xl font-bold tracking-tight">${name}</div>
            <div class="flex gap-10 text-sm font-medium">
                <a href="#expertise" class="hover:text-accent">Expertise</a>
                <a href="#results" class="hover:text-accent">Results</a>
                <a href="#contact" class="hover:text-accent">Contact Us</a>
            </div>
        </nav>
        <section class="bg-primary text-white py-32 px-12">
            <div class="max-w-4xl">
                <h1 class="text-6xl font-bold mb-8 leading-tight">Strategic Excellence in ${industry}.</h1>
                <p class="text-2xl text-slate-300 mb-12 leading-relaxed">
                    ${desc}
                </p>
                <a href="#contact" class="bg-accent text-primary px-8 py-4 rounded-md font-bold hover:brightness-110 transition-all">Schedule Consultation</a>
            </div>
        </section>
        <section id="expertise" class="py-24 px-12 max-w-7xl mx-auto">
            <h2 class="text-4xl font-bold mb-16 text-primary border-l-4 border-accent pl-6">Our Areas of Expertise</h2>
            <div class="grid md:grid-cols-2 gap-12">
                <div class="flex gap-6">
                    <div class="text-4xl font-black text-accent/30">01</div>
                    <div>
                        <h3 class="text-xl font-bold mb-2">Strategic Advisory</h3>
                        <p class="text-slate-600">Helping businesses navigate complex challenges with data-driven insights.</p>
                    </div>
                </div>
                <div class="flex gap-6">
                    <div class="text-4xl font-black text-accent/30">02</div>
                    <div>
                        <h3 class="text-xl font-bold mb-2">Operational Growth</h3>
                        <p class="text-slate-600">Optimizing internal processes for maximum efficiency and scale.</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="bg-white py-24 px-12 border-y border-slate-200">
            <div class="max-w-4xl mx-auto text-center">
                <div class="text-accent text-5xl mb-6">"</div>
                <p class="text-3xl italic text-primary font-medium mb-8">
                    "${name} transformed our approach to ${industry}. Their insights were the catalyst for our growth."
                </p>
                <div class="font-bold text-primary">— CEO, Global Enterprises</div>
            </div>
        </section>
        <footer class="bg-primary text-white/50 py-12 px-12 text-center text-sm font-medium">
            <div class="text-white mb-4">${name} | Registered ${industry} Firm</div>
            <div>© 2026 ${name}. Confidentiality Guaranteed.</div>
        </footer>
    </body>
    </html>
  `,

  'portfolio': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext">
        <header class="p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
                <h1 class="text-5xl font-black tracking-tighter text-primary mb-2">${name}</h1>
                <p class="text-slate-400 font-bold tracking-widest uppercase text-sm">${industry} / Creative</p>
            </div>
            <p class="max-w-sm text-slate-500 font-medium">
                ${desc}
            </p>
        </header>
        <main class="px-4 pb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="aspect-square bg-slate-100 relative group overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div class="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-12 text-center">
                        <div class="text-white">
                            <h3 class="text-2xl font-bold mb-2">Modern Echoes</h3>
                            <p class="text-white/60">Digital Art Direction</p>
                        </div>
                    </div>
                </div>
                <div class="aspect-square bg-slate-100 relative group overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div class="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-12 text-center">
                        <div class="text-white">
                            <h3 class="text-2xl font-bold mb-2">Urban Flow</h3>
                            <p class="text-white/60">Brand Identity</p>
                        </div>
                    </div>
                </div>
                <div class="aspect-square bg-slate-100 relative group overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div class="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-12 text-center">
                        <div class="text-white">
                            <h3 class="text-2xl font-bold mb-2">Silicon Dreams</h3>
                            <p class="text-white/60">UX Research</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer class="p-12 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-primary uppercase">
            <a href="mailto:hello@example.com" class="hover:text-accent">Inquire</a>
            <div class="flex gap-6">
                <a href="#" class="hover:text-accent">Instagram</a>
                <a href="#" class="hover:text-accent">Twitter</a>
            </div>
        </footer>
    </body>
    </html>
  `,

  'ecommerce': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-brandtext">
        <nav class="border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
            <div class="flex gap-8 text-xs font-black uppercase">
                <a href="#" class="hover:text-accent">Shop</a>
                <a href="#" class="hover:text-accent">Collections</a>
            </div>
            <div class="text-2xl font-black tracking-tighter">${name.toUpperCase()}</div>
            <div class="flex gap-8 text-xs font-black uppercase">
                <a href="#" class="hover:text-accent">Search</a>
                <a href="#" class="hover:text-accent">Cart (0)</a>
            </div>
        </nav>
        <section class="h-[70vh] bg-brandlight flex items-center justify-center text-center px-8">
            <div class="max-w-2xl">
                <h1 class="text-5xl md:text-7xl font-black mb-6 text-primary">${name} Edition.</h1>
                <p class="text-lg text-slate-500 mb-10">${desc}</p>
                <a href="#" class="inline-block bg-primary text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">Explore Drop</a>
            </div>
        </section>
        <section class="py-20 px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="space-y-4 group cursor-pointer">
                    <div class="aspect-[3/4] bg-slate-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                        <h3 class="font-bold text-primary">Essential Base</h3>
                        <p class="text-slate-400 text-sm">$89.00</p>
                    </div>
                </div>
                <div class="space-y-4 group cursor-pointer">
                    <div class="aspect-[3/4] bg-slate-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                        <h3 class="font-bold text-primary">Core Element</h3>
                        <p class="text-slate-400 text-sm">$120.00</p>
                    </div>
                </div>
            </div>
        </section>
        <footer class="bg-slate-50 py-20 px-8 grid md:grid-cols-4 gap-12 text-sm">
            <div class="col-span-2">
                <div class="text-xl font-black mb-6 text-primary">${name.toUpperCase()}</div>
                <p class="max-w-xs text-slate-400 leading-relaxed">${desc}</p>
            </div>
            <div class="space-y-4">
                <h4 class="font-black uppercase text-primary">Help</h4>
                <a href="#" class="block text-slate-500">Shipping</a>
                <a href="#" class="block text-slate-500">Returns</a>
            </div>
            <div class="space-y-4">
                <h4 class="font-black uppercase text-primary">Connect</h4>
                <a href="#" class="block text-slate-500">Instagram</a>
                <a href="#" class="block text-slate-500">Newsletter</a>
            </div>
        </footer>
    </body>
    </html>
  `,

  'restaurant': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-[#FCF9F5] text-brandtext">
        <nav class="p-8 flex justify-between items-center fixed w-full top-0 z-50 mix-blend-difference text-white">
            <div class="text-2xl font-black tracking-widest">${name.toUpperCase()}</div>
            <button class="font-bold uppercase text-xs tracking-[0.3em]">Menu</button>
        </nav>
        <section class="h-screen relative flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1600" class="absolute inset-0 w-full h-full object-cover brightness-50" />
            <div class="relative text-center text-white px-8">
                <p class="uppercase tracking-[0.5em] text-sm font-bold mb-6">Est. 2026</p>
                <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-8 italic">${name}</h1>
                <p class="max-w-xl mx-auto text-xl font-medium leading-relaxed">${desc}</p>
            </div>
        </section>
        <section class="py-32 px-8 max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-2 gap-20 items-center">
                <div class="aspect-[4/5] overflow-hidden rounded-full border-8 border-white shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 class="text-5xl font-black text-primary mb-8 tracking-tighter">The Craft of <br/>Atmosphere.</h2>
                    <p class="text-lg text-slate-600 mb-12 leading-relaxed">
                        At ${name}, we believe that ${industry} is about more than just the product—it's about the connection made over a shared experience.
                    </p>
                    <div class="space-y-8">
                        <div class="border-b border-primary/10 pb-4">
                            <h4 class="font-black text-xl mb-1">Hand-Selected</h4>
                            <p class="text-slate-500">Every ingredient tells a story of origin and quality.</p>
                        </div>
                        <div class="border-b border-primary/10 pb-4">
                            <h4 class="font-black text-xl mb-1">Expertly Crafted</h4>
                            <p class="text-slate-500">Technique met with passion produces unforgettable results.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <footer class="bg-primary text-white py-20 px-8 text-center">
            <h2 class="text-4xl font-black mb-12 tracking-tight">Reserve Your Table</h2>
            <div class="flex justify-center gap-12 text-sm font-bold uppercase tracking-widest text-white/40">
                <a href="#" class="hover:text-accent">Contact</a>
                <a href="#" class="hover:text-accent">Location</a>
                <a href="#" class="hover:text-accent">Instagram</a>
            </div>
        </footer>
    </body>
    </html>
  `,

  'blog': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-slate-800">
        <nav class="max-w-5xl mx-auto px-8 py-12 flex justify-between items-center border-b border-slate-100">
            <div class="text-3xl font-black tracking-tighter text-primary">${name}</div>
            <div class="flex gap-6 font-bold text-xs uppercase tracking-widest text-slate-400">
                <a href="#" class="text-primary border-b-2 border-accent">Essays</a>
                <a href="#" class="hover:text-primary transition-colors">Manifesto</a>
                <a href="#" class="hover:text-primary transition-colors">Search</a>
            </div>
        </nav>
        <main class="max-w-3xl mx-auto px-8 py-24">
            <header class="mb-24">
                <p class="text-accent font-black uppercase tracking-widest text-xs mb-4">Introduction</p>
                <h1 class="text-5xl md:text-7xl font-black text-primary tracking-tighter leading-none mb-8">Reflections on ${industry}.</h1>
                <p class="text-2xl text-slate-500 leading-relaxed font-medium">
                    ${desc}
                </p>
            </header>
            <div class="space-y-32">
                <article class="group cursor-pointer">
                    <p class="text-slate-300 font-bold mb-4">June 15, 2026</p>
                    <h2 class="text-4xl font-black text-primary group-hover:text-accent transition-colors tracking-tight mb-6">The quiet revolution of ${industry} in the modern age.</h2>
                    <p class="text-xl text-slate-500 leading-relaxed mb-8">Exploring the subtle shifts that are redefining how we perceive value and sustainability in our daily lives...</p>
                    <span class="text-primary font-black uppercase tracking-widest text-sm border-b-2 border-primary pb-1">Read more</span>
                </article>
                <article class="group cursor-pointer">
                    <p class="text-slate-300 font-bold mb-4">June 02, 2026</p>
                    <h2 class="text-4xl font-black text-primary group-hover:text-accent transition-colors tracking-tight mb-6">Design systems for a decentralized world.</h2>
                    <p class="text-xl text-slate-500 leading-relaxed mb-8">How to maintain consistency when the boundaries of your brand are defined by your community rather than your headquarters...</p>
                    <span class="text-primary font-black uppercase tracking-widest text-sm border-b-2 border-primary pb-1">Read more</span>
                </article>
            </div>
        </main>
        <footer class="bg-brandlight py-20 px-8 mt-24 text-center">
            <p class="font-bold text-primary mb-6">Join the newsletter for weekly insights.</p>
            <form class="max-w-md mx-auto flex gap-2">
                <input type="email" placeholder="email@example.com" class="flex-1 bg-white border border-slate-200 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-accent font-medium" />
                <button class="bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs">Join</button>
            </form>
        </footer>
    </body>
    </html>
  `,

  'saas': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-slate-900 overflow-x-hidden">
        <nav class="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
            <div class="flex items-center gap-12">
                <div class="text-2xl font-black tracking-tight text-primary">${name}</div>
                <div class="hidden lg:flex gap-8 text-sm font-bold text-slate-400">
                    <a href="#" class="hover:text-primary">Features</a>
                    <a href="#" class="hover:text-primary">API</a>
                    <a href="#" class="hover:text-primary">Pricing</a>
                </div>
            </div>
            <div class="flex gap-4">
                <button class="text-sm font-bold px-6 py-2">Log in</button>
                <button class="bg-primary text-white text-sm font-bold px-6 py-2 rounded-lg shadow-lg shadow-primary/20">Sign up</button>
            </div>
        </nav>
        <section class="pt-24 pb-40 px-8 text-center bg-gradient-to-b from-brandlight to-white">
            <div class="max-w-4xl mx-auto">
                <div class="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-10">
                    <span class="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                    v2.0 is now live
                </div>
                <h1 class="text-6xl md:text-8xl font-black text-primary tracking-tight leading-[0.9] mb-10">
                    Streamline your <br/><span class="text-accent underline decoration-8 underline-offset-8 decoration-accent/30">${industry}</span> workflow.
                </h1>
                <p class="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                    ${desc}
                </p>
                <div class="bg-primary p-4 rounded-2xl shadow-2xl max-w-5xl mx-auto -mb-80 relative">
                    <div class="aspect-video bg-slate-800 rounded-xl overflow-hidden border border-white/10">
                        <div class="h-8 bg-slate-700/50 flex items-center px-4 gap-2">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" class="w-full h-full object-cover opacity-80" />
                    </div>
                </div>
            </div>
        </section>
        <section class="pt-80 pb-32 px-8 max-w-7xl mx-auto text-center">
            <h2 class="text-4xl font-bold mb-20 text-primary">Trusted by 10,000+ companies</h2>
            <div class="grid md:grid-cols-4 gap-12 text-slate-400 font-black text-2xl italic tracking-tighter">
                <div>LOGO</div>
                <div>BRAND</div>
                <div>CO.NAME</div>
                <div>STUDIO</div>
            </div>
        </section>
        <footer class="bg-primary text-white py-20 px-8">
            <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
                <div class="col-span-2">
                    <div class="text-3xl font-black mb-8 tracking-tighter">${name}</div>
                    <p class="text-white/50 max-w-xs">${desc}</p>
                </div>
                <div class="space-y-4">
                    <h4 class="font-bold text-accent">Product</h4>
                    <a href="#" class="block text-white/50">Changelog</a>
                    <a href="#" class="block text-white/50">Documentation</a>
                </div>
                <div class="space-y-4">
                    <h4 class="font-bold text-accent">Legal</h4>
                    <a href="#" class="block text-white/50">Privacy</a>
                    <a href="#" class="block text-white/50">Terms</a>
                </div>
            </div>
        </footer>
    </body>
    </html>
  `,

  'local-business': (name, industry, desc, theme) => `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHead(name, industry, theme)}
    <body class="bg-white text-slate-800">
        <nav class="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
            <div class="text-2xl font-bold text-primary tracking-tight">${name}</div>
            <a href="tel:5550000" class="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm">Call Now</a>
        </nav>
        <section class="relative h-[60vh] flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-primary/60 backdrop-blur-[2px]"></div>
            <div class="relative text-center text-white px-8">
                <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">${name}</h1>
                <p class="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-slate-200 font-medium">${desc}</p>
                <div class="flex flex-wrap justify-center gap-6">
                    <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                        <span class="text-accent">★</span>
                        <span class="font-bold text-sm uppercase">4.9/5 Rating</span>
                    </div>
                    <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                        <span class="text-accent">📍</span>
                        <span class="font-bold text-sm uppercase">Austin, TX</span>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-24 px-8 max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <div class="text-center">
                <div class="text-4xl mb-4">🏆</div>
                <h3 class="text-xl font-bold mb-2">Award Winning</h3>
                <p class="text-slate-500 text-sm">Top rated in the ${industry} industry for over 10 years.</p>
            </div>
            <div class="text-center">
                <div class="text-4xl mb-4">⚡</div>
                <h3 class="text-xl font-bold mb-2">Fast Service</h3>
                <p class="text-slate-500 text-sm">We pride ourselves on our response time and efficiency.</p>
            </div>
            <div class="text-center">
                <div class="text-4xl mb-4">🤝</div>
                <h3 class="text-xl font-bold mb-2">Local Experts</h3>
                <p class="text-slate-500 text-sm">Community focused and deeply experienced team.</p>
            </div>
        </section>
        <section class="bg-brandlight py-24 px-8">
            <div class="max-w-3xl mx-auto bg-white p-12 rounded-[2rem] shadow-xl text-center">
                <h2 class="text-3xl font-bold mb-4 text-primary tracking-tight">Visit Us</h2>
                <p class="text-slate-500 mb-8">We are open Monday through Friday, 9am to 6pm.</p>
                <div class="aspect-video bg-slate-200 rounded-2xl mb-8 overflow-hidden grayscale">
                   <img src="https://images.unsplash.com/photo-1524666041070-9d87656c25bb?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover" />
                </div>
                <a href="#" class="block w-full bg-primary text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 transition-all">Get Directions</a>
            </div>
        </section>
        <footer class="py-12 px-8 text-center border-t border-slate-100">
            <div class="font-bold text-primary mb-2">${name}</div>
            <p class="text-slate-400 text-sm italic">Serving our community since 2014.</p>
        </footer>
    </body>
    </html>
  `
};

function generateProfessionalSiteHtml(name, industry, desc, color) {
  const theme = getTheme(color);
  const text = (industry + ' ' + desc).toLowerCase();
  
  let layoutType = 'landing-page';
  if (text.includes('restaurant') || text.includes('food') || text.includes('bakery') || text.includes('cafe') || text.includes('dining')) layoutType = 'restaurant';
  else if (text.includes('portfolio') || text.includes('photographer') || text.includes('designer') || text.includes('creative') || text.includes('artist')) layoutType = 'portfolio';
  else if (text.includes('blog') || text.includes('writer') || text.includes('news') || text.includes('journal') || text.includes('magazine')) layoutType = 'blog';
  else if (text.includes('store') || text.includes('shop') || text.includes('ecommerce') || text.includes('retail') || text.includes('buy') || text.includes('marketplace')) layoutType = 'ecommerce';
  else if (text.includes('saas') || text.includes('software') || text.includes('platform') || text.includes('tech') || text.includes('app') || text.includes('startup')) layoutType = 'saas';
  else if (text.includes('law') || text.includes('consultant') || text.includes('accountant') || text.includes('professional') || text.includes('attorney') || text.includes('legal') || text.includes('advisory')) layoutType = 'professional-services';
  else if (text.includes('local') || text.includes('plumber') || text.includes('dentist') || text.includes('gym') || text.includes('fitness') || text.includes('wellness') || text.includes('repair')) layoutType = 'local-business';
  
  const layoutFn = layouts[layoutType] || layouts['landing-page'];
  return layoutFn(name, industry, desc, theme);
}

module.exports = { generateProfessionalSiteHtml };
