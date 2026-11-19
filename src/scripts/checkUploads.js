import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Media from '../models/Media.js';
import { getUploadDir } from '../services/uploadService.js';

async function checkUploads() {
  console.log('====================================================');
  console.log('🔍 ONPHARNO Uploads Integrity Checker');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment.');
    process.exit(1);
  }

  const uploadDir = getUploadDir();
  console.log(`📁 Resolved UPLOAD_DIR: ${uploadDir}`);
  if (!fs.existsSync(uploadDir)) {
    console.error(`❌ Upload directory does not exist on disk: ${uploadDir}`);
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('🍃 Connected to database.\n');

  try {
    const totalRecords = await Media.countDocuments();
    console.log(`Found ${totalRecords} Media record(s) in database.\n`);

    if (totalRecords === 0) {
      console.log('✅ No Media records to check. Disk and DB are clean.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const cursor = Media.find().cursor();
    let checked = 0;
    let missingMain = 0;
    let missingThumb = 0;
    const missingList = [];

    for await (const doc of cursor) {
      checked++;
      const mainExists = doc.path && fs.existsSync(doc.path);
      const thumbExists = !doc.thumbnailPath || fs.existsSync(doc.thumbnailPath);

      if (!mainExists) {
        missingMain++;
        missingList.push({ id: doc._id, name: doc.originalName, path: doc.path, type: 'main' });
      }
      if (!thumbExists) {
        missingThumb++;
        missingList.push({ id: doc._id, name: doc.originalName, path: doc.thumbnailPath, type: 'thumb' });
      }
    }

    console.log('--- Summary ---');
    console.log(`Checked:             ${checked}`);
    console.log(`Healthy:             ${checked - missingMain}`);
    console.log(`Missing Main Files:  ${missingMain}`);
    console.log(`Missing Thumbnails:  ${missingThumb}`);

    if (missingList.length > 0) {
      console.warn('\n⚠️ Missing Files Detected:');
      for (const item of missingList) {
        console.warn(`  - [${item.type}] ID: ${item.id} | Name: ${item.name} | Path: ${item.path}`);
      }
      console.warn('\nNote: On ephemeral hosting like Render without persistent disk, server restarts wipe uploads.');
      console.warn('Ops Action: Attach a persistent disk mount to UPLOAD_DIR or migrate storage to a durable VPS volume.');
    } else {
      console.log('\n✅ All Media files and thumbnails are present on disk.');
    }
  } finally {
    await mongoose.disconnect();
  }
}

checkUploads().catch((err) => {
  console.error('Fatal Error during uploads check:', err);
  process.exit(1);
});
