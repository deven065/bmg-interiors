import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  let files: string[] = [];
  if (fs.existsSync(publicDir)) {
      files = fs.readdirSync(publicDir);
  }
  
  const images = files.filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  return NextResponse.json(images);
}
