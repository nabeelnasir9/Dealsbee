import { Refrigerators } from "../models/Refrigerators.js";

export const getAllRefrigerators = (filters) => {
  const {
    limit = 30,
    page = 1,
    minPrice,
    maxPrice,
    capacity,
    energyRating,
    brands,
    color,
    doorFinish,
    handleType,
    turboMode,
    humidityController,
    expressFreezing,
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

  if (energyRating) {
    query.EnergyRating = energyRating;
  }

  if (brands) {
    query.Brand = brands;
  }

  if (color) {
    query.Color = { $regex: new RegExp(color, "i") };
  }

  if (doorFinish) {
    query.DoorFinish = { $regex: new RegExp(doorFinish, "i") };
  }

  if (handleType) {
    query.HandleType = { $regex: new RegExp(handleType, "i") };
  }

  if (turboMode) {
    query.TurboMode = turboMode;
  }

  if (humidityController) {
    query.HumidityController = humidityController;
  }

  if (expressFreezing) {
    query.ExpressFreezing = expressFreezing;
  }

  if (stores) {
    query.stores = stores;
  }

  if(availability){
    query.availability=availability;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Refrigerators.find(query, null, options);
};

export const getRefrigeratorById = async (id) => {
  try {
    const refrigerator = await Refrigerators.findById(id);
    if (!refrigerator) return null;

    const price = parseInt(refrigerator.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarRefrigerators = await Refrigerators.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { refrigerator, similarRefrigerators };
  } catch (error) {
    console.error("Failed to fetch refrigerator by ID with error:", error);
    throw error;
  }
};

export const createRefrigerator = (data) => {
  const refrigerator = new Refrigerators(data);
  return refrigerator.save();
};

export const updateRefrigerator = (id, data) => {
  return Refrigerators.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRefrigerator = (id) => {
  return Refrigerators.findByIdAndDelete(id);
};
