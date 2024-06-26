import { FitnessBand } from "../models/Fitnessbands.js";

export const getAllFitnessBands = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    sensors,
    sleepQualityTracker,
    spO2Sensor,
    expertScore,
    displayType,
    waterResistant,
    bluetooth,
    brands,
    stores,
    availability,
    strapMaterial,
    bodyDesign,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

  if (sensors) {
    query.Sensors = { $regex: new RegExp(sensors, "i") };
  }

  if (sleepQualityTracker) {
    query.SleepQualityTracker = sleepQualityTracker;
  }

  if (spO2Sensor) {
    query.SpO2Sensor = spO2Sensor;
  }

  if (expertScore) {
    query.ExpertScore = expertScore;
  }

  if (displayType) {
    query.DisplayType = { $regex: new RegExp(displayType, "i") };
  }

  if (waterResistant) {
    query.WaterResistant = waterResistant;
  }

  if (bluetooth) {
    query.Bluetooth = { $regex: new RegExp(bluetooth, "i") };
  }

  if (brands) {
    query.brand = brands;
  }

  if (stores) {
    query.stores = stores;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if(availability){
    query.availability=availability;
  }

  if (strapMaterial) {
    query.StrapMaterial = { $regex: new RegExp(strapMaterial, "i") };
  }

  if (bodyDesign) {
    query.BodyDesign = { $regex: new RegExp(bodyDesign, "i") };
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return FitnessBand.find(query, null, options);
};

export const getFitnessBandById = async (id) => {
  try {
    const fitnessBand = await FitnessBand.findById(id);
    if (!fitnessBand) return null;

    const price = parseInt(fitnessBand.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarFitnessBands = await FitnessBand.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { fitnessBand, similarFitnessBands };
  } catch (error) {
    console.error("Failed to fetch fitness band by ID with error:", error);
    throw error;
  }
};

export const createFitnessBand = (data) => {
  const fitnessBand = new FitnessBand(data);
  return fitnessBand.save();
};

export const updateFitnessBand = (id, data) => {
  return FitnessBand.findByIdAndUpdate(id, data, { new: true });
};

export const deleteFitnessBand = (id) => {
  return FitnessBand.findByIdAndDelete(id);
};
