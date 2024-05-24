import mongoose from "mongoose";

const EarphoneSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  Brand: String,
  Model: String,
  Title: String,
  Warranty: String,
  BoxContents: String,
  Type: String,
  Design: String,
  "Open or closed back": String,
  Fit: String,
  Impedance: String,
  Sensitivity: String,
  "Max frequency response": String,
  "Min frequency response": String,
  "Driver type": String,
  "Eartip size": String,
  Weight: String,
  "Foldable Design": String,
  "Colour(s)": String,
  "Driver Size": String,
  Dimensions: String,
  "Noise cancellation": String,
  "Replaceable earbuds": String,
  "Call control": String,
  "Music control": String,
  Connector: String,
  "Bluetooth version": String,
  Range: String,
  "Bluetooth features": String,
  Microphone: String,
  "Playback time": String,
  "Battery capacity": String,
  "Standby time": String,
  "Charging type": String,
  "Charging time": String,
  "Compatible Models": String,
  variants: [
    {
      store: String,
      price: String,
      store_link: String,
    },
  ],
  images: [String],
  "Expert Score": String,
});

export const Earphones = mongoose.model("earphones", EarphoneSchema);
