import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['contact', 'partner', 'product', 'project'],
      default: 'contact',
    },
    subject: {
      type: String,
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
    },
    productInterest: {
      type: String,
    },
    businessType: {
      type: String,
    },
    location: {
      type: String,
    },
    productName: {
      type: String,
    },
    productSlug: {
      type: String,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed'],
      default: 'new',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
