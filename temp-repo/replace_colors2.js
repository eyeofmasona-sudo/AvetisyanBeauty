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

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Overlays
    content = content.replace(/bg-graphite\/(20|40|50|60)/g, 'bg-black/70');
    
    // Very light graphites (used for subtle borders/bgs) -> surface
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
    
    // Primary Button replacements
    // Cases like: className="... bg-graphite text-white ... hover:bg-gold ..."
    content = content.replace(/bg-graphite\b/g, 'bg-gradient-to-br from-gold-dark via-gold to-champagne text-[#111111] shadow-[0_4px_15px_rgba(200,155,78,0.15)] hover:shadow-[0_0_20px_rgba(200,155,78,0.4)] hover:brightness-110 border-none');
    
    // Hover graphite (used on outline buttons)
    content = content.replace(/hover:bg-graphite/g, 'hover:bg-gradient-to-br hover:from-gold-dark hover:via-gold hover:to-champagne hover:text-[#111111] hover:border-transparent');
    
    // Remove conflicting text-white when we applied the button gradient (which needs dark text)
    content = content.replace(/text-white/g, ''); // dangerous, but most text-white were on bg-graphite
    
    // Let's refine text-white:
    // If it's a button with the new gradient, we added text-[#111111]. The `text-white` will conflict.
    // We can do it safely:
    content = content.replace(/text-[#111111]\s*text-white/g, 'text-[#111111]');
    content = content.replace(/text-white\s*text-[#111111]/g, 'text-[#111111]');

    // Selection colors
    content = content.replace(/selection:bg-gold\/30 selection:text-graphite/g, 'selection:bg-gold/30 selection:text-text-primary');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
