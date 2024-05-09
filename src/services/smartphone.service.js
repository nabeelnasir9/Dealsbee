import { Smartphone } from "../models/Phones.js";

export const getAllSmartphones = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    RAM,
    operatingSystem,
    capacity,
    network,
    mobiletype,
    refreshRate,
    cameraType,
    numOfCores,
    expertScore,
    brands,
    chipSet,
    graphics,
    resolution,
    screenSize,
    stores,
    camera
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    if (minPrice) query["variants.0.price"] = { $gte: `₹${minPrice}` };
    if (maxPrice)
      query["variants.0.price"] = {
        ...query["variants.0.price"],
        $lte: `₹${maxPrice}`,
      };
  }

  if (RAM) {
    query.RAM = RAM;
  }

  if (operatingSystem) {
    query["Operating System"] = operatingSystem;
  }

  if (capacity) {
    query.Capacity = capacity;
  }

  if (mobiletype) {
    query["Mobile Type"] = mobiletype;
  }

  if (network) {
    query.Network = { $regex: new RegExp(network, "i") };
  }

  if (refreshRate) {
    query["Display Refresh Rate"] = refreshRate;
  }

  if (cameraType) {
    query["Rear camera setup"] = cameraType;
  }

  if (numOfCores) {
    query["No Of Cores"] = numOfCores;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if (brands) {
    query.brand = brands;
  }

  if (chipSet) {
    query.Chipset = chipSet;
  }

  if (graphics) {
    query.Graphics = graphics;
  }

  if (resolution) {
    query.Resolution = resolution;
  }

  if(screenSize){
    query["Screen Size"] = screenSize;
  }
  if(stores){
    query.stores=stores;
  }

  if(camera){
    query["Rear Camera"]= camera;
  }
  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Smartphone.find(query, null, options);
};

export const getSmartphoneById = (id) => {
  return Smartphone.findById(id);
};

export const createSmartphone = (data) => {
  const smartphone = new Smartphone(data);
  return smartphone.save();
};

export const updateSmartphone = (id, data) => {
  return Smartphone.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSmartphone = (id) => {
  return Smartphone.findByIdAndDelete(id);
};
