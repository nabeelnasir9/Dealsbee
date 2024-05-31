import mongoose from "mongoose";

const PowerBankSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  Brand: String,
  Model: String,
  Warranty: String,
  BoxContents: String,
  Capacity: String,
  BatteryType: String,
  ConnectorType: String,
  NoOfOutputPorts: String,
  PowerInput: String,
  PowerOutput: String,
  CompatibleBrand: String,
  CompatibleDevices: String,
  BodyMaterial: String,
  Weight: String,
  Color: [String],
  Dimensions: String,
  ShapeOrFormFactor: String,
  OverChargeProtection: String,
  OverDischargeProtection: String,
  ShortCircuitProtection: String,
  LEDIndicators: String,
  OverCurrentProtection: String,
  TemperatureProtections: String,
  FastCharge: String,
  LEDFlashlight: String,
  variants: [
    {
      store: String,
      price: String,
      store_link: String,
    },
  ],
  images: [String],
  ExpertScore: String,
},{ collection: 'power_bank' });

export const PowerBank = mongoose.model("power_bank", PowerBankSchema);
