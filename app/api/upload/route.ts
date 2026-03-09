import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filenameFromForm = formData.get('filename') as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetName = filenameFromForm || file.name;
    const filepath = path.join(process.cwd(), 'public', targetName);

    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ success: true, name: targetName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload" }, { status: 500 });
  }
}
