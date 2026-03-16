const fs = require('fs');
const path = require('path');

const dir = "c:/Users/User/Desktop/BMG INTERIORS/bmginteriors";

function walk(directory) {
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(file => {
        file = path.join(directory, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if(!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.html') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(dir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    const replacements = [
        ['&#8377;', '&#8377;'],
        ['&rarr;', '&rarr;'],
        ['&mdash;', '&mdash;'],
        ['&ndash;', '&ndash;'],
        ['&#10022;', '&#10022;'],
        ['&#9678;', '&#9678;'],
        ['&#11041;', '&#11041;'],
        ['&#9672;', '&#9672;'],
        ['&ldquo;', '&ldquo;'],
        ['&rdquo;', '&rdquo;'],
        ['&lsquo;', '&lsquo;'],
        ['&rsquo;', '&rsquo;'],
        ['<div class="pstrip-n">&#8377;1Cr+</div>', '<div class="pstrip-n">&#8377;1Cr+</div>'],
        ['<span class="btn-arr">&rarr;</span>', '<span class="btn-arr">&rarr;</span>'],
        ['<div class="qb-ico">&#9742;</div>', '<div class="qb-ico">&#9742;</div>'], // Handled in contact but just to be safe
        ['START A PROJECT &mdash;', 'START A PROJECT &mdash;'],
        ['BOOK CONSULTATION &mdash;', 'BOOK CONSULTATION &mdash;']
    ];

    replacements.forEach(([search, replace]) => {
        if(content.includes(search)) {
            content = content.split(search).join(replace);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
    }
});
console.log('Done.');
