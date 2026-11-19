import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import {
  getBanners,
  getSettings,
  getPageSections,
  getProducts,
  getProductBySlug,
  getCategories,
  getBlogs,
  getBlogBySlug,
  getFAQs,
  getTeam,
  getFacilities,
  getCertifications,
  getVideos,
  getStats,
  getMenus,
  getPages,
  getPageByKey,
  createEnquiry,
  createPartnerEnquiry,
  createProductEnquiry,
  createProjectEnquiry,
} from '../controllers/publicController.js';

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many enquiries submitted. Please try again later.' },
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const enquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('company').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('website').optional({ checkFalsy: true }).isLength({ max: 0 }).withMessage('Invalid submission'),
];

router.get('/banners', getBanners);
router.get('/settings', getSettings);
router.get('/pages/:key/sections', getPageSections);
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.get('/categories', getCategories);
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/faqs', getFAQs);
router.get('/team', getTeam);
router.get('/facilities', getFacilities);
router.get('/certifications', getCertifications);
router.get('/videos', getVideos);
router.get('/stats', getStats);
router.get('/menus', getMenus);
router.get('/pages', getPages);
router.get('/pages/:key', getPageByKey);

// Inquiries
router.post('/enquiries', enquiryLimiter, enquiryValidation, validate, createEnquiry);
router.post('/partner-enquiries', enquiryLimiter, enquiryValidation, validate, createPartnerEnquiry);
router.post('/product-enquiries', enquiryLimiter, enquiryValidation, validate, createProductEnquiry);
router.post('/project-enquiries', enquiryLimiter, enquiryValidation, validate, createProjectEnquiry);

export default router;
