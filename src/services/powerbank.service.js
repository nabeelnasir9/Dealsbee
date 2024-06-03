import { PowerBank } from "../models/Powerbanks.js";

export const getAllPowerBanks = (filters) => {
  const {
    limit = 30,
    page = 1,
    minPrice,
    maxPrice,
    capacity,
    batteryType,
    connectorType,
    bodyMaterial,
    weight,
    color,
    overChargeProtection,
    overDischargeProtection,
    shortCircuitProtection,
    ledIndicators,
    overCurrentProtection,
    temperatureProtections,
    fastCharge,
    ledFlashlight,
    brands,
    stores,
    expertScore,
    availability,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

  if (capacity) {
    query.Capacity = capacity;
  }

  if (batteryType) {
    query.BatteryType = batteryType;
  }

  if (connectorType) {
    query.ConnectorType = connectorType;
  }

  if (bodyMaterial) {
    query.BodyMaterial = bodyMaterial;
  }

  if (weight) {
    query.Weight = weight;
  }

  if (color) {
    query.Color = { $regex: new RegExp(color, "i") };
  }

  if (overChargeProtection) {
    query.OverChargeProtection = overChargeProtection;
  }

  if (overDischargeProtection) {
    query.OverDischargeProtection = overDischargeProtection;
  }

  if (shortCircuitProtection) {
    query.ShortCircuitProtection = shortCircuitProtection;
  }

  if (ledIndicators) {
    query.LEDIndicators = ledIndicators;
  }

  if (overCurrentProtection) {
    query.OverCurrentProtection = overCurrentProtection;
  }

  if (temperatureProtections) {
    query.TemperatureProtections = temperatureProtections;
  }

  if (fastCharge) {
    query.FastCharge = fastCharge;
  }

  if (ledFlashlight) {
    query.LEDFlashlight = ledFlashlight;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if (brands) {
    query.Brand = brands;
  }

  if (stores) {
    query.stores = stores;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if (availability) {
    query.availability = availability;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return PowerBank.find(query, null, options);
};

export const getPowerBankById = async (id) => {
  try {
    const powerBank = await PowerBank.findById(id);
    if (!powerBank) return null;

    const price = parseInt(powerBank.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarPowerBanks = await PowerBank.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { powerBank, similarPowerBanks };
  } catch (error) {
    console.error("Failed to fetch power bank by ID with error:", error);
    throw error;
  }
};

export const createPowerBank = (data) => {
  const powerBank = new PowerBank(data);
  return powerBank.save();
};

export const updatePowerBank = (id, data) => {
  return PowerBank.findByIdAndUpdate(id, data, { new: true });
};

export const deletePowerBank = (id) => {
  return PowerBank.findByIdAndDelete(id);
};
