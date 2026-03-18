const { Jimp } = require('jimp');
const path = require('path');

const imagePath = process.argv[2];

async function removeWhiteBackground() {
  try {
    const image = await Jimp.read(imagePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];

      // If the pixel is mostly white, make it transparent
      if (red > 230 && green > 230 && blue > 230) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });

    await image.writeAsync(imagePath);
    console.log("White background removed successfully!");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

removeWhiteBackground();
