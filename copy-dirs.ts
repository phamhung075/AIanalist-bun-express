// copy-dirs.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = [
  { src: 'environment', dest: 'dist/environment' }
];

async function copyDir(src, dest) {
  try {
    // Check if source exists
    await fs.access(src);
  } catch {
    console.warn(`Warning: Source directory not found: ${src} - skipping`);
    return;
  }

  // Create dest directory if it doesn't exist
  await fs.mkdir(dest, { recursive: true }).catch(() => {});

  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Ensure dist directory exists
await fs.mkdir('dist', { recursive: true }).catch(() => {});

// Copy all folders
for (const folder of folders) {
  console.log(`Copying ${folder.src} to ${folder.dest}...`);
  await copyDir(folder.src, folder.dest);
  console.log(`Successfully copied ${folder.src}`);
}