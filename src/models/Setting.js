import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'ONPHARNO',
    },
    tagline: {
      type: String,
      default: 'Advanced Dosage-Form Technology & Healthcare Manufacturing',
    },
    logo: {
      type: String,
      default: '/logo.png',
    },
    logoWhite: {
      type: String,
      default: '/logo.png',
    },
    favicon: {
      type: String,
      default: '/favicon.png',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'info@onpharno.com',
    },
    address: {
      type: String,
      default: 'Pharmaceutical Technology Park, Innovation Drive, Gujarat, India',
    },
    workingHours: {
      type: String,
      default: 'Monday - Friday: 9:00 AM - 6:00 PM IST',
    },
    whatsappNumber: {
      type: String,
      default: '+919876543210',
    },
    mapEmbed: {
      type: String,
    },
    socialLinks: {
      linkedin: { type: String, default: 'https://linkedin.com' },
      instagram: { type: String, default: 'https://instagram.com' },
      email: { type: String, default: 'mailto:info@onpharno.com' },
    },
    analyticsId: {
      type: String,
    },
    themeAccent: {
      type: String,
      default: '#D85430',
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
