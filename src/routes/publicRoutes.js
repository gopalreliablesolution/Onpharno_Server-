import express from 'express';
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
  createEnquiry,
  createPartnerEnquiry,
  createProductEnquiry,
} from '../controllers/publicController.js';

const router = express.Router();

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

// Inquiries
router.post('/enquiries', createEnquiry);
router.post('/partner-enquiries', createPartnerEnquiry);
router.post('/product-enquiries', createProductEnquiry);

export default router;
