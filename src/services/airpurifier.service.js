import { AirPurifier } from "../models/Airpurifiers.js";

export const getAllAirPurifiers = (filters) => {
  const {
    limit = 30,
    page = 1,
    minPrice,
    maxPrice,
    airFlowLevel,
    numberOfFilters,
    expertScore,
    colour,
    filterType,
    wiFiEnabled,
    silentMode,
    sleepMode,
    childLock,
    mobileAppSupport,
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

  if (airFlowLevel) {
    query.Air_Flow_Level = airFlowLevel;
  }

  if (numberOfFilters) {
    query.Number_of_Filters = numberOfFilters;
  }

  if (colour) {
    query.Colour = { $regex: new RegExp(colour, "i") };
  }

  if (filterType) {
    query.Filter_Type = filterType;
  }

  if (wiFiEnabled) {
    query.Wi_Fi_enabled = wiFiEnabled;
  }

  if (silentMode) {
    query.Silent_mode = silentMode;
  }

  if (sleepMode) {
    query.Sleep_Mode = sleepMode;
  }

  if (childLock) {
    query.Child_Lock = childLock;
  }

  if (mobileAppSupport) {
    query.Mobile_app_support = mobileAppSupport;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if (expertScore) {
    query.ExpertScore = expertScore;
  }

  if (availability) {
    query.availability = availability;
  }

  if (brands) {
    query.Brand = brands;
  }

  if (stores) {
    query.stores = stores;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return AirPurifier.find(query, null, options);
};

export const getAirPurifierById = async (id) => {
  try {
    const airPurifier = await AirPurifier.findById(id);
    if (!airPurifier) return null;

    const price = parseInt(airPurifier.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarAirPurifiers = await AirPurifier.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { airPurifier, similarAirPurifiers };
  } catch (error) {
    console.error("Failed to fetch air purifier by ID with error:", error);
    throw error;
  }
};

export const createAirPurifier = (data) => {
  const airPurifier = new AirPurifier(data);
  return airPurifier.save();
};

export const updateAirPurifier = (id, data) => {
  return AirPurifier.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAirPurifier = (id) => {
  return AirPurifier.findByIdAndDelete(id);
};
