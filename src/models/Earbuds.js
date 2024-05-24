import mongoose from "mongoose";

const EarbudSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  Brand: String,
  Model: String,
  Title: String,
  Warranty: String,
  BoxContents: String,
  Type: String,
  Design: String,
  OpenOrClosedBack: String,
  Fit: String,
  Impedance: String,
  Sensitivity: String,
  MaxFrequencyResponse: String,
  MinFrequencyResponse: String,
  EartipSize: String,
  FoldableDesign: String,
  Colours: String,
  Dimensions: String,
  NoiseCancellation: String,
  CallControl: String,
  MusicControl: String,
  Connectivity: String,
  BluetoothVersion: String,
  Range: String,
  BluetoothFeatures: String,
  Microphone: String,
  BatteryType: String,
  PlaybackTime: String,
  BatteryCapacity: String,
  StandbyTime: String,
  ChargingType: String,
  ChargingTime: String,
  CompatibleModels: String,
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

export const Earbuds = mongoose.model("earbuds", EarbudSchema);
