import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    cta1Text: {
      type: String,
      default: 'Explore Technology',
    },
    cta1Link: {
      type: String,
      default: '/products/liquid-filled-hard-capsules',
    },
    cta2Text: {
      type: String,
      default: 'Start a Project',
    },
    cta2Link: {
      type: String,
      default: '/contact',
    },
    imageDesktop: {
      type: String,
      default: '/images/hero-banner-1.jpg',
    },
    imageMobile: {
      type: String,
      default: '/images/mobile-banner-1.jpg',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
