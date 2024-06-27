import { Tablets } from "../models/Tablets.js";

export const getAllTablets = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    RAM,
    operatingSystem,
    storage,
    network,
    screenType,
    refreshRate,
    cameraType,
    numOfCores,
    expertScore,
    brands,
    screenSize,
    stores,
    resolution,
    chipset,
    availability,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

  if (brands) query["brand"] = { $in: brands.split(",") };
  if (availability) query.availability = { $in: availability.split(",") };

  if (RAM) {
    query.RAM = RAM;
  }

  if (operatingSystem) {
    query["Operating System"] = operatingSystem;
  }

  if (storage) {
    query["Internal Memory"] = storage;
  }

  if (network) {
    query["Network"] = { $regex: new RegExp(network, "i") };
  }

  if (screenType) {
    query["Screen Type"] = screenType;
  }

  if (refreshRate) {
    query["Refresh Rate"] = refreshRate;
  }

  if (cameraType) {
    query["Rear"] = cameraType;
  }

  if (numOfCores) {
    query["Number of Cores"] = numOfCores;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  // if(brands){
  //   query.brand=brands;
  // }

  if(screenSize){
    query["Screen Size"]=screenSize;
  }
  if(stores){
    query.stores =stores;
  }

  if(resolution){
    query.Resolution=resolution;
  }
  if(chipset){
    query["Processor Chipset"]=chipset;
  }

  // if(availability){
  //   query.availability=availability;
  // }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Tablets.find(query, null, options);
};

export const getTabletById = async (id) => {
  // return Tablets.findById(id);
  try {
    const tablet = await Tablets.findById(id);
    if (!tablet) return null;  // Returns null if the smartphone is not found

    // Extract the price of the first variant
    const price = parseInt(tablet.variants[0].price.replace(/₹/, ''));

    // Calculate 10% range for similar price search
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    // Find similar priced smartphones
    const similarTablets = await Tablets.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`
      },
      _id: { $ne: id }  // Exclude the current smartphone
    }).limit(8);  // Limit to 6 similar smartphones

    return { tablet, similarTablets };
  } catch (error) {
    console.error("Failed to fetch smartphone by ID with error:", error);
    throw error;
  }

};

export const createTablet = (data) => {
  const tablet = new Tablets(data);
  return tablet.save();
};

export const updateTablet = (id, data) => {
  return Tablets.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTablet = (id) => {
  return Tablets.findByIdAndDelete(id);
};
