// check-dirs.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listDir(dir = '.') {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    console.log(`\nContents of ${dir}:`);
    for (const entry of entries) {
      if (entry.isDirectory()) {
        console.log(`[DIR] ${entry.name}`);
      } else {
        console.log(`[FILE] ${entry.name}`);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
}

await listDir();