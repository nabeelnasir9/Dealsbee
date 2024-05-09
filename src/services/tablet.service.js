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
    chipset
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

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

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if(brands){
    query.brand=brands;
  }

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

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Tablets.find(query, null, options);
};

export const getTabletById = (id) => {
  return Tablets.findById(id);
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
