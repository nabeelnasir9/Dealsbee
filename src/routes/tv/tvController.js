import * as tvService from "../../services/tv.service.js";

export const getTVs = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      brand: req.query.brand,
      resolution: req.query.resolution,
      screenSize: req.query.screenSize,
      stores: req.query.stores,
      hdmiports: req.query.hdmiports,
      usbPorts: req.query.usbPorts,
      expertScore: req.query.expertScore,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const TVs = await tvService.getAllTVs(filters);
    res.json(TVs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getTVById = async (req, res) => {
  try {
    const { tv, similarTVs } = await tvService.getTVById(req.params.id);
    if (tv) {
      res.json({ tv, similarTVs });
    } else {
      res.status(404).send("TV not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createTV = async (req, res) => {
  try {
    const TV = await tvService.createTV(req.body);
    res.status(201).json(TV);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateTV = async (req, res) => {
  try {
    const updatedTV = await tvService.updateTV(req.params.id, req.body);
    if (updatedTV) {
      res.json(updatedTV);
    } else {
      res.status(404).send("TV not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteTV = async (req, res) => {
  try {
    const result = await tvService.deleteTV(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("TV not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
