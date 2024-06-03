import mongoose from "mongoose";

const FitnessBandSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  Dimensions: String,
  DialShape: String,
  StrapMaterial: String,
  Sensors: String,
  NotificationType: String,
  MobileOSCompatibility: String,
  InTheBoxContents: String,
  DisplaySize: String,
  DisplayType: String,
  Resolution: String,
  PixelDensity: String,
  TouchEnabled: String,
  Notifications: String,
  WaterResistant: String,
  IPCertification: String,
  SleepQualityTracker: String,
  SpO2Sensor: String,
  Capacity: String,
  Type: String,
  ExpectedLife: String,
  Bluetooth: String,
  Warranty: String,
  variants: [
    {
      store: String,
      price: String,
      store_link: String,
    },
  ],
  images: [String],
  ExpertScore: String,
},{ collection: 'fitness_band' });

export const FitnessBand = mongoose.model("fitness_band", FitnessBandSchema);
