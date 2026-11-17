import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
      ogImage: String,
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

const Page = mongoose.model('Page', pageSchema);
export default Page;
