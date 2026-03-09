const fs = require('fs');
const path = require('path');

const dirs = ['.', 'public'];

dirs.forEach(d => {
  const dirPath = path.resolve(process.cwd(), d);
  if(!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  files.forEach(f => {
    let filePath = path.join(dirPath, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the script tag
    content = content.replace(/<script src="js\/crm-editor\.js"><\/script>\n?/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
  });
});
console.log("Cleanup complete.");
