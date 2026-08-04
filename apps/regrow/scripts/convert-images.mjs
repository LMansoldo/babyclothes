import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';

const IMAGES_DIR = new URL('../static/images/', import.meta.url).pathname;

async function convertAll() {
  const files = await readdir(IMAGES_DIR);
  const pngFiles = files.filter((file) => extname(file).toLowerCase() === '.png');

  for (const file of pngFiles) {
    const inputPath = join(IMAGES_DIR, file);
    const outputPath = join(IMAGES_DIR, `${basename(file, '.png')}.webp`);
    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
    console.log(`converted ${file} -> ${basename(outputPath)}`);
  }
}

convertAll();
