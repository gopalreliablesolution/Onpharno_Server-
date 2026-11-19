import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGO_URI || 'mongodb+srv://REDACTED_DB_USER:REDACTED@cluster0.hwr8pvi.mongodb.net/onpharno?retryWrites=true&w=majority';

async function seedAboutSteps() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const filter = { pageKey: 'about', key: 'about_steps' };
  const update = {
    $set: {
      pageKey: 'about',
      key: 'about_steps',
      name: 'From Idea to Market (7 Steps)',
      type: 'Number Grid + CTA Banner',
      title: '',
      subtitle: '',
      image: '',
      visible: true,
      content: {
        eyebrow: '2A2. FROM IDEA TO MARKET',
        title: 'From Idea to Market in 7 Seamless Steps',
        subtitle: 'A structured, de-risked pathway designed to bring breakthrough healthcare products to life.',
        ctaEyebrow: 'READY TO START?',
        ctaTitle: "Let's discuss your formulation idea.",
        ctaDesc: 'Our technical formulation team will review your requirements under NDA.',
        ctaText: 'Start Your Product Journey',
        ctaLink: '/products',
        bannerImage: '/images/scientist-pharmacist.png',
        trustPoint1: 'Your Ideas, Our Expertise',
        trustPoint2: 'Confidential & Secure',
        trustPoint3: 'End-to-End Support',
        items: [
          {
            num: '01',
            title: '01 — DISCOVER',
            desc: 'Understand your opportunity, category, Consumer and product requirements.',
            icon: 'fa-solid fa-magnifying-glass',
            link: '/capabilities/product-development',
          },
          {
            num: '02',
            title: '02 — DEVELOP',
            desc: 'Select a relevant formulation or work towards a customized solution.',
            icon: 'fa-solid fa-flask-vial',
            link: '/capabilities/product-development',
          },
          {
            num: '03',
            title: '03 — SELECT',
            desc: 'Evaluate the appropriate dosage form and product configuration.',
            icon: 'fa-solid fa-capsules',
            link: '/capabilities/product-formats',
          },
          {
            num: '04',
            title: '04 — FINALIZE',
            desc: 'Align formulation, specifications, packaging and commercial requirements.',
            icon: 'fa-solid fa-shield-halved',
            link: '/about/quality',
          },
          {
            num: '05',
            title: '05 — MANUFACTURE',
            desc: 'Execute production through structured, quality-focused processes.',
            icon: 'fa-solid fa-industry',
            link: '/capabilities/manufacturing',
          },
          {
            num: '06',
            title: '06 — PACKAGE',
            desc: 'Create practical, complaint and market-ready packaging solutions.',
            icon: 'fa-solid fa-box-open',
            link: '/capabilities/packaging-documentation',
          },
          {
            num: '07',
            title: '07 — DELIVER',
            desc: 'Support reliable supply aligned with your market requirements.',
            icon: 'fa-solid fa-truck-fast',
            link: '/partner/global-partnerships',
          },
        ],
      },
      updatedAt: new Date(),
    },
  };

  const res = await mongoose.connection.collection('sections').updateOne(filter, update, { upsert: true });
  console.log('Seeded about_steps:', res);
  await mongoose.disconnect();
}

seedAboutSteps().catch((err) => {
  console.error('Error seeding about_steps:', err);
  process.exit(1);
});
