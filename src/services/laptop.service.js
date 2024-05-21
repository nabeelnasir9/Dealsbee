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
    brands,
    ramType,
    processorBrand,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }
  if (ramType) {
    query["RAM Type"] = ramType?.split(",");
  }
  if (RAM) {
    query.RAM = RAM;
  }
  if (SSDCapacity) {
    query["SSD Capacity"] = SSDCapacity;
  }
  if (processorBrand) {
    // query["Processor"] = processorBrand?.split(",");
    const regexPattern = new RegExp(processorBrand.split(",").join("|")); // 'i' for case-insensitive
    query["Processor"] = { $regex: regexPattern };
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

  if (discounts) {
    query.discounts = discounts;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if(brands) {
    query["Brand"] = brands
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };


  return Laptops.find(query, null, options);
};

export const getLaptopById = async (id) => {
  // return Laptops.findById(id);
  try {
    const laptop = await Laptops.findById(id);
    if (!laptop) return null;  // Returns null if the smartphone is not found

    // Extract the price of the first variant
    const price = parseInt(laptop.variants[0].price.replace(/₹/, ''));

    // Calculate 10% range for similar price search
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    // Find similar priced smartphones
    const similarLaptops = await Laptops.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`
      },
      _id: { $ne: id }  // Exclude the current smartphone
    }).limit(8);  // Limit to 6 similar smartphones

    return { laptop, similarLaptops };
  } catch (error) {
    console.error("Failed to fetch smartphone by ID with error:", error);
    throw error;
  }
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
