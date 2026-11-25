/* Import categories + products into the Onpharno_Server- database.
   Copy this pack's /data and /scripts folders into the Onpharno_Server- repo root, then:
     node scripts/import-products.js --dry-run
     node scripts/import-products.js --confirm              (imports as DRAFT)
     node scripts/import-products.js --confirm --publish    (imports as PUBLISHED)
     Add --no-images to skip copying images.
   Images: copied from ../images to UPLOAD_DIR (default ./uploads) as /uploads/products/<slug>.webp
   and /uploads/categories/<slug>.webp, and registered in the Media collection if that model exists.
   Uses MONGO_URI from .env. Upserts by slug, so it is safe to re-run. */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const PUBLISH = args.includes('--publish');
const NO_IMAGES = args.includes('--no-images');
if (!DRY && !args.includes('--confirm')) { console.error('Use --dry-run or --confirm'); process.exit(1); }
if (process.env.NODE_ENV === 'production' && !args.includes('--force')) { console.error('Refusing to run with NODE_ENV=production without --force'); process.exit(1); }

const Product = require(path.join(process.cwd(), 'src/models/Product'));
const Category = require(path.join(process.cwd(), 'src/models/Category'));
const products = require('../data/products.json');
const cats = require('../data/categories.json');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
async function copyImages() {
  let Media = null;
  try { Media = require(path.join(process.cwd(), 'src/models/Media')); } catch (e) { /* Media model optional */ }
  let n = 0;
  for (const sub of ['products', 'categories']) {
    const src = path.join(__dirname, '..', 'images', sub);
    const dst = path.join(UPLOAD_DIR, sub);
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, f), path.join(dst, f));
      n++;
      if (Media) {
        const url = `/uploads/${sub}/${f}`;
        const size = fs.statSync(path.join(dst, f)).size;
        try { await Media.findOneAndUpdate({ url }, { $set: { filename: f, originalName: f, mimeType: 'image/webp', size, path: url, url } }, { upsert: true }); } catch (e) { /* ignore schema differences */ }
      }
    }
  }
  console.log(`Copied ${n} images to ${UPLOAD_DIR}`);
}

(async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
  await mongoose.connect(process.env.MONGO_URI);
  if (!DRY && !NO_IMAGES) await copyImages();
  const idBySlug = {};
  for (const c of cats) {
    if (DRY) { idBySlug[c.type + ':' + c.name] = null; continue; }
    const cdata = NO_IMAGES ? { ...c, image: '' } : c;
    const doc = await Category.findOneAndUpdate({ slug: c.slug, type: c.type }, { $set: cdata }, { upsert: true, new: true, setDefaultsOnInsert: true });
    idBySlug[c.type + ':' + c.name] = doc._id;
  }
  let ok = 0, fail = 0;
  for (const p of products) {
    const doc = {
      name: p.name, slug: p.slug, dosageForm: p.dosageForm, healthCategory: p.healthCategory,
      categories: [idBySlug['health_category:' + p.healthCategory], idBySlug['dosage_form:' + p.dosageForm]].filter(Boolean),
      images: NO_IMAGES ? [] : (p.images || []), description: p.description, composition: p.composition, benefits: p.benefits,
      packaging: p.packaging, moq: p.moq, featured: p.featured,
      status: PUBLISH ? 'published' : 'draft',
      seo: { title: p.seo.title, description: p.seo.description, keywords: p.seo.keywords },
    };
    try {
      if (DRY) { await new Product(doc).validate(); }
      else { await Product.findOneAndUpdate({ slug: p.slug }, { $set: doc }, { upsert: true, runValidators: true, setDefaultsOnInsert: true }); }
      ok++;
    } catch (e) { fail++; console.error('FAIL', p.slug, '-', e.message); }
  }
  console.log(`${DRY ? 'Validated' : 'Imported'} ${ok} products, ${fail} failed, ${cats.length} categories/forms.`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
