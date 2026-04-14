import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { crmId, newSrc, action } = await req.json();
    if (!crmId) {
      return NextResponse.json({ error: "Missing crmId" }, { status: 400 });
    }

    const targetSrc = action === "delete" 
        ? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" 
        : newSrc;

    if (!targetSrc) {
        return NextResponse.json({ error: "Missing newSrc or action" }, { status: 400 });
    }

    // Since the project structure has duplicating HTML files in root and public directory, we scan both
    const dirs = ['public'];
    let updatedCount = 0;

    dirs.forEach(d => {
      const dirPath = path.join(/* turbopackIgnore: true */ process.cwd(), d);
      if(!fs.existsSync(dirPath)) return;
      
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

      files.forEach(f => {
        const filePath = path.join(dirPath, f);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Match the image tag that specifically has this data-crm-id
        const imgTagRegex = new RegExp(`(<img[^>]*data-crm-id="${crmId}"[^>]*>)`, 'gi');
        
        if (imgTagRegex.test(content)) {
            content = content.replace(imgTagRegex, (match) => {
                // Determine if it already uses double quotes or single quotes for src
                if (match.includes('src="')) {
                     return match.replace(/src="[^"]*"/, `src="${targetSrc}"`);
                } else if (match.includes("src='")) {
                     return match.replace(/src='[^']*'/, `src="${targetSrc}"`);
                } else {
                     // Add src if it entirely lacked one
                     return match.replace(/<img/i, `<img src="${targetSrc}"`);
                }
            });
            fs.writeFileSync(filePath, content, 'utf8');
            updatedCount++;
        }
      });
    });

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
