import mongoose from "mongoose";

const SmartwatchSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  Size: String,
  Resolution: String,
  Shape: String,
  PixelDensity: String,
  Touchscreen: String,
  Warranty: String,
  Durability: String,
  WaterResistant: String,
  Alarm: String,
  Notifications: String,
  Sensors: [String],
  ActivityTrackers: String,
  Capacity: String,
  ExpectedLife: String,
  ChargingType: String,
  WirelessConnectivity: String,
  variants: [
    {
      store: String,
      price: String,
      store_link: String,
    },
  ],
  images: [String],
  ExpertScore: String,
});

export const Smartwatches = mongoose.model("smartwatches", SmartwatchSchema);
