import { LandingPage, LandingPageVariant } from '@prisma/client';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'image' | 'cta';
  text?: string;
  level?: number;
  url?: string;
  alt?: string;
}

export class LandingPageGeneratorService {
  generateHtml(title: string, content: ContentBlock[], seo: SEOMetadata, analyticsSnippet?: string): string {
    // Basic HTML template with mobile-first design (using Tailwind CDN for simplicity)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}">
  <meta name="keywords" content="${seo.keywords.join(', ')}">
  <meta name="robots" content="${seo.robots || 'index, follow'}">
  <link rel="canonical" href="${seo.canonicalUrl || ''}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${seo.ogTitle || seo.title}">
  <meta property="og:description" content="${seo.ogDescription || seo.description}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${seo.ogImage || ''}">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(this.generateStructuredData(title, seo))}
  </script>
  
  ${analyticsSnippet || ''}
  
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
    .lazy-load { opacity: 0; transition: opacity 0.5s; }
    .lazy-load.loaded { opacity: 1; }
  </style>
</head>
<body class="bg-white text-gray-900">
  <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
      <div class="text-xl font-bold text-blue-600">OmniReach</div>
    </div>
  </header>
  <main class="max-w-4xl mx-auto px-4 py-12">
    <article class="space-y-8">
      ${this.renderContent(content)}
    </article>
  </main>
  <footer class="bg-gray-50 mt-20 border-t border-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 text-sm">
      <p>&copy; ${new Date().getFullYear()} OmniReach. All rights reserved.</p>
    </div>
  </footer>
  
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      const lazyImages = document.querySelectorAll('img.lazy-load');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            entry.target.onload = () => entry.target.classList.add('loaded');
            observer.unobserve(entry.target);
          }
        });
      });
      lazyImages.forEach(img => observer.observe(img));
    });
  </script>
</body>
</html>
    `;
    return this.minifyHtml(html);
  }

  private renderContent(content: ContentBlock[]): string {
    return content.map(block => {
      switch (block.type) {
        case 'heading': 
          const level = block.level || 2;
          const size = level === 1 ? 'text-4xl md:text-5xl' : level === 2 ? 'text-3xl' : 'text-2xl';
          return `<h${level} class="${size} font-extrabold text-gray-900 mb-4">${block.text}</h${level}>`;
        case 'paragraph': 
          return `<p class="text-lg text-gray-600 leading-relaxed mb-4">${block.text}</p>`;
        case 'image': 
          return `<div class="my-8"><img data-src="${block.url}" alt="${block.alt || ''}" class="w-full h-auto rounded-2xl shadow-xl lazy-load"></div>`;
        case 'cta': 
          return `<div class="py-6"><a href="${block.url}" class="inline-block bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transform transition hover:scale-105 shadow-lg">${block.text}</a></div>`;
        default: return '';
      }
    }).join('\n');
  }

  private generateStructuredData(title: string, seo: SEOMetadata) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": seo.description,
      "url": seo.canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "OmniReach"
      }
    };
  }

  private minifyHtml(html: string): string {
    return html.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
  }
}
