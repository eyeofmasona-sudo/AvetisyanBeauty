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

const BUTTON_CLASS = 'bg-gradient-to-br from-gold-dark via-gold to-champagne text-[#111111] shadow-[0_4px_15px_rgba(200,155,78,0.15)] hover:shadow-[0_0_20px_rgba(200,155,78,0.4)] hover:brightness-110 hover:text-[#111111] border-none';

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Overlays
    content = content.replace(/bg-graphite\/(20|40|50|60)/g, 'bg-black/70');
    
    // Light graphites (used for subtle borders/bgs) -> surface
    content = content.replace(/bg-graphite\/(5|10)/g, 'bg-surface');
    content = content.replace(/border-graphite\/(5|10|20)/g, 'border-border-gold');
    content = content.replace(/shadow-graphite\/(5|10|20)/g, 'shadow-black/50');
    
    // Text graphite
    content = content.replace(/text-graphite\/[0-9]+/g, 'text-text-secondary');
    content = content.replace(/text-graphite/g, 'text-text-primary');
    
    // Backgrounds
    content = content.replace(/bg-pearl/g, 'bg-background');
    content = content.replace(/bg-ivory/g, 'bg-surface');
    content = content.replace(/bg-porcelain/g, 'bg-surface');
    content = content.replace(/bg-medical-blue-gray/g, 'bg-surface');
    content = content.replace(/bg-soft-sand/g, 'bg-background');
    content = content.replace(/bg-nude-beige/g, 'bg-surface');

    // Remove text-white if it's accompanied by bg-graphite
    content = content.replace(/bg-graphite\s+text-white/g, BUTTON_CLASS);
    content = content.replace(/text-white\s+bg-graphite/g, BUTTON_CLASS);
    
    // Primary Button replacements (for remaining bg-graphite)
    content = content.replace(/bg-graphite\b/g, BUTTON_CLASS);
    
    // Hover graphite (used on outline buttons)
    content = content.replace(/hover:bg-graphite/g, 'hover:bg-gradient-to-br hover:from-gold-dark hover:via-gold hover:to-champagne hover:text-[#111111] hover:border-transparent');
    
    // Remove text-white if we applied the button gradient (dangerous, but let's just replace hover:text-white)
    content = content.replace(/hover:text-white/g, 'hover:text-[#111111]');

    // Selection colors
    content = content.replace(/selection:bg-gold\/30 selection:text-text-primary/g, 'selection:bg-gold/30 selection:text-text-primary');
    
    // Icon colors: Replace blue with gold
    content = content.replace(/text-blue-[0-9]+/g, 'text-gold');
    content = content.replace(/bg-blue-[0-9]+/g, 'bg-gold');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
