import { TVs } from "../models/TVs.js";

export const getAllTVs = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    brand,
    resolution,
    screenSize,
    stores,
    hdmiports,
    usbPorts,
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

  if (brand) {
    query["Brand"] = brand;
  }

  if (resolution) {
    query["Resolution"] = resolution;
  }

  if (screenSize) {
    query["Size(Diagonal)"] = screenSize;
  }

  if (hdmiports) {
    query["HDMI Ports"] = hdmiports;
  }

  if (usbPorts) {
    query["USB Ports"] = usbPorts;
  }

  if(stores){
    query.stores =stores;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if (availability) {
    query["variants.availability"] = availability;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return TVs.find(query, null, options);
};

export const getTVById = async (id) => {
  try {
    const tv = await TVs.findById(id);
    if (!tv) return null; 

    const price = parseInt(tv.variants[0].price.replace(/₹/, ''));

    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarTVs = await TVs.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`
      },
      _id: { $ne: id }
    }).limit(8);  

    return { tv, similarTVs };
  } catch (error) {
    console.error("Failed to fetch TV by ID with error:", error);
    throw error;
  }
};

export const createTV = (data) => {
  const tv = new TVs(data);
  return tv.save();
};

export const updateTV = (id, data) => {
  return TVs.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTV = (id) => {
  return TVs.findByIdAndDelete(id);
};
