import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '/uploads/logo.png',
    },
    category: {
      type: String,
      default: 'Formulation & Science',
    },
    tags: [String],
    author: {
      type: String,
      default: 'ONPHARNO Scientific Team',
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    seo: {
      title: String,
      description: String,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
