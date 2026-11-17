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
    const adminPassword = process.env.ADMIN_PASSWORD || 'REDACTED_ADMIN_PASSWORD';
    await User.create({
      name: 'System Superadmin',
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
    });
    console.log(`✅ Admin created: ${adminEmail}`);

    console.log('🏷️ Seeding Categories & Dosage Forms...');
    const healthCategories = [
      'Daily Wellness',
      "Men's Health",
      "Women's Health",
      'Beauty Nutrition',
      'Sports Nutrition',
      'Healthy Ageing',
      'Gut Health',
      'Immunity',
      'Bone & Joint',
      'Brain Health',
      'Sleep & Stress',
      'Specialized Nutrition',
    ];

    const dosageForms = [
      'Liquid-Filled Hard Capsules',
      'Capsule-in-Capsule',
      'Pellets-in-Capsule',
      'Tablets',
      'Capsules',
      'Softgels',
      'Effervescent',
      'Sachets & Powders',
      'Gummies',
      'Liquids & Syrups',
      'Oral Shots',
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
        eyebrow: 'ADVANCED DOSAGE-FORM TECHNOLOGY',
        title: 'Liquid-Filled Hard Capsules. A Distinctive Format for Modern Healthcare Products.',
        subtitle: 'Formulation • R&D • Manufacturing • Quality • Private Label • Global Partnerships',
        cta1Text: 'Explore Liquid-Filled Capsules →',
        cta1Link: '/products/liquid-filled-hard-capsules',
        cta2Text: 'Start a Project →',
        cta2Link: '/contact',
        order: 1,
      },
      {
        eyebrow: 'SCIENCE-LED HEALTHCARE SOLUTIONS',
        title: 'Your Partner for Healthcare Product Innovation.',
        subtitle: 'From initial therapeutic concept to commercial cGMP manufacturing and global export.',
        cta1Text: 'Explore ONPHARNO →',
        cta1Link: '/about/our-story',
        cta2Text: 'Partner With Us →',
        cta2Link: '/partner/global-partnerships',
        order: 2,
      },
      {
        eyebrow: 'PRIVATE LABEL SOLUTIONS',
        title: 'Your Brand. Our Product & Manufacturing Expertise.',
        subtitle: 'Ready-to-launch validated formulations in premium advanced delivery formats.',
        cta1Text: 'Explore Private Label →',
        cta1Link: '/products',
        cta2Text: 'Contact Our Team →',
        cta2Link: '/contact',
        order: 3,
      },
      {
        eyebrow: 'CUSTOM PRODUCT DEVELOPMENT',
        title: "Have an Idea? Let's Build the Right Product Around It.",
        subtitle: 'Full-spectrum formulation R&D, stability testing, and pilot clinical batch execution.',
        cta1Text: 'Start Your Product Journey →',
        cta1Link: '/contact',
        cta2Text: 'View Capabilities →',
        cta2Link: '/capabilities/product-development',
        order: 4,
      },
      {
        eyebrow: 'GLOBAL PARTNERSHIPS',
        title: 'Building Healthcare Partnerships Beyond Borders.',
        subtitle: 'Trusted contract manufacturing and CTD dossier registration support across 10+ countries.',
        cta1Text: 'Explore Global Partnerships →',
        cta1Link: '/partner/global-partnerships',
        cta2Text: 'Start a Project →',
        cta2Link: '/contact',
        order: 5,
      },
    ];
    await Banner.insertMany(banners);

    console.log('📈 Seeding Stats & Counters...');
    const stats = [
      { label: 'Products & Formulations', value: '500', suffix: '+', order: 1 },
      { label: 'Business Partners', value: '20', suffix: '+', order: 2 },
      { label: 'Countries Served', value: '10', suffix: '+', order: 3 },
      { label: 'Years of Experience', value: '12', suffix: '+', order: 4 },
    ];
    await Stat.insertMany(stats);

    console.log('📝 Seeding Blogs (8 required articles)...');
    const blogs = [
      {
        title: 'Emerging Nutraceutical Trends',
        excerpt: 'Global consumer demand is rapidly shifting towards preventive healthcare, clean-label plant capsules, and highly bioavailable delivery formats.',
        content: '<p>The global nutraceutical landscape is experiencing a paradigm shift. Today’s discerning consumers demand scientific verification, uncompromising quality, and delivery formats that fit seamlessly into modern daily lifestyles.</p><p>By prioritizing bioavailability and vegetarian encapsulation options, brands can establish sustained market leadership.</p>',
        author: 'ONPHARNO Scientific Team',
        readTime: '5 min read',
      },
      {
        title: 'Choosing the Right Dosage Form',
        excerpt: 'A comprehensive comparative analysis of liquid-filled hard capsules, tablets, and softgels for sensitive lipid and botanical actives.',
        content: '<p>Formulation scientists face a critical decision when choosing a dosage form. Lipid-based actives and hydrophobic ingredients require specialized carriers to prevent oxidation and optimize intestinal absorption.</p><p>Liquid-filled hard capsules provide distinct advantages in oxygen barrier properties and clean-label appeal.</p>',
        author: 'R&D Formulation Lead',
        readTime: '6 min read',
      },
      {
        title: 'Private Label vs Custom Formulation',
        excerpt: 'How to strategically navigate time-to-market versus proprietary formulation exclusivity when scaling your healthcare portfolio.',
        content: '<p>Evaluating the trade-offs between rapid market entry through turnkey validated formulations versus developing custom proprietary IP from the laboratory up.</p>',
        author: 'Business Development Team',
        readTime: '4 min read',
      },
      {
        title: 'How to Launch a Supplement Brand',
        excerpt: 'A step-by-step roadmap for healthcare entrepreneurs: regulatory compliance, dosage format selection, and reliable supply chain alliances.',
        content: '<p>Launching a differentiated supplement brand requires meticulous alignment across formulation stability, label compliance, and cGMP commercial manufacturing.</p>',
        author: 'Regulatory Affairs Team',
        readTime: '7 min read',
      },
      {
        title: "Trends in Men's & Women's Health",
        excerpt: 'Targeted micro-nutrition formulations addressing hormonal balance, vitality, bone density, and healthy ageing across life stages.',
        content: '<p>Gender-specific nutrition continues to expand as clinical research illuminates distinct micronutrient synergies for metabolic and hormonal wellness.</p>',
        author: 'Nutritional Science Advisory',
        readTime: '5 min read',
      },
      {
        title: 'The Future of Effervescent Supplements',
        excerpt: 'Why effervescent tablets are dominating sports hydration and immunity categories through instantaneous dissolution and rapid gastric transit.',
        content: '<p>Effervescent dosage forms offer superior patient compliance, palatable flavor profiles, and rapid active absorption compared to bulky conventional tablets.</p>',
        author: 'Formulation R&D',
        readTime: '5 min read',
      },
      {
        title: 'Bioavailability and Modern Formulation',
        excerpt: 'Overcoming the absorption barrier for poorly soluble herbal extracts and vitamins through self-emulsifying lipid formulation technologies.',
        content: '<p>Solubility and intestinal permeability determine therapeutic efficacy. Advanced lipid carrier systems bridge the gap between active potency and cellular delivery.</p>',
        author: 'Lead Research Scientist',
        readTime: '6 min read',
      },
      {
        title: 'Building an Export-Ready Healthcare Product',
        excerpt: 'Essential regulatory guidelines, CTD dossier preparation, stability testing, and documentation required for seamless international market entry.',
        content: '<p>Navigating cross-border pharmaceutical and nutraceutical regulations demands comprehensive batch records, ICH stability protocols, and robust quality documentation.</p>',
        author: 'International Business Lead',
        readTime: '8 min read',
      },
    ];
    const blogsWithSlugs = blogs.map(b => ({
      ...b,
      slug: b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
    await Blog.insertMany(blogsWithSlugs);

    console.log('💊 Seeding 12 Sample Products...');
    const products = [
      {
        name: 'CoQ10 100mg + Omega-3 Liquid-Filled Hard Capsule',
        dosageForm: 'Liquid-Filled Hard Capsules',
        healthCategory: 'Healthy Ageing',
        description: 'Advanced dual antioxidant lipid matrix in hermetically sealed vegetarian HPMC capsule for maximum cellular absorption.',
        composition: [
          { ingredient: 'Coenzyme Q10 (Ubiquinone)', strength: '100 mg', purpose: 'Mitochondrial Energy & Cellular Protection' },
          { ingredient: 'Omega-3 EPA/DHA Fish Oil Complex', strength: '500 mg', purpose: 'Cardiovascular Support & Lipid Matrix' },
          { ingredient: 'Sunflower Lecithin (Phospholipids)', strength: '20 mg', purpose: 'Emulsifying Agent' },
        ],
        benefits: [
          'Superior bioavailability compared to dry powdered CoQ10',
          'Tamper-evident band sealing eliminates leakages & off-odors',
          'Clean label: Free from artificial plasticizers and preservatives',
        ],
        packaging: 'Alu-Alu Blister (10x10), 60 Capsules Amber Bottle',
        moq: '50,000 Capsules',
        featured: true,
      },
      {
        name: 'Probiotic + Prebiotic Dual Phase Capsule-in-Capsule',
        dosageForm: 'Capsule-in-Capsule',
        healthCategory: 'Gut Health',
        description: 'Dual-phase formulation delivering live spore-forming probiotics in an inner enteric capsule surrounded by liquid botanical prebiotics.',
        composition: [
          { ingredient: 'Bacillus Coagulans & Subtilis (10 Billion CFU)', strength: '10 Billion CFU', purpose: 'Targeted Intestinal Flora' },
          { ingredient: 'Organic Fructooligosaccharides (FOS) Liquid', strength: '350 mg', purpose: 'Prebiotic Nutrient Matrix' },
        ],
        benefits: [
          'Protects live microorganisms from destructive stomach acid',
          'Dual visual contrast showcasing premium multi-phase technology',
          'Ambient room temperature stability without refrigeration',
        ],
        packaging: 'Dessicant-lined HDPE Bottle (30 capsules)',
        moq: '50,000 Capsules',
        featured: true,
      },
      {
        name: 'Curcumin 95% + Piperine Liquid-Filled Capsule',
        dosageForm: 'Liquid-Filled Hard Capsules',
        healthCategory: 'Bone & Joint',
        description: 'Standardized 95% Curcuminoids solubilized in medium-chain triglycerides (MCT) with black pepper bio-enhancer.',
        composition: [
          { ingredient: 'Curcuma Longa Extract (95% Curcuminoids)', strength: '250 mg', purpose: 'Anti-inflammatory Active' },
          { ingredient: 'BioPerine (Piperine 95%)', strength: '5 mg', purpose: 'Bioavailability Enhancer (20x increase)' },
          { ingredient: 'Pure Fractionated Coconut Oil (MCT)', strength: '200 mg', purpose: 'Lipid Solubilizer' },
        ],
        benefits: [
          'Up to 2,000% higher bioavailability than standard curcumin powder',
          'Protects sensitive active from light and air degradation',
        ],
        packaging: 'Alu-Alu Blister Pack',
        moq: '50,000 Capsules',
        featured: true,
      },
      {
        name: 'Dual Action Melatonin + Ashwagandha Pellets-in-Capsule',
        dosageForm: 'Pellets-in-Capsule',
        healthCategory: 'Sleep & Stress',
        description: 'Instant-release melatonin micro-pellets combined with sustained-release KSM-66 Ashwagandha pellets for all-night sleep architecture.',
        composition: [
          { ingredient: 'Melatonin (Immediate Release Pellets)', strength: '3 mg', purpose: 'Rapid Sleep Onset' },
          { ingredient: 'KSM-66 Ashwagandha (Sustained Release Pellets)', strength: '300 mg', purpose: 'Cortisol Modulation & Deep Rest' },
        ],
        benefits: [
          'Immediate calming action followed by sustained 6-hour adaptogenic release',
          'Elegant multi-color pellet aesthetic inside clear HPMC capsule',
        ],
        packaging: 'Amber Glass Bottle with Induction Seal (60 caps)',
        moq: '50,000 Capsules',
        featured: true,
      },
      {
        name: 'Liposomal Vitamin C 1000mg + Zinc Effervescent Tablets',
        dosageForm: 'Effervescent',
        healthCategory: 'Immunity',
        description: 'Fast-dissolving effervescent immunity formulation with high cellular bioavailability and refreshing natural orange flavor.',
        composition: [
          { ingredient: 'Liposomal Vitamin C (Ascorbic Acid)', strength: '1000 mg', purpose: 'Cellular Immune Defense' },
          { ingredient: 'Zinc Bisglycinate Chelate', strength: '15 mg', purpose: 'High Absorption Mineral' },
        ],
        benefits: [
          'Instant 100% dissolution with zero chalky residue',
          'Gentle on the stomach lining compared to acidic pills',
        ],
        packaging: 'Moisture-tight Polypropylene Tube (20 tablets)',
        moq: '10,000 Tubes',
        featured: true,
      },
      {
        name: 'Hydrolyzed Marine Collagen 5000mg Beauty Oral Shot',
        dosageForm: 'Oral Shots',
        healthCategory: 'Beauty Nutrition',
        description: 'Ready-to-drink 25ml beauty vial containing low molecular weight Type I & III collagen peptides, biotin, and hyaluronic acid.',
        composition: [
          { ingredient: 'Hydrolyzed Marine Collagen Peptides (2000 Da)', strength: '5000 mg', purpose: 'Dermal Density & Elasticity' },
          { ingredient: 'Sodium Hyaluronate', strength: '50 mg', purpose: 'Deep Skin Hydration' },
          { ingredient: 'Biotin (Vitamin B7)', strength: '2500 mcg', purpose: 'Keratin Synthesis' },
        ],
        benefits: [
          'Delicious mixed berry flavor with zero fishy aftertaste',
          'Clinical peptide size for rapid gastrointestinal absorption',
        ],
        packaging: 'Sterile 25ml Amber PET Vials (Pack of 10 or 30)',
        moq: '25,000 Vials',
        featured: true,
      },
      {
        name: 'Saw Palmetto + Pumpkin Seed Oil Liquid-Filled Capsule',
        dosageForm: 'Liquid-Filled Hard Capsules',
        healthCategory: "Men's Health",
        description: 'Standardized fatty acids lipid blend dedicated to prostate health, bladder comfort, and healthy testosterone metabolism.',
        composition: [
          { ingredient: 'Saw Palmetto Berry CO2 Extract (85-95% Fatty Acids)', strength: '320 mg', purpose: '5-Alpha Reductase Inhibition' },
          { ingredient: 'Cold Pressed Virgin Pumpkin Seed Oil', strength: '160 mg', purpose: 'Zinc & Phytosterol Source' },
        ],
        benefits: ['Gold standard once-daily clinical dosage format', 'Hermetically banded to seal volatile aroma'],
        packaging: 'Blister Pack (3x10)',
        moq: '50,000 Capsules',
      },
      {
        name: 'Evening Primrose 1000mg + Vitamin E Liquid Capsule',
        dosageForm: 'Liquid-Filled Hard Capsules',
        healthCategory: "Women's Health",
        description: 'Cold-pressed Evening Primrose Oil providing standardized 10% Gamma-Linolenic Acid (GLA) for hormonal harmony.',
        composition: [
          { ingredient: 'Evening Primrose Oil (10% GLA)', strength: '1000 mg', purpose: 'Hormonal & Skin Barrier Balance' },
          { ingredient: 'Natural Vitamin E (d-alpha tocopherol)', strength: '15 IU', purpose: 'Antioxidant Stabilizer' },
        ],
        benefits: ['100% Plant HPMC shell option available', 'Zero degradation from excessive manufacturing heat'],
        packaging: 'HDPE Bottle (60 caps)',
        moq: '50,000 Capsules',
      },
      {
        name: 'Electrolyte Hydration + B-Complex Drink Mix Sachet',
        dosageForm: 'Sachets & Powders',
        healthCategory: 'Sports Nutrition',
        description: 'Scientific hypotonic osmolality electrolyte powder for rapid cellular hydration and athletic endurance.',
        composition: [
          { ingredient: 'Sodium & Potassium Citrate Complex', strength: '800 mg', purpose: 'Electrolyte Replenishment' },
          { ingredient: 'Aquamin Magnesium (Marine-derived)', strength: '100 mg', purpose: 'Muscle Function & Cramp Defense' },
        ],
        benefits: ['Rapid dissolution in cold water', 'Naturally sweetened with zero artificial dyes'],
        packaging: 'Foil Sachet (Box of 30 sachets)',
        moq: '25,000 Sachets',
      },
      {
        name: 'Nootropic Brain Focus + Phosphatidylserine Capsule',
        dosageForm: 'Capsule-in-Capsule',
        healthCategory: 'Brain Health',
        description: 'Cognitive formula featuring inner Lion’s Mane extract capsule suspended in pure liquid Phosphatidylserine.',
        composition: [
          { ingredient: 'Lion’s Mane Dual Extract (30% Polysaccharides)', strength: '300 mg', purpose: 'NGF Neuro-regeneration' },
          { ingredient: 'Phosphatidylserine (Soy-free liquid matrix)', strength: '100 mg', purpose: 'Neuronal Membrane Support' },
        ],
        benefits: ['Synergistic dual-phase brain formula', 'High market differentiation in nootropic categories'],
        packaging: 'Glass Bottle (60 caps)',
        moq: '50,000 Capsules',
      },
      {
        name: 'Apple Cider Vinegar + Mother Pectin Gummies',
        dosageForm: 'Gummies',
        healthCategory: 'Daily Wellness',
        description: 'Delicious unfiltered Apple Cider Vinegar gummies with ginger root extract and vitamin B12 for metabolic vitality.',
        composition: [
          { ingredient: 'Raw Apple Cider Vinegar (with the Mother)', strength: '500 mg', purpose: 'Metabolic Support' },
          { ingredient: 'Vitamin B12 (Methylcobalamin)', strength: '2.4 mcg', purpose: 'Energy Metabolism' },
        ],
        benefits: ['100% Pectin-based (Gelatin-free, vegan)', 'Pleasant natural apple taste without throat irritation'],
        packaging: 'PET Jar (60 gummies)',
        moq: '15,000 Jars',
      },
      {
        name: 'Glucosamine + Chondroitin + MSM Coated Bilayer Tablets',
        dosageForm: 'Tablets',
        healthCategory: 'Bone & Joint',
        description: 'High-potency triple action joint cartilage regeneration tablets with enteric protection.',
        composition: [
          { ingredient: 'Glucosamine Sulfate 2KCl', strength: '750 mg', purpose: 'Cartilage Building Block' },
          { ingredient: 'Chondroitin Sulfate Sodium', strength: '400 mg', purpose: 'Synovial Fluid Cushioning' },
          { ingredient: 'OptiMSM (Methylsulfonylmethane)', strength: '250 mg', purpose: 'Connective Tissue Support' },
        ],
        benefits: ['Bilayer compression for maximum stability', 'Smooth film coating for effortless swallowability'],
        packaging: 'HDPE Bottle (90 tablets)',
        moq: '50,000 Tablets',
      },
    ];
    const productsWithSlugs = products.map(p => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
        question: 'What are your standard Minimum Order Quantities (MOQ)?',
        answer: 'Our standard MOQ for liquid-filled hard capsules is 50,000 units per formulation. For tablets and effervescents, MOQs start from 50,000 units. For oral shots, MOQs begin at 25,000 vials.',
        category: 'manufacturing',
        order: 3,
      },
      {
        question: 'Can ONPHARNO customize our proprietary formulation?',
        answer: 'Yes! Our dedicated R&D lab can perform complete formulation development, reverse engineering, active compatibility studies, and stability scale-up for your brand.',
        category: 'general',
        order: 4,
      },
      {
        question: 'Do you provide full export regulatory documentation?',
        answer: 'Yes, we supply complete batch manufacturing records (BMR), certificates of analysis (COA), accelerated stability testing dossiers, and CTD dossiers for MOH approvals worldwide.',
        category: 'partnership',
        order: 5,
      },
    ];
    await FAQ.insertMany(faqs);

    console.log('🏆 Seeding Certifications...');
    const certs = [
      { title: 'WHO-GMP Compliant', code: 'cGMP', authority: 'World Health Organization Good Manufacturing Practices', description: 'Certified cleanrooms, automated environmental monitoring, and validated batch controls.' },
      { title: 'ISO 22000:2018', code: 'ISO-22000', authority: 'International Food Safety Management System', description: 'Comprehensive hazard analysis and food safety controls throughout processing.' },
      { title: 'ISO 9001:2015', code: 'ISO-9001', authority: 'Quality Management Systems', description: 'Certified quality assurance systems, document control, and continuous audit protocols.' },
      { title: 'FSSAI Manufacturing License', code: 'FSSAI', authority: 'Food Safety and Standards Authority', description: 'Full statutory compliance for nutraceutical and functional food processing.' },
    ];
    await Certification.insertMany(certs);

    console.log('⚙️ Seeding Default Site Settings...');
    await Setting.create({
      companyName: 'ONPHARNO',
      tagline: 'Advanced Dosage-Form Technology & Healthcare Manufacturing',
      logo: '/logo.png',
      logoWhite: '/logo.png',
      favicon: '/favicon.png',
      phone: '+91 98765 43210',
      email: 'info@onpharno.com',
      address: 'Pharmaceutical Technology Park, Innovation Drive, Gujarat, India',
      workingHours: 'Monday - Friday: 9:00 AM - 6:00 PM (IST)',
      whatsappNumber: '+919876543210',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/onpharno',
        instagram: 'https://instagram.com/onpharno',
        email: 'mailto:info@onpharno.com',
      },
    });

    console.log('✨ Database Seeding Completed Successfully! ✨');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
