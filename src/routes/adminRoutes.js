import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getDashboardStats,
  uploadFile,
  updateSettings,
  bannersCrud,
  sectionsCrud,
  productsCrud,
  categoriesCrud,
  blogsCrud,
  faqsCrud,
  teamCrud,
  facilitiesCrud,
  certsCrud,
  videosCrud,
  statsCrud,
  enquiriesCrud,
  usersCrud,
  mediaCrud,
} from '../controllers/adminController.js';

const router = express.Router();

// Apply protect middleware to all admin routes
router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.post('/upload', upload.single('file'), uploadFile);
router.put('/settings', updateSettings);

// Helper to register standard CRUD endpoints
const registerCrudRoutes = (prefix, handler) => {
  router.get(`/${prefix}`, handler.getAll);
  router.post(`/${prefix}`, handler.create);
  router.put(`/${prefix}/:id`, handler.update);
  router.delete(`/${prefix}/:id`, handler.delete);
};

registerCrudRoutes('banners', bannersCrud);
registerCrudRoutes('sections', sectionsCrud);
registerCrudRoutes('products', productsCrud);
registerCrudRoutes('categories', categoriesCrud);
registerCrudRoutes('blogs', blogsCrud);
registerCrudRoutes('faqs', faqsCrud);
registerCrudRoutes('team', teamCrud);
registerCrudRoutes('facilities', facilitiesCrud);
registerCrudRoutes('certifications', certsCrud);
registerCrudRoutes('videos', videosCrud);
registerCrudRoutes('stats', statsCrud);
registerCrudRoutes('enquiries', enquiriesCrud);
registerCrudRoutes('users', usersCrud);
registerCrudRoutes('media', mediaCrud);

export default router;
