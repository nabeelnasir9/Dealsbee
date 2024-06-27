import { MicrowaveOven } from "../models/Microwaves.js";

export const getAllMicrowaveOvens = (filters) => {
  const {
    limit = 20,
    page = 1,
    minPrice,
    maxPrice,
    capacity,
    controlType,
    displayType,
    autoCookMenu,
    childLock,
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

  if (brands) query["Brand"] = { $in: brands.split(",") };
  if (availability) query["availability"] = { $in: availability.split(",") };

  if (capacity) {
    query.Capacity = capacity;
  }

  if (controlType) {
    query.Control_Type = controlType;
  }

  if (displayType) {
    query.Display_Type = displayType;
  }

  if (autoCookMenu) {
    query.Auto_Cook_Menu = autoCookMenu;
  }

  if (childLock) {
    query.Child_Lock = childLock;
  }

  // if (brands) {
  //   query.Brand = brands;
  // }

  if (stores) {
    query.stores = stores;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if(availability){
    query.availability=availability;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return MicrowaveOven.find(query, null, options);
};

export const getMicrowaveOvenById = async (id) => {
  try {
    const microwave = await MicrowaveOven.findById(id);
    if (!microwave) return null;

    const price = parseInt(microwave.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarMicrowaveOvens = await MicrowaveOven.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { microwave, similarMicrowaveOvens };
  } catch (error) {
    console.error("Failed to fetch microwave oven by ID with error:", error);
    throw error;
  }
};

export const createMicrowaveOven = (data) => {
  const microwave = new MicrowaveOven(data);
  return microwave.save();
};

export const updateMicrowaveOven = (id, data) => {
  return MicrowaveOven.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMicrowaveOven = (id) => {
  return MicrowaveOven.findByIdAndDelete(id);
};
