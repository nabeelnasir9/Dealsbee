import { Schema, model } from 'mongoose';

const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, required: true},
  author: { type: String, default: "Dealsbajar" },
  createdAt: { type: Date, default: Date.now },
});

export default model('Blog', blogSchema);
