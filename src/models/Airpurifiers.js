import mongoose from "mongoose";

const AirPurifierSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  Type: String,
  Dimensions: String,
  Weight: String,
  Colour: String,
  Material: String,
  Box_contents: String,
  Filter_Type: String,
  Number_of_Filters: String,
  Air_Flow_Level: String,
  Number_of_Speed_Settings: String,
  Clean_Air_Delivery_Rate: String,
  Power_Consumption: String,
  Power_input: String,
  Mobile_app_support: String,
  Sleep_Mode: String,
  Wi_Fi_enabled: String,
  Filter_Replacement_Indicator: String,
  Child_Lock: String,
  Silent_mode: String,
  Air_Quality_Indication_Type: String,
  Turbo_Mode: String,
  Product_Warranty: String,
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

export const AirPurifier = mongoose.model("air_purifiers", AirPurifierSchema);
