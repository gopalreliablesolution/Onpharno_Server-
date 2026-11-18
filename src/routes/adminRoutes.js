import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
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
  menusCrud,
  pagesCrud,
  getActivityLogs,
  changeMyPassword,
} from '../controllers/adminController.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path || e.param, message: e.msg })),
    });
  }
  next();
};

// Global ObjectId validation for any route with an :id parameter
router.param('id', (_req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid id format' });
  }
  next();
});

router.use(protect);

router.get('/dashboard-stats', authorize('superadmin', 'admin', 'editor'), getDashboardStats);
router.post('/upload', authorize('superadmin', 'admin', 'editor'), upload.single('file'), uploadFile);
router.put('/settings', authorize('superadmin'), updateSettings);
router.post(
  '/users/change-password',
  authorize('superadmin', 'admin', 'editor'),
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  changeMyPassword
);

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

router.post(
  '/users',
  authorize('superadmin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['superadmin', 'admin', 'editor']).withMessage('Invalid role'),
  ],
  validate,
  usersCrud.create
);
router.get('/users', authorize('superadmin'), usersCrud.getAll);
router.put('/users/:id', authorize('superadmin'), usersCrud.update);
router.delete('/users/:id', authorize('superadmin'), usersCrud.delete);

registerCrudRoutes('menus', menusCrud, ['superadmin', 'admin']);
registerCrudRoutes('pages', pagesCrud, ['superadmin', 'admin']);
router.get('/activity-logs', authorize('superadmin'), getActivityLogs);

export default router;
