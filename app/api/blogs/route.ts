import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type BlogEntry = {
  slug: string;
  url: string;
  title: string;
  lastModified: string;
};

export const dynamic = 'force-dynamic';

const EXCLUDED_PAGES = new Set([
  'index.html',
  'about.html',
  'services.html',
  'portfolio.html',
  'clients.html',
  'contact.html',
  'privacy-policy.html',
  'blogs.html',
  'test.html',
]);

function titleFromFilename(fileName: string): string {
  return fileName
    .replace('.html', '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

export async function GET() {
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const sources = [publicDir, rootDir];

  const uniqueFiles = new Map<string, string>();
  sources.forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((file) => file.endsWith('.html'));
    files.forEach((file) => {
      // Keep the first occurrence so public/ takes precedence over root duplicates.
      if (!uniqueFiles.has(file)) uniqueFiles.set(file, path.join(dir, file));
    });
  });

  const blogs: BlogEntry[] = Array.from(uniqueFiles.entries())
    .map(([file, fullPath]) => ({ file, fullPath }))
    .filter(({ file }) => !EXCLUDED_PAGES.has(file))
    .map(({ file, fullPath }) => {
      const html = fs.readFileSync(fullPath, 'utf8');
      const stats = fs.statSync(fullPath);
      const title = extractTitle(html) || titleFromFilename(file);

      return {
        slug: file.replace('.html', ''),
        url: `/${file}`,
        title,
        lastModified: stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

  return NextResponse.json(blogs);
}
