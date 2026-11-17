import mongoose from 'mongoose';
import slugify from 'slugify';

const compositionSchema = new mongoose.Schema({
  ingredient: { type: String, required: true },
  strength: { type: String, required: true },
  purpose: { type: String },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    dosageForm: {
      type: String,
      required: true,
    },
    healthCategory: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    images: {
      type: [String],
      default: ['/uploads/logo.png'],
    },
    description: {
      type: String,
      required: true,
    },
    composition: [compositionSchema],
    benefits: [String],
    packaging: {
      type: String,
      default: 'Alu-Alu Blister, HDPE Bottles with Induction Seal',
    },
    moq: {
      type: String,
      default: '50,000 Capsules',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    seo: {
      title: String,
      description: String,
      keywords: String,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
