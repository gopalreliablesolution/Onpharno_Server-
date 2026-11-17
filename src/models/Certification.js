import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    authority: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: '/uploads/logo.png',
    },
    documentPdf: {
      type: String,
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

const Certification = mongoose.model('Certification', certificationSchema);
export default Certification;
