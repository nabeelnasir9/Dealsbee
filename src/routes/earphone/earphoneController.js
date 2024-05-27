import * as earphoneService from "../../services/earphone.service.js";

export const getEarphones = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      Brand: req.query.Brand,
      Type: req.query.Type,
      Design: req.query.Design,
      Impedance: req.query.Impedance,
      Sensitivity: req.query.Sensitivity,
      expertScore: req.query.expertScore,
      frequencyResponse: req.query.frequencyResponse,
      "Driver type": req.query["Driver type"],
      "Eartip size": req.query["Eartip size"],
      "Foldable Design": req.query["Foldable Design"],
      "Colour(s)": req.query["Colour(s)"],
      "Bluetooth version": req.query["Bluetooth version"],
      Microphone: req.query.Microphone,
      "Playback time": req.query["Playback time"],
      "Battery capacity": req.query["Battery capacity"],
      "Charging type": req.query["Charging type"],
      variants: req.query.variants,
      stores: req.query.stores,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const earphones = await earphoneService.getAllEarphones(filters);
    res.json(earphones);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getEarphoneById = async (req, res) => {
  try {
    const { earphone, similarEarphones } = await earphoneService.getEarphoneById(
      req.params.id
    );
    if (earphone) {
      res.json({ earphone, similarEarphones });
    } else {
      res.status(404).send("Earphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createEarphone = async (req, res) => {
  try {
    const earphone = await earphoneService.createEarphone(req.body);
    res.status(201).json(earphone);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateEarphone = async (req, res) => {
  try {
    const updatedEarphone = await earphoneService.updateEarphone(
      req.params.id,
      req.body
    );
    if (updatedEarphone) {
      res.json(updatedEarphone);
    } else {
      res.status(404).send("Earphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteEarphone = async (req, res) => {
  try {
    const result = await earphoneService.deleteEarphone(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Earphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
