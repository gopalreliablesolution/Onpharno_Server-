import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    trustPoints: {
      type: String,
      trim: true,
      default: '',
    },
    cta1Text: {
      type: String,
      trim: true,
      default: '',
    },
    cta1Link: {
      type: String,
      trim: true,
      default: '',
    },
    cta2Text: {
      type: String,
      trim: true,
      default: '',
    },
    cta2Link: {
      type: String,
      trim: true,
      default: '',
    },
    imageDesktop: {
      type: String,
      trim: true,
      default: '',
    },
    imageMobile: {
      type: String,
      trim: true,
      default: '',
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
