import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'video',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoFile: {
      type: String,
      default: '',
    },
    thumbnail: {
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

const Video = mongoose.model('Video', videoSchema);
export default Video;
