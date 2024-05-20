import { AirConditioners } from "../models/AC.js";

export const getAllAirConditioners = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    starRating,
    capacity,
    acType,
    coolingCapacity,
    brands,
    stores,
    availability,
    expertScore,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

  if (starRating) {
    query["Star Rating"] = starRating;
  }

  if (capacity) {
    query["Capacity in Tons"] = capacity;
  }

  if (acType) {
    query["AC Type"] = acType;
  }

  if (coolingCapacity) {
    query["Cooling Capacity"] = coolingCapacity;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if (brands) {
    query["Brand"] = brands;
  }

  if(stores){
    query.stores =stores;
  }

  if(availability){
    query.availability=availability;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return AirConditioners.find(query, null, options);
};

export const getAirConditionerById = async (id) => {
  try {
    const airConditioner = await AirConditioners.findById(id);
    if (!airConditioner) return null;

    const price = parseInt(airConditioner.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarAirConditioners = await AirConditioners.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { airConditioner, similarAirConditioners };
  } catch (error) {
    console.error("Failed to fetch air conditioner by ID with error:", error);
    throw error;
  }
};

export const createAirConditioner = (data) => {
  const airConditioner = new AirConditioners(data);
  return airConditioner.save();
};

export const updateAirConditioner = (id, data) => {
  return AirConditioners.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAirConditioner = (id) => {
  return AirConditioners.findByIdAndDelete(id);
};
