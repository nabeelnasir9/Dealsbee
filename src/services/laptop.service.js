import { Laptops } from "../models/Laptops.js";

export const getAllLaptops = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    RAM,
    Capacity,
    operatingSystem,
    storage,
    network,
    screenType,
    refreshRate,
    cameraType,
    numOfCores,
    expertScore,
    SSDCapacity,
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
  if (SSDCapacity) {
    query["SSD Capacity"] = SSDCapacity;
  }
  if (Capacity) {
    query.Capacity = Capacity;
  }

  if (operatingSystem) {
    query["Operating System"] = operatingSystem;
  }

  if (storage) {
    query["SSD Capacity"] = storage;
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

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Laptops.find(query, null, options);
};

export const getLaptopById = (id) => {
  return Laptops.findById(id);
};

export const createLaptop = (data) => {
  const laptop = new Laptops(data);
  return laptop.save();
};

export const updateLaptop = (id, data) => {
  return Laptops.findByIdAndUpdate(id, data, { new: true });
};

export const deleteLaptop = (id) => {
  return Laptops.findByIdAndDelete(id);
};
