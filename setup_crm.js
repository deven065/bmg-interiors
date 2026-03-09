const fs = require('fs');
const path = require('path');

const dirs = ['.', 'public'];
let crmId = 1;

dirs.forEach(d => {
  const dirPath = path.resolve(process.cwd(), d);
  if(!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  files.forEach(f => {
    let filePath = path.join(dirPath, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace empty placeholder divs with actual images so they can be edited via drag & drop
    content = content.replace(/<div class="pthumb-bg g\d+"><\/div>/g, 
      '<div class="pthumb-bg"><img src="bmg-logo.png" style="width:100%;height:100%;object-fit:cover;" alt="Portfolio Image"></div>');

    // Remove any old data-crm-id if they exist
    content = content.replace(/\sdata-crm-id="\d+"/g, '');

    // Add unique data-crm-id to every img tag globally
    content = content.replace(/<img\b/gi, () => `<img data-crm-id="${crmId++}"`);

    // Inject the visual editor script at the very end
    if (!content.includes('crm-editor.js')) {
      content = content.replace(/<\/body>/i, '<script src="js/crm-editor.js"></script>\n</body>');
    }

    fs.writeFileSync(filePath, content, 'utf8');
  });
});
console.log("CRM Setup complete.");
