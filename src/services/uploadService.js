import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';

/**
 * Return resolved absolute path to upload directory
 */
export const getUploadDir = () => {
  const dir = process.env.UPLOAD_DIR
    ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Ensure upload directory exists at boot
getUploadDir();

export const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.mp4']);

export const DANGEROUS_EXTENSIONS = new Set([
  'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps',
  'cgi', 'pl', 'py', 'sh', 'bash', 'exe', 'msi', 'bat', 'cmd',
  'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'html', 'htm', 'xhtml',
  'svg', 'xml', 'jar', 'jsp', 'asp', 'aspx', 'vbs', 'com', 'scr'
]);

export const MIME_TO_CATEGORY = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'video/mp4': 'video',
};

export const CATEGORY_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  gif: 5 * 1024 * 1024,   // 5MB
  pdf: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024 // 50MB
};

/**
 * Validates uploaded file by magic bytes, checks category size limits,
 * and performs WebP conversion + thumbnail generation for standard images.
 */
export const processUploadedFile = async (rawFile) => {
  if (!rawFile || !rawFile.path) {
    throw new Error('No file was provided');
  }

  const filePath = rawFile.path;

  // 1. Verify Magic Bytes using file-type
  let detectedType;
  try {
    detectedType = await fileTypeFromFile(filePath);
  } catch (err) {
    try { await fs.promises.unlink(filePath); } catch {}
    throw new Error('Unable to read file signature');
  }

  if (!detectedType) {
    try { await fs.promises.unlink(filePath); } catch {}
    throw new Error('Unrecognized or invalid file type. Magic byte inspection failed.');
  }

  const category = MIME_TO_CATEGORY[detectedType.mime];
  if (!category) {
    try { await fs.promises.unlink(filePath); } catch {}
    throw new Error(`Forbidden file format (${detectedType.mime}). Only JPG, PNG, WebP, GIF, PDF, and MP4 are permitted.`);
  }

  // 2. Strict Category Size Check
  const maxAllowedSize = CATEGORY_LIMITS[category];
  const fileStat = await fs.promises.stat(filePath);
  if (fileStat.size > maxAllowedSize) {
    try { await fs.promises.unlink(filePath); } catch {}
    const mbLimit = Math.round(maxAllowedSize / (1024 * 1024));
    throw new Error(`File size (${(fileStat.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum ${mbLimit}MB limit for ${category} uploads.`);
  }

  const uploadDir = getUploadDir();
  const fileId = crypto.randomBytes(16).toString('hex');
  const cleanOriginalName = path.basename(rawFile.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');

  // 3. Image Optimization with Sharp for standard images (JPG, PNG, WebP)
  if (category === 'image') {
    const optimizedFilename = `${fileId}.webp`;
    const optimizedPath = path.join(uploadDir, optimizedFilename);
    const thumbFilename = `${fileId}_thumb.webp`;
    const thumbPath = path.join(uploadDir, thumbFilename);

    try {
      // Convert / Resize to max 1920px wide, 85% WebP
      await sharp(filePath)
        .rotate() // auto-orient based on EXIF
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(optimizedPath);

      // Generate 400x400 cover thumbnail
      await sharp(filePath)
        .rotate()
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toFile(thumbPath);

      // Remove the initial uploaded raw file if distinct
      if (filePath !== optimizedPath) {
        try { await fs.promises.unlink(filePath); } catch {}
      }

      const optStat = await fs.promises.stat(optimizedPath);

      return {
        filename: optimizedFilename,
        originalName: cleanOriginalName,
        mimeType: 'image/webp',
        size: optStat.size,
        path: optimizedPath,
        url: `/uploads/${optimizedFilename}`,
        thumbnailPath: thumbPath,
        thumbnailUrl: `/uploads/${thumbFilename}`,
      };
    } catch (err) {
      try { await fs.promises.unlink(filePath); } catch {}
      try { await fs.promises.unlink(optimizedPath); } catch {}
      try { await fs.promises.unlink(thumbPath); } catch {}
      throw new Error(`Image optimization failed: ${err.message}`);
    }
  }

  // 4. For GIF, PDF, and MP4 (safe binary retain without sharp recompression)
  const safeExt = `.${detectedType.ext}`;
  const finalFilename = `${fileId}${safeExt}`;
  const finalPath = path.join(uploadDir, finalFilename);

  if (filePath !== finalPath) {
    await fs.promises.rename(filePath, finalPath);
  }

  return {
    filename: finalFilename,
    originalName: cleanOriginalName,
    mimeType: detectedType.mime,
    size: fileStat.size,
    path: finalPath,
    url: `/uploads/${finalFilename}`,
    thumbnailPath: '',
    thumbnailUrl: '',
  };
};
