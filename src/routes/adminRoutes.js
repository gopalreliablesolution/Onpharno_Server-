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
  changeMyPassword,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard-stats', authorize('superadmin', 'admin', 'editor'), getDashboardStats);
router.post('/upload', authorize('superadmin', 'admin', 'editor'), upload.single('file'), uploadFile);
router.put('/settings', authorize('superadmin'), updateSettings);
router.post('/users/change-password', authorize('superadmin', 'admin', 'editor'), changeMyPassword);

const registerCrudRoutes = (prefix, handler, roles) => {
  router.get(`/${prefix}`, authorize(...roles), handler.getAll);
  router.post(`/${prefix}`, authorize(...roles), handler.create);
  router.put(`/${prefix}/:id`, authorize(...roles), handler.update);
  router.delete(`/${prefix}/:id`, authorize(...roles), handler.delete);
};

const contentRoles = ['superadmin', 'admin', 'editor'];
registerCrudRoutes('banners', bannersCrud, contentRoles);
registerCrudRoutes('sections', sectionsCrud, contentRoles);
registerCrudRoutes('products', productsCrud, contentRoles);
registerCrudRoutes('categories', categoriesCrud, contentRoles);
registerCrudRoutes('blogs', blogsCrud, contentRoles);
registerCrudRoutes('faqs', faqsCrud, contentRoles);
registerCrudRoutes('team', teamCrud, contentRoles);
registerCrudRoutes('facilities', facilitiesCrud, contentRoles);
registerCrudRoutes('certifications', certsCrud, contentRoles);
registerCrudRoutes('videos', videosCrud, contentRoles);
registerCrudRoutes('stats', statsCrud, contentRoles);

registerCrudRoutes('enquiries', enquiriesCrud, ['superadmin', 'admin']);
registerCrudRoutes('media', mediaCrud, ['superadmin', 'admin']);
registerCrudRoutes('users', usersCrud, ['superadmin']);

export default router;
