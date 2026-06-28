const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const colorsToReplace = {
  // exact background replacements
  'bg-pearl': 'bg-background',
  'bg-ivory': 'bg-surface',
  'bg-porcelain': 'bg-surface',
  'bg-medical-blue-gray': 'bg-surface',
  'bg-soft-sand': 'bg-background',
  'bg-nude-beige': 'bg-surface',
  
  // text colors
  'text-graphite': 'text-text-primary',
  'text-pearl': 'text-text-primary',
  'text-white': 'text-text-primary',
  'text-black': 'text-text-primary',
  
  // gold stays mostly the same but map to standard names if needed
  // tailwind will use the updated variables.
};

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // specific button replacements
    content = content.replace(/className="[^"]*bg-graphite text-white[^"]*"/g, (match) => {
      // replace the bg-graphite and text-white with btn-primary, and strip other bg/border/text
      let newClass = match.replace(/bg-graphite|text-white|hover:bg-[a-z0-9\/]+|transition-colors|shadow-[a-z0-9\/]+/g, '').trim();
      // compact spaces
      newClass = newClass.replace(/\s+/g, ' ').replace('className="', 'className="btn-primary ');
      return newClass;
    });
    
    // some borders
    content = content.replace(/border-graphite\/[0-9]+/g, 'border-border-gold');
    content = content.replace(/border-gold\/[0-9]+/g, 'border-border-gold');
    
    // text transparency
    content = content.replace(/text-graphite\/[0-9]+/g, 'text-text-secondary');
    
    // backgrounds
    content = content.replace(/bg-graphite\/[0-9]+/g, 'bg-surface/50');
    
    // general color replacement
    for (let [oldClass, newClass] of Object.entries(colorsToReplace)) {
      let regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      content = content.replace(regex, newClass);
    }
    
    // remove shadow classes that might conflict with dark mode
    content = content.replace(/shadow-[a-z0-9\/]+/g, '');
    content = content.replace(/shadow /g, ' ');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
