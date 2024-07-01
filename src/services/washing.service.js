import { WashingMachines } from "../models/Washing.js";

export const getAllWashingMachines = (filters) => {
    const {
      limit = 20,
      page = 1,
      minPrice,
      maxPrice,
      capacity,
      color,
      type,
      control,
      technology,
      energyRating,
      expertScore,
      brands,
      stores,
      warranty,
      discounts,
      availability
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
  
    if (color) {
      query.Color = color;
    }
  
    if (type) {
      query.Type = type;
    }
  
    if (control) {
      query.Control = control;
    }
  
    if (technology) {
      query.Technology = technology;
    }
  
    if (energyRating) {
      query["Energy Rating"] = energyRating;
    }

    if (expertScore) {
      query["Expert Score"] = expertScore;
    }
  
    // if (brands) {
    //   query["Brand"] = brands;
    // }
  
    if(stores){
      query.stores =stores;
    }

    if (discounts) {
      query.discounts = discounts;
    }
  
    if (warranty) {
      query.Warranty = warranty;
    }
  
    const options = {
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };
  
    return WashingMachines.find(query, null, options);
  };
  
  export const getWashingMachineById = async (id) => {
    try {
      const washingMachine = await WashingMachines.findById(id);
      if (!washingMachine) return null;
  
      const price = parseInt(washingMachine.variants[0].price.replace(/₹/, ''));
  
      const lowerBound = price * 0.9;
      const upperBound = price * 1.1;
  
      const similarWashingMachines = await WashingMachines.find({
        "variants.0.price": {
          $gte: `₹${Math.floor(lowerBound)}`,
          $lte: `₹${Math.ceil(upperBound)}`
        },
        _id: { $ne: id }
      }).limit(8);
  
      return { washingMachine, similarWashingMachines };
    } catch (error) {
      console.error("Failed to fetch washing machine by ID with error:", error);
      throw error;
    }
  }