const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration for different logo sizes
const logoSizes = [
  { size: 48, name: 'logo-48x48.png' },
  { size: 72, name: 'logo-72x72.png' },
  { size: 96, name: 'logo-96x96.png' },
  { size: 128, name: 'logo-128x128.png' },
  { size: 144, name: 'logo-144x144.png' },
  { size: 152, name: 'logo-152x152.png' },
  { size: 192, name: 'logo-192x192.png' },
  { size: 384, name: 'logo-384x384.png' },
  { size: 512, name: 'logo-512x512.png' },
];

// Apple touch icons
const appleTouchSizes = [
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
];

async function generatePWAAssets() {
  const inputLogo = path.join(__dirname, '../public/SES_logo.png');
  
  // Check if the input logo exists
  if (!fs.existsSync(inputLogo)) {
    console.error('Error: SES_logo.png not found in public directory');
    process.exit(1);
  }
  
  console.log('Generating PWA assets from SES_logo.png...');
  
  try {
    // Generate standard logo sizes
    for (const { size, name } of logoSizes) {
      const outputPath = path.join(__dirname, '../public', name);
      await sharp(inputLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    // Generate Apple touch icons
    for (const { size, name } of appleTouchSizes) {
      const outputPath = path.join(__dirname, '../public', name);
      await sharp(inputLogo)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    // Generate favicon
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    await sharp(inputLogo)
      .resize(32, 32)
      .toFormat('ico')
      .toFile(faviconPath);
    console.log('✓ Generated favicon.ico');
    
    console.log('\n✅ All PWA assets generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update manifest.json to reference the new generated assets');
    console.log('2. Update the HTML meta tags to use the new icons');
    console.log('3. Test the PWA installation on various devices');
    
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
}

// Run the asset generation
generatePWAAssets();