import { Schema, model } from 'mongoose';
import slug from 'mongoose-slug-updater';
import mongoose from 'mongoose';

mongoose.plugin(slug);

const blogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, slug: ["title"], unique: true, slugPaddingSize: 4 },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  author: { type: String, default: "Dealsbajar" },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String }
});

export default model('Blog', blogSchema);
