import Banner from '../models/Banner.js';
import Setting from '../models/Setting.js';
import Page from '../models/Page.js';
import Section from '../models/Section.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Blog from '../models/Blog.js';
import FAQ from '../models/FAQ.js';
import TeamMember from '../models/TeamMember.js';
import Facility from '../models/Facility.js';
import Certification from '../models/Certification.js';
import Video from '../models/Video.js';
import Stat from '../models/Stat.js';
import Enquiry from '../models/Enquiry.js';
import Menu from '../models/Menu.js';

// Get Active Banners
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

// Get Global Settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// Get Page Sections
export const getPageSections = async (req, res, next) => {
  try {
    const { key } = req.params;
    const sections = await Section.find({ pageKey: key, visible: true }).sort('order');
    res.status(200).json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
};

export const sanitizeSearchQuery = (input, maxLength = 100) => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, maxLength);
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Get Products Catalog with Filtering
export const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const { search, category, dosage } = req.query;
    const query = { status: 'published' };

    const sanitizedSearch = sanitizeSearchQuery(search, 100);
    if (sanitizedSearch) {
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { 'composition.ingredient': { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    if (category) {
      query.healthCategory = category;
    }

    if (dosage) {
      query.dosageForm = dosage;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        page,
        pages: Math.ceil(total / limit),
        products,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Single Product by Slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'published' });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product formulation not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// Get Categories & Formats
export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { active: true };
    if (type) query.type = type;
    const categories = await Category.find(query).sort('order');
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// Get Blogs
export const getBlogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const { search, category } = req.query;
    const query = { status: 'published' };

    const sanitizedSearch = sanitizeSearchQuery(search, 100);
    if (sanitizedSearch) {
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { excerpt: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    const [total, blogs] = await Promise.all([
      Blog.countDocuments(query),
      Blog.find(query)
        .sort('-publishedAt -createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Single Blog by Slug
export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

// Get FAQs
export const getFAQs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { active: true };
    if (category) query.category = category;
    const faqs = await FAQ.find(query).sort('order');
    res.status(200).json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
};

// Get Team
export const getTeam = async (req, res, next) => {
  try {
    const team = await TeamMember.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

// Get Facilities
export const getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: facilities });
  } catch (err) {
    next(err);
  }
};

// Get Certifications
export const getCertifications = async (req, res, next) => {
  try {
    const certs = await Certification.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: certs });
  } catch (err) {
    next(err);
  }
};

// Get Videos
export const getVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: videos });
  } catch (err) {
    next(err);
  }
};

// Get Stats
export const getStats = async (req, res, next) => {
  try {
    const stats = await Stat.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// Get Menus
export const getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({ active: true }).sort('order');
    res.status(200).json({ success: true, data: menus });
  } catch (err) {
    next(err);
  }
};

// Get Public Pages / SEO Metadata
export const getPages = async (req, res, next) => {
  try {
    const pages = await Page.find({ active: true });
    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    next(err);
  }
};

export const getPageByKey = async (req, res, next) => {
  try {
    const page = await Page.findOne({ key: req.params.key, active: true });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page metadata not found' });
    }
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};

import { sendEnquiryEmails } from '../services/emailService.js';

// Create Inquiries
const pickEnquiry = (body, defaultType) => {
  const allowedTypes = ['contact', 'partner', 'product', 'project'];
  const type = allowedTypes.includes(body?.type) ? body.type : defaultType;
  return {
    name: body.name,
    email: body.email,
    phone: body.phone,
    company: body.company,
    subject: body.subject,
    message: body.message,
    quantity: body.quantity,
    productInterest: body.productInterest || body.dosageInterest,
    businessType: body.businessType,
    location: body.location,
    productName: body.productName,
    productSlug: body.productSlug,
    type,
  };
};

export const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(pickEnquiry(req.body, 'contact'));
    // Fire email notifications asynchronously without blocking HTTP response
    sendEnquiryEmails(enquiry).catch((err) => {
      console.error('Email dispatch error on enquiry:', err?.message || err);
    });
    res.status(201).json({ success: true, data: { id: enquiry._id }, message: 'Enquiry submitted successfully' });
  } catch (err) {
    next(err);
  }
};

export const createPartnerEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(pickEnquiry(req.body, 'partner'));
    sendEnquiryEmails(enquiry).catch((err) => {
      console.error('Email dispatch error on partner enquiry:', err?.message || err);
    });
    res.status(201).json({ success: true, data: { id: enquiry._id }, message: 'Partner enquiry submitted successfully' });
  } catch (err) {
    next(err);
  }
};

export const createProductEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(pickEnquiry(req.body, 'product'));
    sendEnquiryEmails(enquiry).catch((err) => {
      console.error('Email dispatch error on product enquiry:', err?.message || err);
    });
    res.status(201).json({ success: true, data: { id: enquiry._id }, message: 'Product enquiry submitted successfully' });
  } catch (err) {
    next(err);
  }
};

export const createProjectEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(pickEnquiry(req.body, 'project'));
    sendEnquiryEmails(enquiry).catch((err) => {
      console.error('Email dispatch error on project enquiry:', err?.message || err);
    });
    res.status(201).json({ success: true, data: { id: enquiry._id }, message: 'Project enquiry submitted successfully' });
  } catch (err) {
    next(err);
  }
};
