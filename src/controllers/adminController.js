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

// Dashboard Aggregates
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
      data: {
        stats: {
          enquiriesTotal,
          enquiriesToday,
          productsCount,
          blogsCount,
          categoriesCount,
        },
        recentEnquiries,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Local File Upload Handler
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const mediaRecord = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: fileUrl,
    });

    res.status(201).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        id: mediaRecord._id,
      },
      message: 'File uploaded successfully to server',
    });
  } catch (err) {
    next(err);
  }
};

// Update Global Settings
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, data: settings, message: 'Settings saved' });
  } catch (err) {
    next(err);
  }
};

// Generic CRUD helper generator
const createCrudHandlers = (Model, name) => ({
  getAll: async (req, res, next) => {
    try {
      const items = await Model.find().sort(Model.schema.paths.order ? 'order' : '-createdAt');
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },
  create: async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, data: item, message: `${name} created` });
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      res.status(200).json({ success: true, data: item, message: `${name} updated` });
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      res.status(200).json({ success: true, message: `${name} deleted` });
    } catch (err) {
      next(err);
    }
  },
});

export const bannersCrud = createCrudHandlers(Banner, 'Banner');
export const sectionsCrud = createCrudHandlers(Section, 'Section');
export const productsCrud = createCrudHandlers(Product, 'Product');
export const categoriesCrud = createCrudHandlers(Category, 'Category');
export const blogsCrud = createCrudHandlers(Blog, 'Blog');
export const faqsCrud = createCrudHandlers(FAQ, 'FAQ');
export const teamCrud = createCrudHandlers(TeamMember, 'Team Member');
export const facilitiesCrud = createCrudHandlers(Facility, 'Facility');
export const certsCrud = createCrudHandlers(Certification, 'Certification');
export const videosCrud = createCrudHandlers(Video, 'Video');
export const statsCrud = createCrudHandlers(Stat, 'Stat');
export const enquiriesCrud = createCrudHandlers(Enquiry, 'Enquiry');
export const usersCrud = createCrudHandlers(User, 'User');
export const mediaCrud = createCrudHandlers(Media, 'Media');
