import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
});

const menuSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      enum: ['header', 'footer'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    items: [menuItemSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
