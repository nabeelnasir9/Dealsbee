import * as headphoneService from "../../services/headphone.service.js";

export const getHeadphones = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      impedance: req.query.impedance,
      expertScore: req.query.expertScore,
      sensitivity: req.query.sensitivity,
      frequencyResponse: req.query.frequencyResponse,
      colours: req.query.colours,
      noiseCancellation: req.query.noiseCancellation,
      microphone: req.query.microphone,
      batteryCapacity: req.query.batteryCapacity,
      playbackTime: req.query.playbackTime,
      bluetoothVersion: req.query.bluetoothVersion,
      brands: req.query.brands,
      stores: req.query.stores,
      availability: req.query.availability,
      discounts: req.query.discounts,
      type: req.query.type,
      design: req.query.design,
    };
    const headphones = await headphoneService.getAllHeadphones(filters);
    res.json(headphones);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getHeadphoneById = async (req, res) => {
  try {
    const { headphone, similarHeadphones } = await headphoneService.getHeadphoneById(req.params.id);
    if (headphone) {
      res.json({ headphone, similarHeadphones });
    } else {
      res.status(404).send("Headphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createHeadphone = async (req, res) => {
  try {
    const headphone = await headphoneService.createHeadphone(req.body);
    res.status(201).json(headphone);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateHeadphone = async (req, res) => {
  try {
    const updatedHeadphone = await headphoneService.updateHeadphone(req.params.id, req.body);
    if (updatedHeadphone) {
      res.json(updatedHeadphone);
    } else {
      res.status(404).send("Headphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteHeadphone = async (req, res) => {
  try {
    const result = await headphoneService.deleteHeadphone(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Headphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
