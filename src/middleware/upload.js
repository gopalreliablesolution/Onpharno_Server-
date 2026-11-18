import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { getUploadDir, ALLOWED_EXTENSIONS, DANGEROUS_EXTENSIONS } from '../services/uploadService.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (_req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.tmp';
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `tmp_${Date.now()}_${randomHex}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const originalName = file.originalname || '';
  const ext = path.extname(originalName).toLowerCase();

  // 1. Strict extension check
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Invalid file extension '${ext}'. Allowed types: jpg, jpeg, png, webp, gif, pdf, mp4.`));
  }

  // 2. Check for dangerous double extensions (e.g. shell.php.jpg, backdoor.asp;.png)
  const parts = originalName.toLowerCase().split('.');
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      const subExt = parts[i].replace(/[^a-z0-9]/g, '');
      if (DANGEROUS_EXTENSIONS.has(subExt)) {
        return cb(new Error('Dangerous multi-extension file upload detected and blocked'));
      }
    }
  }

  // 3. Prevent path traversal or null byte injections in filename
  if (originalName.includes('/') || originalName.includes('\\') || originalName.includes('\0') || originalName.includes('..')) {
    return cb(new Error('Invalid filename structure detected'));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max ceiling (enforced down to 5MB/10MB in uploadService)
  },
  fileFilter,
});

export default upload;
