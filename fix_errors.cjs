const fs = require('fs');
const glob = require('fs').readdirSync('src/pages').map(f => 'src/pages/' + f).filter(f => f.endsWith('.tsx'));
glob.push('src/App.tsx');

for (const file of glob) {
  let c = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix "React is not defined"
  if (c.includes('React.useEffect')) {
    c = c.replace(/React\.useEffect/g, 'useEffect');
    changed = true;
  }
  if (c.includes('React.useState')) {
    c = c.replace(/React\.useState/g, 'useState');
    changed = true;
  }

  // Ensure useEffect is imported if used
  if (c.includes('useEffect(') && !c.includes('useEffect') && !c.includes('useEffect,')) {
    c = c.replace('import { useState', 'import { useState, useEffect');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, c);
  }
}

// Fix getBookings import issue
// bookings.ts has getMyBookings and getOwnerBookings.
// We can just add export const getBookings = getMyBookings; in bookings.ts
let b = fs.readFileSync('src/services/bookings.ts', 'utf8');
if (!b.includes('export const getBookings')) {
  b += '\nexport const getBookings = getMyBookings;\n';
  fs.writeFileSync('src/services/bookings.ts', b);
}

