const fs = require('fs');
const path = require('path');

// Function to check if an icon exists
function checkIconExists(iconName) {
  const iconPath = path.join(__dirname, 'node_modules', 'lucide-react', 'dist', 'esm', 'icons', `${iconName}.js`);
  return fs.existsSync(iconPath);
}

// List of icons we need
const neededIcons = [
  'tool', 'server', 'package', 'database', 'code', 'search',
  'file-text', 'globe', 'key', 'check-circle', 'x-circle',
  'alert-circle', 'play', 'stop', 'refresh-cw', 'plus',
  'edit', 'trash-2', 'eye', 'eye-off', 'filter', 'settings'
];

console.log('Checking for icon availability...');

const availableIcons = [];
const missingIcons = [];

neededIcons.forEach(icon => {
  if (checkIconExists(icon)) {
    availableIcons.push(icon);
  } else {
    missingIcons.push(icon);
  }
});

console.log('Available icons:', availableIcons);
console.log('Missing icons:', missingIcons);