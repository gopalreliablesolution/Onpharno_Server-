import mongoose from 'mongoose';
import User from '../models/User.js';
import Banner from '../models/Banner.js';
import Setting from '../models/Setting.js';
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
import Media from '../models/Media.js';
import Menu from '../models/Menu.js';
import Page from '../models/Page.js';
import ActivityLog from '../models/ActivityLog.js';
import fs from 'fs/promises';
import { processUploadedFile } from '../services/uploadService.js';

const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
};

const sanitizeUser = (user) => {
  if (!user) return user;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [enquiriesTotal, enquiriesToday, productsCount, blogsCount, categoriesCount, recentEnquiries] =
      await Promise.all([
        Enquiry.countDocuments(),
        Enquiry.countDocuments({ createdAt: { $gte: today } }),
        Product.countDocuments(),
        Blog.countDocuments(),
        Category.countDocuments(),
        Enquiry.find().sort('-createdAt').limit(5),
      ]);
    res.status(200).json({
      success: true,
      data: { stats: { enquiriesTotal, enquiriesToday, productsCount, blogsCount, categoriesCount }, recentEnquiries },
    });
  } catch (err) { next(err); }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    const processed = await processUploadedFile(req.file);
    const mediaRecord = await Media.create({
      filename: processed.filename,
      originalName: processed.originalName,
      mimeType: processed.mimeType,
      size: processed.size,
      path: processed.path,
      url: processed.url,
      thumbnailPath: processed.thumbnailPath || '',
      thumbnailUrl: processed.thumbnailUrl || '',
    });
    res.status(201).json({
      success: true,
      data: {
        id: mediaRecord._id,
        url: processed.url,
        thumbnailUrl: processed.thumbnailUrl,
        filename: processed.filename,
        originalName: processed.originalName,
        size: processed.size,
        mimeType: processed.mimeType,
      },
      message: 'File uploaded and secured successfully',
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || 'File processing failed' });
  }
};

const SETTINGS_FIELDS = ['companyName','tagline','logo','logoWhite','favicon','phone','email','address','workingHours','whatsappNumber','mapEmbed','socialLinks','analyticsId','themeAccent'];
export const updateSettings = async (req, res, next) => {
  try {
    const payload = pick(req.body || {}, SETTINGS_FIELDS);
    let settings = await Setting.findOne();
    if (!settings) settings = await Setting.create(payload);
    else {
      Object.assign(settings, payload);
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings, message: 'Settings saved' });
  } catch (err) { next(err); }
};

export const logAdminActivity = async (req, action, resource, details = {}) => {
  try {
    if (!req.user) return;
    await ActivityLog.create({
      userId: req.user.id || req.user._id,
      userEmail: req.user.email,
      action,
      resource,
      details,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
    });
  } catch {
    // Audit logging never interrupts request flow
  }
};

