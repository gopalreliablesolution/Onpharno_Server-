import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: [
        'Management',
        'R&D',
        'Formulation',
        'Quality',
        'Manufacturing',
        'Operations',
        'Business Development',
        'International Business',
      ],
      default: 'Management',
    },
    photo: {
      type: String,
      default: '/uploads/logo.png',
    },
    bio: {
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

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;
