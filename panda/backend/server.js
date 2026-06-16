const express = require('express');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
const db = new Database('panda.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    business_name TEXT,
    industry TEXT,
    description TEXT,
    pages TEXT,
    color_preference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve generated sites (if we still want to serve from filesystem, otherwise we serve from DB)
// For now, let's keep serving from filesystem for simplicity in the iframe
app.use('/sites', express.static(path.join(__dirname, 'generated_sites')));

// AI Generation Endpoint
app.post('/api/generate-site', (req, res) => {
  const { businessName, industry, description, pages, colorPreference } = req.body;
  
  if (!businessName) {
    return res.status(400).json({ error: 'Business name is required' });
  }

  const slug = slugify(businessName, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 7);
  const siteId = slug;

  // Save to DB
  const stmt = db.prepare('INSERT INTO sites (id, business_name, industry, description, pages, color_preference) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(siteId, businessName, industry, description, JSON.stringify(pages), colorPreference || 'modern-slate');

  // Generate HTML
  const htmlContent = generateProfessionalSiteHtml(businessName, industry, description, colorPreference);
  
  const siteDir = path.join(__dirname, 'generated_sites', siteId);
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }

  fs.writeFileSync(path.join(siteDir, 'index.html'), htmlContent);

  res.json({ id: siteId, url: `/sites/${siteId}/index.html` });
});

// Helper to serve the preview
app.get('/api/sites/:id', (req, res) => {
  const siteId = req.params.id;
  const sitePath = path.join(__dirname, 'generated_sites', siteId, 'index.html');
  
  if (fs.existsSync(sitePath)) {
    res.sendFile(sitePath);
  } else {
    res.status(404).send('Site not found');
  }
});

// Endpoint to fetch site metadata
app.get('/api/site-data/:id', (req, res) => {
  const siteId = req.params.id;
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(siteId);
  
  if (site) {
    site.pages = JSON.parse(site.pages);
    res.json(site);
  } else {
    res.status(404).json({ error: 'Site not found' });
  }
});

// Catch-all middleware to serve React app for client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

function generateProfessionalSiteHtml(name, industry, desc, color) {
  const colors = {
    'modern-slate': { primary: '#0F172A', accent: '#10B981', accentdark: '#059669', light: '#F8FAFC' },
    'ocean-blue': { primary: '#1E40AF', accent: '#38BDF8', accentdark: '#0284C7', light: '#F0F9FF' },
    'sunset-orange': { primary: '#7C2D12', accent: '#FB923C', accentdark: '#EA580C', light: '#FFF7ED' }
  };
  
  const theme = colors[color] || colors['modern-slate'];

  // Industry-specific content
  const industryLower = industry.toLowerCase();
  let services = [
    { title: 'Strategic Advisory', desc: 'Navigating complex challenges with data-driven insights and industry expertise.' },
    { title: 'Digital Transformation', desc: 'Leveraging cutting-edge technology to streamline your business operations.' },
    { title: 'Market Integration', desc: 'Seamlessly expanding your brand presence across all relevant channels.' }
  ];
  let heroImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200";

  if (industryLower.includes('food') || industryLower.includes('restaurant') || industryLower.includes('bakery')) {
    services = [
      { title: 'Artisan Catering', desc: 'Elevating your events with hand-crafted menus and impeccable service.' },
      { title: 'Seasonal Menus', desc: 'Experience the freshest local ingredients, curated daily by our chefs.' },
      { title: 'Private Dining', desc: 'Intimate spaces and personalized culinary journeys for your special moments.' }
    ];
    heroImage = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200";
  } else if (industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('startup')) {
    services = [
      { title: 'Custom Software', desc: 'Building scalable, high-performance applications tailored to your goals.' },
      { title: 'Cloud Infrastructure', desc: 'Modernizing your stack with secure and resilient cloud solutions.' },
      { title: 'AI Integration', desc: 'Harnessing the power of machine learning to drive business intelligence.' }
    ];
    heroImage = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200";
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Professional ${industry} Services</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${theme.primary}',
              accent: '${theme.accent}',
              accentdark: '${theme.accentdark}',
              brandlight: '${theme.light}',
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
<body class="bg-white text-slate-900 scroll-smooth">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div class="text-2xl font-extrabold tracking-tighter text-primary">${name.toUpperCase()}</div>
            <div class="hidden md:flex gap-10 font-bold text-sm text-slate-500 uppercase tracking-widest">
                <a href="#home" class="hover:text-accent transition-colors">Home</a>
                <a href="#services" class="hover:text-accent transition-colors">Services</a>
                <a href="#about" class="hover:text-accent transition-colors">About</a>
                <a href="#contact" class="hover:text-accent transition-colors">Contact</a>
            </div>
            <button class="bg-accent text-primary px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                Get Started
            </button>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-8 overflow-hidden">
        <div class="absolute top-0 right-0 w-1/2 h-full bg-brandlight/50 -z-10 skew-x-12 translate-x-20"></div>
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
                <div class="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-[0.2em] mb-8">
                    Premier ${industry} Partner
                </div>
                <h1 class="text-6xl lg:text-8xl font-extrabold leading-[0.9] mb-8 text-primary tracking-tighter">
                    We redefine <br/><span class="text-accent italic">excellence.</span>
                </h1>
                <p class="text-xl text-slate-500 mb-12 leading-relaxed max-w-xl font-medium">
                    ${desc}
                </p>
                <div class="flex flex-wrap gap-6">
                    <a href="#contact" class="bg-accent text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-accent/20 transition-all">
                        Start your journey
                    </a>
                    <a href="#services" class="group flex items-center gap-3 font-bold text-primary">
                        <span class="w-12 h-12 rounded-full border-2 border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-xl">→</span>
                        Explore our work
                    </a>
                </div>
            </div>
            <div class="relative">
                <div class="aspect-[4/5] bg-slate-200 rounded-[3rem] overflow-hidden shadow-2xl relative">
                   <img src="${heroImage}" class="w-full h-full object-cover" alt="Modern office" />
                   <div class="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent"></div>
                </div>
                <div class="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 hidden md:block animate-bounce">
                    <div class="text-4xl font-black text-primary mb-1 italic">99%</div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Client Satisfaction</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Services -->
    <section id="services" class="bg-primary py-32 px-8">
        <div class="max-w-7xl mx-auto text-center">
            <h2 class="text-4xl lg:text-6xl font-bold mb-6 text-white tracking-tighter">Bespoke Solutions</h2>
            <p class="text-slate-400 max-w-2xl mx-auto mb-20 text-lg">We combine strategic thinking with impeccable execution to deliver results that exceed expectations in the ${industry} market.</p>
            
            <div class="grid md:grid-cols-3 gap-8">
                ${services.map((s, i) => `
                  <div key="${i}" class="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] text-left hover:bg-white hover:text-primary transition-all group">
                      <div class="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-8 text-primary font-black text-2xl group-hover:scale-110 transition-transform">0${i+1}</div>
                      <h3 class="text-2xl font-bold mb-4 font-jakarta text-white group-hover:text-primary transition-colors">${s.title}</h3>
                      <p class="text-slate-400 group-hover:text-slate-600 transition-colors leading-relaxed">${s.desc}</p>
                  </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- About -->
    <section id="about" class="py-32 px-8 max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="order-2 lg:order-1 relative">
                <div class="aspect-square bg-brandlight rounded-full overflow-hidden border-[16px] border-white shadow-2xl">
                   <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" class="w-full h-full object-cover" alt="Our Team" />
                </div>
            </div>
            <div class="order-1 lg:order-2">
                <h2 class="text-5xl font-bold mb-8 text-primary tracking-tighter italic leading-none">Driven by passion. <br/>Guided by integrity.</h2>
                <p class="text-lg text-slate-500 leading-relaxed mb-10 font-medium">
                    At ${name}, our philosophy is simple: we put your success at the center of everything we do. Our team of ${industry} experts is dedicated to crafting unique paths for every client we serve.
                </p>
                <div class="space-y-4">
                    <div class="flex items-center gap-4 text-primary font-bold">
                        <span class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px]">✓</span>
                        Industry-leading expertise
                    </div>
                    <div class="flex items-center gap-4 text-primary font-bold">
                        <span class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px]">✓</span>
                        Transparent communication
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-32 px-8">
        <div class="max-w-5xl mx-auto bg-brandlight rounded-[4rem] p-12 lg:p-24 text-center">
            <h2 class="text-5xl lg:text-7xl font-bold mb-8 tracking-tighter text-primary italic leading-none">Ready to scale?</h2>
            <p class="text-xl text-slate-600 mb-16 max-w-2xl mx-auto font-medium">Schedule a consultation with our specialists and see how ${name} can transform your business.</p>
            
            <form class="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
                <input type="text" class="w-full px-8 py-5 rounded-3xl border-none ring-2 ring-primary/5 focus:ring-accent outline-none transition-all shadow-sm font-bold placeholder:text-slate-400" placeholder="Your Name">
                <input type="email" class="w-full px-8 py-5 rounded-3xl border-none ring-2 ring-primary/5 focus:ring-accent outline-none transition-all shadow-sm font-bold placeholder:text-slate-400" placeholder="Email Address">
                <textarea rows="4" class="sm:col-span-2 w-full px-8 py-5 rounded-3xl border-none ring-2 ring-primary/5 focus:ring-accent outline-none transition-all shadow-sm font-bold placeholder:text-slate-400 resize-none" placeholder="How can we help?"></textarea>
                <button class="sm:col-span-2 bg-accent text-primary py-6 rounded-3xl font-black text-xl hover:bg-accentdark transition-all shadow-xl shadow-accent/20 tracking-widest uppercase">
                    Connect Now
                </button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-16 px-8 border-t border-slate-100">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <div class="text-3xl font-black text-primary tracking-tighter mb-4">${name.toUpperCase()}</div>
              <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">© 2026. All rights reserved.</p>
            </div>
            <div class="flex gap-12 font-black text-sm uppercase tracking-tighter text-primary">
                <a href="#" class="hover:text-accent transition-colors">Twitter</a>
                <a href="#" class="hover:text-accent transition-colors">LinkedIn</a>
                <a href="#" class="hover:text-accent transition-colors">Instagram</a>
            </div>
        </div>
    </footer>
</body>
</html>
  `;
}
