import mongoose from "mongoose";
const schema = mongoose.Schema({
  company_name: { type: String, required: true },
  market: { type: String },
  logo: { type: String },
  color: { type: String },
  phone_number: { type: String },
  email: { type: String },
  social_media: { type: String },
  social_media: {
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    discord: {
      type: String,
    },
    linkedin: {
      type: String,
    },
  },
  text: { type: Array },
  industry: { type: String },
  products: { type: Array },
  services: { type: Array }
});
export const RecordModel = mongoose.model("Record", schema);
