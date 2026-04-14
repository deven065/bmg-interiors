import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type ImageEntry = {
  crmId: string;
  src: string;
  page: string;
  alt: string;
  label: string;       // Human-readable section label
  context: string;     // Nearby heading or section name
  role: string;        // What is this image: logo, hero, portfolio, team, client, etc.
};

// Keywords to identify the role of the image based on surrounding context
function inferRoleAndContext(surroundingHtml: string, alt: string, src: string): { role: string; context: string } {
  const nearby = surroundingHtml.toLowerCase();
  const srcLower = src.toLowerCase();
  const altLower = alt.toLowerCase();

  // Extract the nearest heading text from surrounding HTML
  const headingMatch = surroundingHtml.match(/<h[1-6][^>]*>([^<]{2,60})<\/h[1-6]>/i);
  const headingText = headingMatch ? headingMatch[1].trim() : '';

  let role = 'Image';
  let context = headingText || alt;

  // Logo detection
  if (altLower.includes('logo') || altLower.includes('bmg interiors') || srcLower.includes('logo') || srcLower.includes('bmg-logo')) {
    role = 'Logo';
    if (nearby.includes('nav-logo') || nearby.includes('class="nav')) context = 'Header Navigation Logo';
    else if (nearby.includes('ftr') || nearby.includes('footer')) context = 'Footer Logo';
    else if (nearby.includes('ld-logo') || nearby.includes('loader')) context = 'Loading Screen Logo';
    else context = 'Logo';
  }
  // Hero image
  else if (nearby.includes('hero-img') || nearby.includes('hero-img-bg') || nearby.includes('hero')) {
    role = 'Hero';
    context = 'Hero Banner (Main Homepage Visual)';
  }
  // Portfolio / project images
  else if (nearby.includes('pthumb') || nearby.includes('pover') || nearby.includes('data-cat') 
        || srcLower.includes('penthouse') || srcLower.includes('l.r') || srcLower.includes('office')
        || srcLower.includes('watermark') || srcLower.includes('img-2022') || srcLower.includes('img-2021')) {
    role = 'Portfolio';
    const projectName = surroundingHtml.match(/class="pover-name"[^>]*>([^<]{2,60})</i);
    context = projectName ? `Portfolio: ${projectName[1].trim()}` : `Portfolio Image`;
  }  
  // Team / person — including new images/team/ path
  else if (srcLower.includes('images/team') || altLower.includes('gadhiya') || altLower.includes('bharat') 
        || nearby.includes('team') || nearby.includes('founder') || nearby.includes('director')
        || nearby.includes('testi-av') || nearby.includes('founder-av') || nearby.includes('team-av')) {
    role = 'Team';
    context = alt ? `Team Member: ${alt}` : 'Team Member Photo';
  }
  // Client logos
  else if (nearby.includes('client') || nearby.includes('cl-logo') || nearby.includes('hiranandani') 
        || nearby.includes('shapoorji') || nearby.includes('dattani')) {
    role = 'Client Logo';
    context = `Client: ${alt}`;
  }
  // About / story section image
  else if (nearby.includes('story-img') || nearby.includes('as-img') || nearby.includes('about-strip')) {
    role = 'About';
    context = 'Our Story Section Visual';
  }

  // Fallback to src filename if context is still empty or generic
  if (!context || context === 'BMG Interiors') {
    const srcFile = src.split('/').pop()?.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || '';
    context = srcFile || alt || 'Unnamed Image';
  }

  return { role, context };
}

// Get ~500 chars of HTML surrounding an image tag for context
function getSurroundingHtml(content: string, matchIndex: number, matchLength: number): string {
  const start = Math.max(0, matchIndex - 400);
  const end = Math.min(content.length, matchIndex + matchLength + 400);
  return content.slice(start, end);
}

// Scan all HTML files and extract all img tags with their data-crm-id and src
export async function GET() {
  const dirs = ['.', 'public'];
  const allImages: ImageEntry[] = [];
  const seen = new Set<string>();

  dirs.forEach(d => {
    const dirPath = path.join(/* turbopackIgnore: true */ process.cwd(), d);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
    files.forEach(f => {
      // Only scan root-level HTML (not public duplicates for deduplication)
      if (d === 'public') return;

      const content = fs.readFileSync(path.join(dirPath, f), 'utf8');
      const imgRegex = /<img[^>]*data-crm-id="(\d+)"[^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        const tag = match[0];
        const crmId = match[1];
        if (seen.has(crmId)) continue;
        seen.add(crmId);

        const srcMatch = tag.match(/src="([^"]*)"/);
        const altMatch = tag.match(/alt="([^"]*)"/);
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : '';

        const surrounding = getSurroundingHtml(content, match.index, match[0].length);
        const { role, context } = inferRoleAndContext(surrounding, alt, src);

        // Build a clean human label: "Role – Context"
        const label = context && context !== role ? `${role} — ${context}` : role;

        allImages.push({ crmId, src, page: f, alt, label, context, role });
      }
    });
  });

  return NextResponse.json(allImages);
}
