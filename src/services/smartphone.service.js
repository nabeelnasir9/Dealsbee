import { Smartphone } from '../models/Phones.js';

export const getAllSmartphones = ({ limit = 20, page = 1}) => {
  const query = {};
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
