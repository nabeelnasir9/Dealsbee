import { Earbuds } from "../models/Earbuds.js";

export const getAllEarbuds = (filters) => {
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
    query.FrequencyResponse = frequencyResponse;
  }

  if (colours) {
    query.Colours = { $regex: new RegExp(colours, "i") };
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
    query["Expert Score"] = expertScore;
  }

  if(availability){
    query.availability=availability;
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

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Earbuds.find(query, null, options);
};

export const getEarbudById = async (id) => {
  try {
    const earbud = await Earbuds.findById(id);
    if (!earbud) return null;

    const price = parseInt(earbud.variants[0].price.replace(/₹/, ''));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarEarbuds = await Earbuds.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { earbud, similarEarbuds };
  } catch (error) {
    console.error("Failed to fetch earbud by ID with error:", error);
    throw error;
  }
};

export const createEarbud = (data) => {
  const earbud = new Earbuds(data);
  return earbud.save();
};

export const updateEarbud = (id, data) => {
  return Earbuds.findByIdAndUpdate(id, data, { new: true });
};

export const deleteEarbud = (id) => {
  return Earbuds.findByIdAndDelete(id);
};
