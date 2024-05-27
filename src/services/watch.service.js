import { Smartwatches } from "../models/Watches.js";

export const getAllSmartwatches = (filters) => {
  const {
    limit = 30,
    page = 1,
    minPrice,
    maxPrice,
    size,
    resolution,
    shape,
    pixelDensity,
    touchscreen,
    warranty,
    durability,
    waterResistant,
    alarm,
    notifications,
    sensors,
    activityTrackers,
    capacity,
    expectedLife,
    chargingType,
    wirelessConnectivity,
    expertScore,
    brands,
    stores,
    availability,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

  if (size) {
    query.Size = size;
  }

  if (resolution) {
    query.Resolution = resolution;
  }

  if (shape) {
    query.Shape = shape;
  }

  if (pixelDensity) {
    query.PixelDensity = pixelDensity;
  }

  if (touchscreen) {
    query.Touchscreen = touchscreen;
  }

  if (warranty) {
    query.Warranty = warranty;
  }

  if (durability) {
    query.Durability = durability;
  }

  if (waterResistant) {
    query.WaterResistant = waterResistant;
  }

  if (alarm) {
    query.Alarm = alarm;
  }

  if (notifications) {
    query.Notifications = notifications;
  }

  if (sensors) {
    query.Sensors = { $in: sensors.split(",") };
  }

  if (activityTrackers) {
    query.ActivityTrackers = { $regex: new RegExp(activityTrackers, "i") };
  }

  if (capacity) {
    query.Capacity = capacity;
  }

  if (brands) {
    query.Brand = brands;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if(availability){
    query.availability=availability;
  }

  if (expectedLife) {
    query.ExpectedLife = expectedLife;
  }

  if (chargingType) {
    query.ChargingType = chargingType;
  }

  if (wirelessConnectivity) {
    query.WirelessConnectivity = wirelessConnectivity;
  }

  if (expertScore) {
    query.ExpertScore = expertScore;
  }

  if (stores) {
    query["variants.store"] = stores;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Smartwatches.find(query, null, options);
};

export const getSmartwatchById = async (id) => {
  try {
    const smartwatch = await Smartwatches.findById(id);
    if (!smartwatch) return null;

    const price = parseInt(smartwatch.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarSmartwatches = await Smartwatches.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { smartwatch, similarSmartwatches };
  } catch (error) {
    console.error("Failed to fetch smartwatch by ID with error:", error);
    throw error;
  }
};

export const createSmartwatch = (data) => {
  const smartwatch = new Smartwatches(data);
  return smartwatch.save();
};

export const updateSmartwatch = (id, data) => {
  return Smartwatches.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSmartwatch = (id) => {
  return Smartwatches.findByIdAndDelete(id);
};
