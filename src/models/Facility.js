import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Manufacturing',
        'R&D',
        'Quality Control',
        'Production Equipment',
        'Packaging',
        'Storage',
      ],
      default: 'Manufacturing',
    },
    image: {
      type: String,
      default: '/uploads/logo.png',
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

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;
