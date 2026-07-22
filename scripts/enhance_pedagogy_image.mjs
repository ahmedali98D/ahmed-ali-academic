// Enhance and upscale the pedagogy image using z-ai-web-dev-sdk
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const INPUT = '/home/z/my-project/upload/Pedagogy and Curriculum..jpg';
const OUTPUT = '/home/z/my-project/audit/phronesis-studio/public/library/pedagogy-and-curriculum.jpg';

async function main() {
  const zai = await ZAI.create();

  // Read image as base64 data URL
  const imageBuffer = fs.readFileSync(INPUT);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  console.log('Original image size:', imageBuffer.length, 'bytes');
  console.log('Sending to AI image-edit API (1440x720)...');

  const response = await zai.images.generations.edit({
    prompt: 'Enhance and sharpen this Persian miniature painting to higher resolution. Preserve every detail of the original composition, figures, architectural elements, and decorative patterns exactly as they are. Maintain the same colors, style, and artistic character. Only improve resolution and clarity — do not add or change any elements.',
    images: [{ url: dataUrl }],
    size: '1440x720',
  });

  const imageBase64 = response.data[0].base64;
  const outputBuffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync(OUTPUT, outputBuffer);

  console.log('Enhanced image saved to:', OUTPUT);
  console.log('New size:', outputBuffer.length, 'bytes');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
