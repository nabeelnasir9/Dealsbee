import * as smartwatchService from "../../services/watch.service.js";

export const getSmartwatches = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      size: req.query.size,
      resolution: req.query.resolution,
      shape: req.query.shape,
      pixelDensity: req.query.pixelDensity,
      touchscreen: req.query.touchscreen,
      warranty: req.query.warranty,
      durability: req.query.durability,
      waterResistant: req.query.waterResistant,
      alarm: req.query.alarm,
      notifications: req.query.notifications,
      sensors: req.query.sensors,
      activityTrackers: req.query.activityTrackers,
      capacity: req.query.capacity,
      expectedLife: req.query.expectedLife,
      chargingType: req.query.chargingType,
      wirelessConnectivity: req.query.wirelessConnectivity,
      expertScore: req.query.expertScore,
      stores: req.query.stores,
      brands: req.query.brands,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const smartwatches = await smartwatchService.getAllSmartwatches(filters);
    res.json(smartwatches);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getSmartwatchById = async (req, res) => {
  try {
    const { smartwatch, similarSmartwatches } = await smartwatchService.getSmartwatchById(req.params.id);
    if (smartwatch) {
      res.json({ smartwatch, similarSmartwatches });
    } else {
      res.status(404).send("Smartwatch not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createSmartwatch = async (req, res) => {
  try {
    const smartwatch = await smartwatchService.createSmartwatch(req.body);
    res.status(201).json(smartwatch);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateSmartwatch = async (req, res) => {
  try {
    const updatedSmartwatch = await smartwatchService.updateSmartwatch(req.params.id, req.body);
    if (updatedSmartwatch) {
      res.json(updatedSmartwatch);
    } else {
      res.status(404).send("Smartwatch not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteSmartwatch = async (req, res) => {
  try {
    const result = await smartwatchService.deleteSmartwatch(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Smartwatch not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