const createCrudHandlers = (Model, name, fields = null) => ({
  getAll: async (req, res, next) => {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
      const sort = Model.schema.paths.order ? { order: 1, createdAt: -1 } : { createdAt: -1 };
      const [items, total] = await Promise.all([
        Model.find().sort(sort).skip((page - 1) * limit).limit(limit),
        Model.countDocuments(),
      ]);
      res.status(200).json({ success: true, data: items, pagination: { total, page, pages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const payload = fields ? pick(req.body || {}, fields) : req.body;
      const item = await Model.create(payload);
      logAdminActivity(req, 'CREATE', name, { id: item._id });
      res.status(201).json({ success: true, data: item, message: `${name} created` });
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
      const payload = fields ? pick(req.body || {}, fields) : req.body;
      const item = await Model.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      logAdminActivity(req, 'UPDATE', name, { id: req.params.id });
      res.status(200).json({ success: true, data: item, message: `${name} updated` });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      logAdminActivity(req, 'DELETE', name, { id: req.params.id });
      res.status(200).json({ success: true, message: `${name} deleted` });
    } catch (err) { next(err); }
  },
});

const BANNER_FIELDS = ['eyebrow','title','subtitle','badge','trustPoints','cta1Text','cta1Link','cta2Text','cta2Link','imageDesktop','imageMobile','order','active'];
const SECTION_FIELDS = ['pageKey','key','name','type','title','subtitle','content','image','order','visible'];
const PRODUCT_FIELDS = ['name','slug','dosageForm','healthCategory','categories','images','description','composition','benefits','packaging','moq','featured','status','seo'];
const CATEGORY_FIELDS = ['name','slug','type','description','image','order','active'];
const BLOG_FIELDS = ['title','slug','excerpt','content','coverImage','category','tags','author','readTime','status','publishedAt','seo'];
const FAQ_FIELDS = ['question','answer','category','order','active'];
const TEAM_FIELDS = ['name','role','department','photo','bio','order','active'];
const FACILITY_FIELDS = ['title','subtitle','description','category','image','order','active'];
const CERT_FIELDS = ['title','code','authority','description','image','documentPdf','order','active'];
const VIDEO_FIELDS = ['title','description','videoUrl','thumbnail','order','active'];
const STAT_FIELDS = ['label','value','suffix','order','active'];
const ENQUIRY_FIELDS = ['status','notes'];
const MENU_FIELDS = ['location','title','url','order','items','active'];
const PAGE_FIELDS = ['key','title','slug','seo','active'];

export const bannersCrud = createCrudHandlers(Banner, 'Banner', BANNER_FIELDS);
export const sectionsCrud = createCrudHandlers(Section, 'Section', SECTION_FIELDS);
export const productsCrud = createCrudHandlers(Product, 'Product', PRODUCT_FIELDS);
export const categoriesCrud = createCrudHandlers(Category, 'Category', CATEGORY_FIELDS);
export const blogsCrud = createCrudHandlers(Blog, 'Blog', BLOG_FIELDS);
export const faqsCrud = createCrudHandlers(FAQ, 'FAQ', FAQ_FIELDS);
export const teamCrud = createCrudHandlers(TeamMember, 'Team Member', TEAM_FIELDS);
export const facilitiesCrud = createCrudHandlers(Facility, 'Facility', FACILITY_FIELDS);
export const certsCrud = createCrudHandlers(Certification, 'Certification', CERT_FIELDS);
export const videosCrud = createCrudHandlers(Video, 'Video', VIDEO_FIELDS);
export const statsCrud = createCrudHandlers(Stat, 'Stat', STAT_FIELDS);
export const menusCrud = createCrudHandlers(Menu, 'Menu', MENU_FIELDS);
export const pagesCrud = createCrudHandlers(Page, 'Page', PAGE_FIELDS);

export const getActivityLogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const [items, total] = await Promise.all([
      ActivityLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ActivityLog.countDocuments(),
    ]);
    res.status(200).json({ success: true, data: items, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

export const enquiriesCrud = {
  ...createCrudHandlers(Enquiry, 'Enquiry', ENQUIRY_FIELDS),
  create: async (_req, res) => res.status(405).json({ success: false, message: 'Not allowed' }),
};

export const usersCrud = {
  getAll: async (req, res, next) => {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
      const [items, total] = await Promise.all([
        User.find().select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        User.countDocuments(),
      ]);
      res.status(200).json({ success: true, data: items, pagination: { total, page, pages: Math.ceil(total / limit) } });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const { name, email, password, role, active } = req.body || {};
      if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
      const safeRole = ['superadmin', 'admin', 'editor'].includes(role) ? role : 'editor';
      const user = await User.create({ name, email, password, role: safeRole, active: active !== false });
      res.status(201).json({ success: true, data: sanitizeUser(user), message: 'User created' });
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
      const target = await User.findById(id);
      if (!target) return res.status(404).json({ success: false, message: 'User not found' });
      const { name, email, role, active, password } = req.body || {};
      if (target.role === 'superadmin' && role && role !== 'superadmin') {
        const count = await User.countDocuments({ role: 'superadmin', active: { $ne: false } });
        if (count <= 1) return res.status(400).json({ success: false, message: 'Cannot demote the last superadmin' });
      }
      if (target.role === 'superadmin' && active === false) {
        const count = await User.countDocuments({ role: 'superadmin', active: { $ne: false }, _id: { $ne: target._id } });
        if (count < 1) return res.status(400).json({ success: false, message: 'Cannot deactivate the last superadmin' });
      }
      if (name !== undefined) target.name = name;
      if (email !== undefined) target.email = email;
      if (role !== undefined && ['superadmin', 'admin', 'editor'].includes(role)) target.role = role;
      if (active !== undefined) target.active = active;
      if (password) target.password = password; // hashed by pre-save
      await target.save();
      res.status(200).json({ success: true, data: sanitizeUser(target), message: 'User updated' });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
      const target = await User.findById(id);
      if (!target) return res.status(404).json({ success: false, message: 'User not found' });
      if (target.role === 'superadmin') {
        const count = await User.countDocuments({ role: 'superadmin', active: { $ne: false } });
        if (count <= 1) return res.status(400).json({ success: false, message: 'Cannot delete the last superadmin' });
      }
      await User.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) { next(err); }
  },
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Current and new password are required' });
    if (String(newPassword).length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const ok = await user.matchPassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

export const mediaCrud = {
  ...createCrudHandlers(Media, 'Media'),
  delete: async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid id' });
      const item = await Media.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Media not found' });
      try { if (item.path) await fs.unlink(item.path); } catch { /* ignore missing file */ }
      try { if (item.thumbnailPath) await fs.unlink(item.thumbnailPath); } catch { /* ignore missing thumb */ }
      await Media.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: 'Media deleted' });
    } catch (err) { next(err); }
  },
  create: async (_req, res) => res.status(405).json({ success: false, message: 'Use upload endpoint' }),
  update: async (_req, res) => res.status(405).json({ success: false, message: 'Not supported' }),
};
