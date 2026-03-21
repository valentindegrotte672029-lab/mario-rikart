const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ITEMS_DIR = path.join(__dirname, '..', 'core-astro', 'public', 'images', 'icons', 'items');

// All casino/poker icons that likely have black backgrounds
const FILES_TO_PROCESS = [
  'poker-tab-neon.png',
  'polymario-tab-neon.png',
  'casino-global-icon.png',
  'robot-ia-poker.png',
  'key-neon.png',
  'poker-join.png',
  'Poker icône.png',
  'Polymario icône.png',
  'poker-neon-sub.png',
  'polymario-neon-sub.png',
  'poker-principal.png',
  'polymario-principal.png',
  'join-request.png',
  'coins-stack.png',
  'coin-gold.png',
  'ticket-gold.png',
  'Waluigi icône.png',
];

function removeBlackBackground(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (not found): ${path.basename(filePath)}`);
      return resolve();
    }

    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', function () {
        let pixelsChanged = 0;
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const r = this.data[idx];
            const g = this.data[idx + 1];
            const b = this.data[idx + 2];
            const a = this.data[idx + 3];

            // If pixel is very dark (near-black) and opaque, make transparent
            // Using a threshold of 40 to catch dark greys too
            if (r < 40 && g < 40 && b < 40 && a > 200) {
              this.data[idx + 3] = 0; // Set alpha to 0
              pixelsChanged++;
            }
            // Semi-dark pixels: fade them out proportionally
            else if (r < 80 && g < 80 && b < 80 && a > 200) {
              const brightness = Math.max(r, g, b);
              // Scale alpha based on brightness (darker = more transparent)
              const newAlpha = Math.round((brightness / 80) * a);
              this.data[idx + 3] = newAlpha;
              pixelsChanged++;
            }
          }
        }

        this.pack()
          .pipe(fs.createWriteStream(filePath))
          .on('finish', () => {
            console.log(`  OK: ${path.basename(filePath)} (${pixelsChanged} pixels cleaned)`);
            resolve();
          });
      })
      .on('error', (err) => {
        console.log(`  ERROR: ${path.basename(filePath)}: ${err.message}`);
        resolve(); // Don't reject, just skip
      });
  });
}

async function main() {
  console.log('Removing black backgrounds from casino icons...\n');
  
  for (const file of FILES_TO_PROCESS) {
    const filePath = path.join(ITEMS_DIR, file);
    await removeBlackBackground(filePath);
  }

  console.log('\nDone! All icons processed.');
}

main();
