import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Banner from '../models/Banner.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Blog from '../models/Blog.js';
import FAQ from '../models/FAQ.js';
import TeamMember from '../models/TeamMember.js';
import Certification from '../models/Certification.js';
import Facility from '../models/Facility.js';
import Stat from '../models/Stat.js';
import Setting from '../models/Setting.js';
import Section from '../models/Section.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing collections...');

    await Promise.all([
      User.deleteMany(),
      Banner.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Blog.deleteMany(),
      FAQ.deleteMany(),
      TeamMember.deleteMany(),
      Certification.deleteMany(),
      Facility.deleteMany(),
      Stat.deleteMany(),
      Setting.deleteMany(),
      Section.deleteMany(),
    ]);

    console.log('👤 Seeding Admin User...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@onpharno.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Onpharno2026!';
    await User.create({
      name: 'System Superadmin',
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
    });
    console.log(`✅ Admin created: ${adminEmail}`);

    console.log('🏷️ Seeding Real Therapeutic Classes & Dosage Forms (SevenQ structure)...');
    const healthCategories = [
      'Multivitamins Supplement',
      'Women Supplement',
      'Kids Supplement',
      'Ortho Supplement',
      'Brain Memory and Neuro Supplement',
      'Stress Relief & Sleep Supplement',
      'Digestive & Probiotic Supplement',
      'Hair Skin and Nail Supplement',
      'Weight Loss Supplement',
      'Heart Supplement',
      'Eye Liver Kidney Supplement',
      'Energy & Gym Supplement',
    ];

    const dosageForms = [
      'Liquid-Filled Hard Capsules',
      'Capsule-in-Capsule',
      'Pellets-in-Capsule',
      'Gummies',
      'Effervescent Tablets',
      'Soft Gel Capsules',
      'Tablets',
      'Capsules',
      'Syrups & Liquids',
      'Oral Shots',
      'Sachets & Powders',
    ];

    const categoryDocs = [];
    for (let i = 0; i < healthCategories.length; i++) {
      categoryDocs.push({
        name: healthCategories[i],
        slug: healthCategories[i].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        type: 'health_category',
        order: i + 1,
        image: '/uploads/logo.png',
      });
    }
    for (let i = 0; i < dosageForms.length; i++) {
      categoryDocs.push({
        name: dosageForms[i],
        slug: dosageForms[i].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        type: 'dosage_form',
        order: i + 1,
        image: '/uploads/logo.png',
      });
    }
    await Category.insertMany(categoryDocs);

    console.log('🖼️ Seeding Hero Banners...');
    const banners = [
      {
        eyebrow: 'FSSAI Approved & WHO-GMP Certified',
        title: 'Trusted Nutraceutical Partner',
        subtitle: 'Delivering innovative, safe, and effective health solutions with modern formulation capabilities.',
        cta1Text: 'Explore Products',
        cta1Link: '/products',
        cta2Text: 'Start a Project',
        cta2Link: '/contact',
        imageDesktop: '/images/hero-banner-1.jpg',
        imageMobile: '/images/mobile-banner-1.jpg',
        order: 1,
      },
      {
        eyebrow: 'Private Label & Custom Formulation',
        title: 'Your Private Label Partner for Health Supplements',
        subtitle: 'From formulation to packaging, we provide end-to-end nutraceutical manufacturing solutions.',
        cta1Text: 'Get in Touch',
        cta1Link: '/contact',
        cta2Text: 'Private Label Solutions',
        cta2Link: '/capabilities/product-development',
        imageDesktop: '/images/hero-banner-2.jpg',
        imageMobile: '/images/mobile-banner-2.jpg',
        order: 2,
      },
      {
        eyebrow: 'cGMP-Certified Infrastructure',
        title: 'Your Reliable 3rd Party Manufacturing Partner',
        subtitle: 'GMP-certified processes, customized formulations, and on-time delivery you can count on.',
        cta1Text: 'Our Services',
        cta1Link: '/capabilities/product-development',
        cta2Text: 'Explore Facilities',
        cta2Link: '/about/facilities',
        imageDesktop: '/images/hero-banner-3.jpg',
        imageMobile: '/images/mobile-banner-3.jpg',
        order: 3,
      },
      {
        eyebrow: 'Advanced Dosage-Form Technology',
        title: 'Liquid-Filled Hard Capsules & Novel Delivery Formats',
        subtitle: 'Engineered for superior bioavailability, active stability, and distinctive brand differentiation.',
        cta1Text: 'Explore Liquid-Filled Capsules',
        cta1Link: '/products/liquid-filled-hard-capsules',
        cta2Text: 'Formulation R&D',
        cta2Link: '/capabilities/research-innovation',
        imageDesktop: '/images/facility-highlights.jpg',
        imageMobile: '/images/format-capsules.jpg',
        order: 4,
      },
      {
        eyebrow: 'Global Regulatory & Export Readiness',
        title: 'Building Healthcare Partnerships Beyond Borders',
        subtitle: 'Complete CTD dossier documentation, certificates of analysis, and trusted cross-border compliance.',
        cta1Text: 'Explore Global Partnerships',
        cta1Link: '/partner/global-partnerships',
        cta2Text: 'Contact Export Team',
        cta2Link: '/contact',
        imageDesktop: '/images/export-cargo.jpg',
        imageMobile: '/images/world-map.png',
        order: 5,
      },
    ];
    await Banner.insertMany(banners);

    console.log('📈 Seeding Stats & Counters...');
    const stats = [
      { label: 'Products & Formulations', value: '500', suffix: '+', order: 1 },
      { label: 'Countries Served', value: '15', suffix: '+', order: 2 },
      { label: 'Dosage Formats', value: '11', suffix: '+', order: 3 },
      { label: 'Years of Excellence', value: '17', suffix: '+', order: 4 },
    ];
    await Stat.insertMany(stats);

    console.log('📝 Seeding Blogs...');
    const blogs = [
      {
        title: 'Emerging Nutraceutical Trends',
        coverImage: '/images/facility-highlights.jpg',
        excerpt: 'Global consumer demand is rapidly shifting towards preventive healthcare, clean-label plant capsules, and highly bioavailable delivery formats.',
        content: '<p>The global nutraceutical landscape is experiencing a paradigm shift. Today’s discerning consumers demand scientific verification, uncompromising quality, and delivery formats that fit seamlessly into modern daily lifestyles.</p><p>By prioritizing bioavailability and vegetarian encapsulation options, brands can establish sustained market leadership.</p>',
        author: 'ONPHARNO Scientific Team',
        readTime: '5 min read',
      },
      {
        title: 'Choosing the Right Dosage Form',
        coverImage: '/images/format-capsules.jpg',
        excerpt: 'A comprehensive comparative analysis of liquid-filled hard capsules, tablets, and softgels for sensitive lipid and botanical actives.',
        content: '<p>Formulation scientists face a critical decision when choosing a dosage form. Lipid-based actives and hydrophobic ingredients require specialized carriers to prevent oxidation and optimize intestinal absorption.</p><p>Liquid-filled hard capsules provide distinct advantages in oxygen barrier properties and clean-label appeal.</p>',
        author: 'R&D Formulation Lead',
        readTime: '6 min read',
      },
      {
        title: 'Private Label vs Custom Formulation',
        coverImage: '/images/packaging-development.jpg',
        excerpt: 'How to strategically navigate time-to-market versus proprietary formulation exclusivity when scaling your healthcare portfolio.',
        content: '<p>Evaluating the trade-offs between rapid market entry through turnkey validated formulations versus developing custom proprietary IP from the laboratory up.</p>',
        author: 'Business Development Team',
        readTime: '4 min read',
      },
      {
        title: 'How to Launch a Supplement Brand',
        coverImage: '/images/customized-formulation.jpg',
        excerpt: 'A step-by-step roadmap for healthcare entrepreneurs: regulatory compliance, dosage format selection, and reliable supply chain alliances.',
        content: '<p>Launching a differentiated supplement brand requires meticulous alignment across formulation stability, label compliance, and cGMP commercial manufacturing.</p>',
        author: 'Regulatory Affairs Team',
        readTime: '7 min read',
      },
      {
        title: "Trends in Men's & Women's Health",
        coverImage: '/images/cat-women.jpg',
        excerpt: 'Targeted micro-nutrition formulations addressing hormonal balance, vitality, bone density, and healthy ageing across life stages.',
        content: '<p>Gender-specific nutrition continues to expand as clinical research illuminates distinct micronutrient synergies for metabolic and hormonal wellness.</p>',
        author: 'Nutritional Science Advisory',
        readTime: '5 min read',
      },
      {
        title: 'The Future of Effervescent Supplements',
        coverImage: '/images/format-effervescent.jpg',
        excerpt: 'Why effervescent tablets are dominating sports hydration and immunity categories through instantaneous dissolution and rapid gastric transit.',
        content: '<p>Effervescent dosage forms offer superior patient compliance, palatable flavor profiles, and rapid active absorption compared to bulky conventional tablets.</p>',
        author: 'Formulation R&D',
        readTime: '5 min read',
      },
      {
        title: 'Bioavailability and Modern Formulation',
        coverImage: '/images/scientist-pharmacist.png',
        excerpt: 'Overcoming the absorption barrier for poorly soluble herbal extracts and vitamins through self-emulsifying lipid formulation technologies.',
        content: '<p>Solubility and intestinal permeability determine therapeutic efficacy. Advanced lipid carrier systems bridge the gap between active potency and cellular delivery.</p>',
        author: 'Lead Research Scientist',
        readTime: '6 min read',
      },
      {
        title: 'Building an Export-Ready Healthcare Product',
        coverImage: '/images/export-cargo.jpg',
        excerpt: 'Essential regulatory guidelines, CTD dossier preparation, stability testing, and documentation required for seamless international market entry.',
        content: '<p>Navigating cross-border pharmaceutical and nutraceutical regulations demands comprehensive batch records, ICH stability protocols, and robust quality documentation.</p>',
        author: 'International Business Lead',
        readTime: '8 min read',
      },
    ];
    const blogsWithSlugs = blogs.map((b) => ({
      ...b,
      slug: b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
    await Blog.insertMany(blogsWithSlugs);

    console.log('💊 Seeding Real Products (from SevenQ Catalog + Signature Formats)...');
    const realProducts = [
      {
            "name": "MULTIVITAMIN GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Multivitamins Supplement",
            "description": "Essential daily micronutrient blend with Vitamins A, C, D3, E, B-Complex, and Zinc in pectin-based strawberry chewable gummies.",
            "images": [
                  "/uploads/products/multivitamin-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Vitamin C (Ascorbic Acid)",
                        "strength": "40 mg",
                        "purpose": "Immunity Support"
                  },
                  {
                        "ingredient": "Vitamin B12",
                        "strength": "2.5 mcg",
                        "purpose": "Energy Metabolism"
                  },
                  {
                        "ingredient": "Vitamin D3",
                        "strength": "400 IU",
                        "purpose": "Bone & Cellular Function"
                  },
                  {
                        "ingredient": "Zinc Citrate",
                        "strength": "5 mg",
                        "purpose": "Cellular Defense"
                  }
            ],
            "benefits": [
                  "100% Pectin-based vegan gummy",
                  "No artificial sweeteners or gelatin",
                  "Supports daily energy and immune resilience"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies) with Child-Resistant Cap",
            "featured": true
      },
      {
            "name": "MELATONIN GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Stress Relief & Sleep Supplement",
            "description": "Natural sleep aid gummy formulated with pure Melatonin 5mg, L-Theanine, and Chamomile flower extract for restful, restorative sleep cycles.",
            "images": [
                  "/uploads/products/melatonin-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Melatonin",
                        "strength": "5 mg",
                        "purpose": "Circadian Sleep Modulation"
                  },
                  {
                        "ingredient": "L-Theanine",
                        "strength": "50 mg",
                        "purpose": "Alpha-wave Relaxation"
                  },
                  {
                        "ingredient": "Chamomile Extract",
                        "strength": "25 mg",
                        "purpose": "Herbal Calming"
                  }
            ],
            "benefits": [
                  "Accelerates sleep onset naturally",
                  "Non-habit forming with zero morning fog",
                  "Berry flavor chewable"
            ],
            "moq": "15,000 Jars",
            "packaging": "Amber PET Jar (30/60 gummies)",
            "featured": true
      },
      {
            "name": "SKIN GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Hair Skin and Nail Supplement",
            "description": "Advanced dermal rejuvenation gummy featuring L-Glutathione, Hyaluronic Acid, and Vitamin C for skin hydration, glow, and elasticity.",
            "images": [
                  "/uploads/products/skin-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "L-Glutathione (Reduced)",
                        "strength": "100 mg",
                        "purpose": "Skin Brightening & Free Radical Defense"
                  },
                  {
                        "ingredient": "Hyaluronic Acid",
                        "strength": "50 mg",
                        "purpose": "Deep Dermal Hydration"
                  },
                  {
                        "ingredient": "Vitamin C",
                        "strength": "40 mg",
                        "purpose": "Collagen Synthesis"
                  }
            ],
            "benefits": [
                  "Improves skin luminosity and tone",
                  "Enhances dermal moisture retention",
                  "Clinically validated oral beauty formula"
            ],
            "moq": "15,000 Jars",
            "packaging": "Clear Square Jar (60 gummies)",
            "featured": true
      },
      {
            "name": "HAIR GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Hair Skin and Nail Supplement",
            "description": "Clinically designed hair and nail nutrient gummy with high-potency Biotin 10,000 mcg, Folic Acid, and Zinc to strengthen roots and stop breakage.",
            "images": [
                  "/uploads/products/hair-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Biotin (Vitamin B7)",
                        "strength": "10,000 mcg",
                        "purpose": "Keratin Follicle Strength"
                  },
                  {
                        "ingredient": "Zinc Bisglycinate",
                        "strength": "7.5 mg",
                        "purpose": "Cellular Hair Repair"
                  },
                  {
                        "ingredient": "Folic Acid",
                        "strength": "400 mcg",
                        "purpose": "Erythrocyte Production"
                  }
            ],
            "benefits": [
                  "Reduces hair shedding and stimulates growth",
                  "Strengthens brittle, splitting nails",
                  "Delicious fruit berry flavor"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)",
            "featured": true
      },
      {
            "name": "ACV APPLE CIDER VINEGAR GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Weight Loss Supplement",
            "description": "Raw, unfiltered Apple Cider Vinegar with the Mother (500mg) and Vitamin B12 to support digestion, appetite control, and metabolic balance.",
            "images": [
                  "/uploads/products/acv-apple-cider-vinegar-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Raw Apple Cider Vinegar (with the Mother)",
                        "strength": "500 mg",
                        "purpose": "Metabolic & Glycemic Balance"
                  },
                  {
                        "ingredient": "Ginger Root Extract",
                        "strength": "10 mg",
                        "purpose": "Gastric Soothing"
                  },
                  {
                        "ingredient": "Vitamin B12",
                        "strength": "2.4 mcg",
                        "purpose": "Lipid & Carbohydrate Metabolism"
                  }
            ],
            "benefits": [
                  "All benefits of liquid ACV without tooth enamel damage",
                  "Aids healthy weight management and digestion"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)",
            "featured": true
      },
      {
            "name": "CREATINE GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Energy & Gym Supplement",
            "description": "Ultra-convenient athletic workout gummies delivering 3000mg micronized Creatine Monohydrate for muscle ATP explosive power and lean mass growth.",
            "images": [
                  "/uploads/products/creatine-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Micronized Creatine Monohydrate",
                        "strength": "3000 mg",
                        "purpose": "Muscle Phosphocreatine Stores"
                  },
                  {
                        "ingredient": "Dextrose Transport Matrix",
                        "strength": "500 mg",
                        "purpose": "Accelerated Muscle Uptake"
                  }
            ],
            "benefits": [
                  "No messy powder shakers or water needed",
                  "Boosts maximum power output and recovery speed"
            ],
            "moq": "15,000 Jars",
            "packaging": "Matte Black Jar (90 gummies)",
            "featured": true
      },
      {
            "name": "MAGNESIUM GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Stress Relief & Sleep Supplement",
            "description": "High-absorption Magnesium Glycinate gummy for musculoskeletal relaxation, nervous system calming, and nocturnal cramp relief.",
            "images": [
                  "/uploads/products/magnesium-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Elemental Magnesium (as Bisglycinate)",
                        "strength": "200 mg",
                        "purpose": "Neuromuscular Relaxation"
                  },
                  {
                        "ingredient": "Vitamin B6",
                        "strength": "2 mg",
                        "purpose": "GABA Synthesis"
                  }
            ],
            "benefits": [
                  "Gentle on digestion with zero laxative effect",
                  "Eases physical muscle tightness and mental tension"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "ASHWAGANDHA GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Stress Relief & Sleep Supplement",
            "description": "Clinically proven full-spectrum KSM-66 Ashwagandha extract in chewable gummies for stress management, cortisol balance, and vitality.",
            "images": [
                  "/uploads/products/ashwagandha-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "KSM-66 Ashwagandha Root Extract (5% Withanolides)",
                        "strength": "300 mg",
                        "purpose": "Adaptogen & Stress Control"
                  },
                  {
                        "ingredient": "Vitamin D2",
                        "strength": "400 IU",
                        "purpose": "Immunity Support"
                  }
            ],
            "benefits": [
                  "Lowers stress and cortisol markers",
                  "Improves endurance, mental focus, and sexual stamina"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "SHILAJIT GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Energy & Gym Supplement",
            "description": "Purified Himalayan Shilajit with 60% Fulvic Acid and ionic minerals in a delicious gummy that eliminates raw shilajit bitterness.",
            "images": [
                  "/uploads/products/shilajit-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Purified Himalayan Shilajit Extract (60% Fulvic Acid)",
                        "strength": "250 mg",
                        "purpose": "Cellular Bio-vitality & Testosterone"
                  },
                  {
                        "ingredient": "Safed Musli Root Extract",
                        "strength": "50 mg",
                        "purpose": "Physical Endurance"
                  }
            ],
            "benefits": [
                  "Enhances natural stamina and energy without crashes",
                  "Palatable formulation for modern consumers"
            ],
            "moq": "15,000 Jars",
            "packaging": "Black Jar (60 gummies)"
      },
      {
            "name": "EYE GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Eye Liver Kidney Supplement",
            "description": "Digital blue light protection gummy packed with free-form Lutein 20mg, Zeaxanthin 4mg, and Bilberry extract for retina health.",
            "images": [
                  "/uploads/products/eye-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Lutein (from Marigold Extract)",
                        "strength": "20 mg",
                        "purpose": "Macular Optical Pigment"
                  },
                  {
                        "ingredient": "Zeaxanthin Isomers",
                        "strength": "4 mg",
                        "purpose": "Foveal Photoprotection"
                  },
                  {
                        "ingredient": "Bilberry Extract",
                        "strength": "25 mg",
                        "purpose": "Microvascular Tone"
                  }
            ],
            "benefits": [
                  "Relieves screen fatigue, dryness, and glare strain",
                  "Protects central macular vision"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "PROBIOTIC GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Digestive & Probiotic Supplement",
            "description": "Stable spore-based Bacillus Coagulans (2 Billion CFU) with chicory inulin prebiotic fiber to maintain balanced intestinal flora.",
            "images": [
                  "/uploads/products/probiotic-gummies-gut-heath-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Bacillus Coagulans Spores",
                        "strength": "2 Billion CFU",
                        "purpose": "Gut Flora Colonization"
                  },
                  {
                        "ingredient": "Inulin (Chicory Prebiotic)",
                        "strength": "200 mg",
                        "purpose": "Microbial Nourishment"
                  }
            ],
            "benefits": [
                  "100% shelf stable without refrigeration",
                  "Relieves occasional gas, bloating, and irregular transit"
            ],
            "moq": "15,000 Jars",
            "packaging": "Desiccant Sealed Jar (60 gummies)"
      },
      {
            "name": "CHYAWANPRASH GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Kids Supplement",
            "description": "Traditional 40-herb Ayurvedic immunity formula transformed into delicious child-friendly chewable pectin gummies for cough and cold protection.",
            "images": [
                  "/uploads/products/chyawanprash-gummies-cough-and-cold-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Fresh Amla Puree (Natural Vitamin C)",
                        "strength": "500 mg",
                        "purpose": "Immune Defense"
                  },
                  {
                        "ingredient": "Classic 40-Herb Decoction Complex",
                        "strength": "250 mg",
                        "purpose": "Respiratory Resilience"
                  }
            ],
            "benefits": [
                  "Zero mess alternative to sticky herbal jams",
                  "Loved by children and adults alike"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "IMMUNITY GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Multivitamins Supplement",
            "description": "Triple defense immunity shield gummy combining Black Elderberry (Sambucus nigra), high-dose Vitamin C, and Zinc Bisglycinate.",
            "images": [
                  "/uploads/products/immunity-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Sambucus Black Elderberry Extract",
                        "strength": "100 mg",
                        "purpose": "Antiviral Flavonoids"
                  },
                  {
                        "ingredient": "Vitamin C (Ascorbic Acid)",
                        "strength": "60 mg",
                        "purpose": "Cellular Immunity"
                  },
                  {
                        "ingredient": "Zinc Bisglycinate",
                        "strength": "5 mg",
                        "purpose": "T-Cell Activation"
                  }
            ],
            "benefits": [
                  "Fast-acting seasonal immune fortification",
                  "Rich natural elderberry taste"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "IRON GUMMIES FOR WOMEN",
            "dosageForm": "Gummies",
            "healthCategory": "Women Supplement",
            "description": "Gentle, non-constipating Ferrous Bisglycinate iron gummy with Vitamin C, Folic Acid, and B12 for red blood cells and women's daily energy.",
            "images": [
                  "/uploads/products/iron-gummies-for-women.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Elemental Iron (Ferrous Bisglycinate)",
                        "strength": "18 mg",
                        "purpose": "Hemoglobin Synthesis"
                  },
                  {
                        "ingredient": "Vitamin C",
                        "strength": "30 mg",
                        "purpose": "Iron Uptake Catalyst"
                  },
                  {
                        "ingredient": "Folic Acid",
                        "strength": "400 mcg",
                        "purpose": "Red Blood Cell Health"
                  }
            ],
            "benefits": [
                  "No metallic taste, nausea, or digestive binding",
                  "Ideal for prenatal and reproductive female wellness"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "FIBER GUMMIES",
            "dosageForm": "Gummies",
            "healthCategory": "Digestive & Probiotic Supplement",
            "description": "Prebiotic dietary fiber gummies delivering 3 grams of soluble inulin fiber per serving to nourish gut microbiome and support digestive regularity.",
            "images": [
                  "/uploads/products/fiber-gummies.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Soluble Chicory Inulin Prebiotic Fiber",
                        "strength": "3000 mg",
                        "purpose": "Stool Regularity & Microbiome Food"
                  }
            ],
            "benefits": [
                  "Promotes comfortable daily bowel movements",
                  "Natural orange, peach, and berry mixed flavors"
            ],
            "moq": "15,000 Jars",
            "packaging": "PET Jar (60 gummies)"
      },
      {
            "name": "MULTIVITAMIN TABLETS",
            "dosageForm": "Tablets",
            "healthCategory": "Multivitamins Supplement",
            "description": "Comprehensive once-daily coated multivitamin tablet containing 24 essential vitamins, chelated minerals, and ginseng antioxidants.",
            "images": [
                  "/uploads/products/multivitamin-tablets.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "24 Vitamin & Mineral Complete Complex",
                        "strength": "100% RDA",
                        "purpose": "Full Body Nutrition"
                  },
                  {
                        "ingredient": "Korean Panax Ginseng Extract",
                        "strength": "50 mg",
                        "purpose": "Physical & Mental Stamina"
                  }
            ],
            "benefits": [
                  "Film-coated for easy swallowing with no odor",
                  "Cost-effective, high-volume private label formula"
            ],
            "moq": "50,000 Tablets",
            "packaging": "Blister (10x10) or HDPE Bottle (60 tabs)"
      },
      {
            "name": "COENZYME Q10 TABLETS",
            "dosageForm": "Tablets",
            "healthCategory": "Heart Supplement",
            "description": "Potent heart and vascular tablet with CoQ10 100mg, L-Carnitine, Lycopene, and Zinc for cardiovascular cellular vitality.",
            "images": [
                  "/uploads/products/coenzyme-q10-tablets.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Coenzyme Q10 (Ubiquinone)",
                        "strength": "100 mg",
                        "purpose": "Cardiac ATP Production"
                  },
                  {
                        "ingredient": "L-Carnitine L-Tartrate",
                        "strength": "250 mg",
                        "purpose": "Fatty Acid Transport"
                  }
            ],
            "benefits": [
                  "Promotes healthy blood pressure and endothelial function",
                  "Statin-induced CoQ10 depletion replenishment"
            ],
            "moq": "50,000 Tablets",
            "packaging": "Alu-Alu Blister Pack"
      },
      {
            "name": "APPLE CIDER VINEGAR EFFERVESCENT TABLET",
            "dosageForm": "Effervescent Tablets",
            "healthCategory": "Weight Loss Supplement",
            "description": "Sparkling instant effervescent tablet with 500mg raw Apple Cider Vinegar, pomegranate extract, and Vitamin B6/B12 for crisp, refreshing weight control.",
            "images": [
                  "/uploads/products/apple-cider-vinegar-effervescent-tablet.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Apple Cider Vinegar Extract",
                        "strength": "500 mg",
                        "purpose": "Glycemic & Metabolic Support"
                  },
                  {
                        "ingredient": "Pomegranate Extract",
                        "strength": "100 mg",
                        "purpose": "Antioxidant Polyphenols"
                  }
            ],
            "benefits": [
                  "Delicious fizzy green apple drink",
                  "Dissolves in 45 seconds with zero residue"
            ],
            "moq": "10,000 Tubes",
            "packaging": "Moisture-Tight Aluminum Tube (20 tablets)",
            "featured": true
      },
      {
            "name": "CALCIUM EFFERVESCENT TABLET",
            "dosageForm": "Effervescent Tablets",
            "healthCategory": "Ortho Supplement",
            "description": "Fast-absorbing bone density tablet with Calcium Carbonate, Vitamin D3, Vitamin K2-7 (Menaquinone-7), and Magnesium for optimal calcium deposition.",
            "images": [
                  "/uploads/products/calcium-effervescent-tablet.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Elemental Calcium",
                        "strength": "500 mg",
                        "purpose": "Bone Mineralization"
                  },
                  {
                        "ingredient": "Vitamin D3",
                        "strength": "400 IU",
                        "purpose": "Intestinal Calcium Absorption"
                  },
                  {
                        "ingredient": "Vitamin K2-7",
                        "strength": "55 mcg",
                        "purpose": "Arterial Calcification Defense"
                  }
            ],
            "benefits": [
                  "Superior calcium absorption compared to dry chalky pills",
                  "Tangy orange flavor"
            ],
            "moq": "10,000 Tubes",
            "packaging": "Tube (20 effervescent tabs)"
      },
      {
            "name": "OMEGA 3 CAPSULES",
            "dosageForm": "Soft Gel Capsules",
            "healthCategory": "Heart Supplement",
            "description": "Triple strength molecularly distilled Omega-3 fish oil softgels delivering 1000mg with 360mg EPA and 240mg DHA for heart, brain, and joint mobility.",
            "images": [
                  "/uploads/products/omega-3-capsules.webp"
            ],
            "composition": [
                  {
                        "ingredient": "Fish Oil Complex (Omega-3)",
                        "strength": "1000 mg",
                        "purpose": "Systemic Anti-inflammatory"
                  },
                  {
                        "ingredient": "EPA (Eicosapentaenoic Acid)",
                        "strength": "360 mg",
                        "purpose": "Triglyceride Modulation"
                  },
                  {
                        "ingredient": "DHA (Docosahexaenoic Acid)",
                        "strength": "240 mg",
                        "purpose": "Brain Neuronal Support"
                  }
            ],
            "benefits": [
                  "Heavy metal & mercury tested",
                  "Burpless formulation with natural lemon oil"
            ],
            "moq": "50,000 Softgels",
            "packaging": "Bottle (60 softgels) or Blister"
      },
      {
            "name": "L CARNITINE SHOTS",
            "dosageForm": "Oral Shots",
            "healthCategory": "Energy & Gym Supplement",
            "description": "Ready-to-drink concentrated 25ml liquid shot delivering 3000mg pure L-Carnitine with Vitamin B5 for cellular fat burning and intense workout energy.",
            "images": [
                  "/uploads/products/l-carnitine-shots.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Pure L-Carnitine Base",
                        "strength": "3000 mg",
                        "purpose": "Mitochondrial Fatty Acid Beta-Oxidation"
                  },
                  {
                        "ingredient": "Pantothenic Acid (Vitamin B5)",
                        "strength": "5 mg",
                        "purpose": "Energy Co-enzyme"
                  }
            ],
            "benefits": [
                  "Instant pre-workout liquid energy shot",
                  "Fast gastric absorption without digestion lag"
            ],
            "moq": "25,000 Vials",
            "packaging": "25ml Amber PET Vials (Pack of 10 or 30)",
            "featured": true
      },
      {
            "name": "PROBIOTIC SHOTS",
            "dosageForm": "Oral Shots",
            "healthCategory": "Digestive & Probiotic Supplement",
            "description": "Ready-to-drink 25ml multi-strain liquid probiotic shot with digestive enzymes and prebiotic inulin for instant gastrointestinal comfort.",
            "images": [
                  "/uploads/products/probiotic-shots.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Multi-Strain Spore Probiotic Blend",
                        "strength": "5 Billion CFU",
                        "purpose": "Flora Balance"
                  },
                  {
                        "ingredient": "Enzyme Complex (Amylase, Protease, Lipase)",
                        "strength": "50 mg",
                        "purpose": "Food Breakdown"
                  }
            ],
            "benefits": [
                  "Immediate soothing relief for digestive heaviness",
                  "Delicious naturally sweetened taste"
            ],
            "moq": "25,000 Vials",
            "packaging": "25ml Vials (Pack of 10)"
      },
      {
            "name": "VITAMIN D3 SHOTS",
            "dosageForm": "Oral Shots",
            "healthCategory": "Ortho Supplement",
            "description": "High-potency single-dose 5ml oral solution delivering 60,000 IU Cholecalciferol (Vitamin D3) for acute clinical deficiency correction.",
            "images": [
                  "/uploads/products/vitamin-d3-shots.jpg"
            ],
            "composition": [
                  {
                        "ingredient": "Cholecalciferol (Vitamin D3)",
                        "strength": "60,000 IU",
                        "purpose": "Bone & Immune Deficiency Correction"
                  }
            ],
            "benefits": [
                  "Palatable butterscotch / sugar-free oral shot",
                  "Clinically recommended weekly protocol"
            ],
            "moq": "25,000 Vials",
            "packaging": "5ml Plastic Ampoules (Pack of 4)"
      }
];

    const productsWithSlugs = realProducts.map((p) => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
    await Product.insertMany(productsWithSlugs);

    console.log('❓ Seeding FAQs...');
    const faqs = [
      {
        question: 'What are Liquid-Filled Hard Capsules?',
        answer: 'They are two-piece hard gelatin or vegetarian HPMC capsules filled with liquid, oily, or paste formulations and sealed hermetically with a tamper-evident band around the joint.',
        category: 'liquid-filled',
        order: 1,
      },
      {
        question: 'How do Liquid-Filled Capsules differ from Softgels?',
        answer: 'Liquid-filled capsules offer superior oxygen barrier protection, contain significantly less plasticizer, allow 100% plant-based vegetarian HPMC shells, and allow distinctive two-tone branding with sealing bands.',
        category: 'liquid-filled',
        order: 2,
      },
      {
        question: 'What are your standard Minimum Order Quantities (MOQs)?',
        answer: 'Our standard MOQ for liquid-filled hard capsules is 50,000 units. For gummies, MOQs start from 15,000 jars. For tablets and effervescents, MOQs start from 50,000 units. For oral shots, MOQs begin at 25,000 vials.',
        category: 'manufacturing',
        order: 3,
      },
      {
        question: 'Can you customize formulations with our proprietary ingredients?',
        answer: 'Yes! Our R&D and analytical formulation team works with both custom proprietary ingredient combinations as well as turnkey market-ready formulas.',
        category: 'general',
        order: 4,
      },
      {
        question: 'Do you provide full export regulatory documentation?',
        answer: 'Yes, we supply complete batch manufacturing records (BMR), certificates of analysis (COA), accelerated stability testing dossiers, and CTD dossiers for MOH approvals worldwide across 15+ countries.',
        category: 'partnership',
        order: 5,
      },
    ];
    await FAQ.insertMany(faqs);

    console.log('🏆 Seeding Certifications (FSSAI, GMP, ISO, Halal)...');
    const certs = [
      { title: 'FSSAI Approved Facility', code: 'FSSAI', authority: 'Food Safety and Standards Authority of India', description: 'Certified manufacturing infrastructure meeting the highest statutory standards for food and supplement safety.' },
      { title: 'WHO-GMP Compliant', code: 'cGMP', authority: 'World Health Organization Good Manufacturing Practices', description: 'Class 100,000 cleanrooms, HEPA filtration, automated environmental monitoring, and validated batch controls.' },
      { title: 'ISO 22000:2018', code: 'ISO-22000', authority: 'International Food Safety Management System', description: 'HACCP-based hazard analysis and preventive safety systems across raw material procurement and finished product dispatch.' },
      { title: 'ISO 9001:2015', code: 'ISO-9001', authority: 'Quality Management Systems', description: 'Standardized operating procedures, strict document control, analytical calibration, and continuous audit trails.' },
    ];
    await Certification.insertMany(certs);

    console.log('⚙️ Seeding Default Site Settings...');
    await Setting.create({
      companyName: 'ONPHARNO',
      tagline: 'Advanced Dosage-Form Technology & Healthcare Manufacturing',
      logo: '/logo.png',
      logoWhite: '/logo.png',
      favicon: '/favicon.png',
      phone: '+91 89809 40940',
      email: 'sales@onpharno.com',
      address: 'Pharmaceutical Technology Park, Innovation Drive, Ahmedabad, Gujarat, India',
      workingHours: 'Monday - Saturday: 9:00 AM - 6:30 PM (IST)',
      whatsappNumber: '+918980940940',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/onpharno',
        instagram: 'https://instagram.com/onpharno',
        email: 'mailto:sales@onpharno.com',
      },
    });

    console.log('✨ SevenQ-Aligned Real Database Seeding Completed Successfully! ✨');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
