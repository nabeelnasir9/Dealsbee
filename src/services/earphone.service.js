import { Earphones } from "../models/Earphones.js";

export const getAllEarphones = (filters) => {
  const {
    limit = 30,
    page = 1,
    minPrice,
    maxPrice,
    brands,
    Type,
    Design,
    Impedance,
    Sensitivity,
    expertScore,
    frequencyResponse,
    "Driver type": DriverType,
    "Eartip size": EartipSize,
    "Foldable Design": FoldableDesign,
    "Colour(s)": Colours,
    "Bluetooth version": BluetoothVersion,
    Microphone,
    "Playback time": PlaybackTime,
    "Battery capacity": BatteryCapacity,
    "Charging type": ChargingType,
    variants,
    stores,
    availability,
    discounts,
  } = filters;

  const query = {};

  if (minPrice || maxPrice) {
    query["variants.price"] = {};
    if (minPrice) query["variants.price"].$gte = minPrice;
    if (maxPrice) query["variants.price"].$lte = maxPrice;
  }

  if (brands) {
    query.brand = brands;
  }

  if (Type) {
    query.Type = Type;
  }

  if (Design) {
    query.Design = Design;
  }

  if (frequencyResponse) {
    query.FrequencyResponse = frequencyResponse;
  }

  if (Impedance) {
    query.Impedance = Impedance;
  }

  if (Sensitivity) {
    query.Sensitivity = Sensitivity;
  }

  if (DriverType) {
    query["Driver type"] = DriverType;
  }

  if (expertScore) {
    query["Expert Score"] = expertScore;
  }

  if (EartipSize) {
    query["Eartip size"] = EartipSize;
  }

  if (FoldableDesign) {
    query["Foldable Design"] = FoldableDesign;
  }

  if (Colours) {
    query["Colour(s)"] = Colours;
  }

  if (BluetoothVersion) {
    query["Bluetooth version"] = BluetoothVersion;
  }

  if (Microphone) {
    query.Microphone = Microphone;
  }

  if (PlaybackTime) {
    query["Playback time"] = PlaybackTime;
  }

  if (BatteryCapacity) {
    query["Battery capacity"] = BatteryCapacity;
  }

  if (ChargingType) {
    query["Charging type"] = ChargingType;
  }

  if (variants) {
    query.variants = variants;
  }

  if (stores) {
    query.stores = stores;
  }

  if (availability) {
    query.availability = availability;
  }

  if (discounts) {
    query.discounts = discounts;
  }

  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  return Earphones.find(query, null, options);
};

export const getEarphoneById = async (id) => {
  try {
    const earphone = await Earphones.findById(id);
    if (!earphone) return null;

    const price = parseInt(earphone.variants[0].price.replace(/₹/, ""));
    const lowerBound = price * 0.9;
    const upperBound = price * 1.1;

    const similarEarphones = await Earphones.find({
      "variants.0.price": {
        $gte: `₹${Math.floor(lowerBound)}`,
        $lte: `₹${Math.ceil(upperBound)}`,
      },
      _id: { $ne: id },
    }).limit(8);

    return { earphone, similarEarphones };
  } catch (error) {
    console.error("Failed to fetch earphone by ID with error:", error);
    throw error;
  }
};

export const createEarphone = (data) => {
  const earphone = new Earphones(data);
  return earphone.save();
};

export const updateEarphone = (id, data) => {
  return Earphones.findByIdAndUpdate(id, data, { new: true });
};

export const deleteEarphone = (id) => {
  return Earphones.findByIdAndDelete(id);
};
