import { Headphones } from "../models/Headphones.js";

export const getAllHeadphones = (filters) => {
  const {
    limit = 30,
    page = 1,
    minPrice,
    maxPrice,
    impedance,
    sensitivity,
    expertScore,
    frequencyResponse,
    colours,
    noiseCancellation,
    microphone,
    batteryCapacity,
    playbackTime,
    bluetoothVersion,
    brands,
    stores,
    type,
    design,
    availability,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.0.price"] = {};
    if (minPrice) query["variants.0.price"].$gte = `₹${minPrice}`;
    if (maxPrice) query["variants.0.price"].$lte = `₹${maxPrice}`;
  }

  if (impedance) {
    query.Impedance = impedance;
  }

  if (sensitivity) {
    query.Sensitivity = sensitivity;
  }

  if (frequencyResponse) {
    query.MaxFrequencyResponse = { $regex: new RegExp(frequencyResponse, "i") };
  }

  if (colours) {
    query.Colour = { $regex: new RegExp(colours, "i") };
  }

  if (noiseCancellation) {
    query.NoiseCancellation = noiseCancellation;
  }

  if (microphone) {
    query.Microphone = microphone;
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

  if (batteryCapacity) {
    query.BatteryCapacity = batteryCapacity;
  }

  if (playbackTime) {
    query.PlaybackTime = playbackTime;
  }

  if (bluetoothVersion) {
    query.BluetoothVersion = bluetoothVersion;
  }

  if (brands) {
    query.Brand = brands;
  }

  if (stores) {
    query.stores = stores;
  }

  if (type) {
    query.Type = type;
  }

  if (design) {
    query.Design = design;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Headphones.find(query, null, options);
};

export const getHeadphoneById = async (id) => {
  try {
    const headphone = await Headphones.findById(id);
    if (!headphone) return null;

    const price = parseInt(headphone.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarHeadphones = await Headphones.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { headphone, similarHeadphones };
  } catch (error) {
    console.error("Failed to fetch headphone by ID with error:", error);
    throw error;
  }
};

export const createHeadphone = (data) => {
  const headphone = new Headphones(data);
  return headphone.save();
};

export const updateHeadphone = (id, data) => {
  return Headphones.findByIdAndUpdate(id, data, { new: true });
};

export const deleteHeadphone = (id) => {
  return Headphones.findByIdAndDelete(id);
};
