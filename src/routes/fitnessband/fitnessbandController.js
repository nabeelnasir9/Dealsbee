import * as fitnessBandService from "../../services/fitnessband.service.js";

export const getFitnessBands = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sensors: req.query.sensors,
      sleepQualityTracker: req.query.sleepQualityTracker,
      spO2Sensor: req.query.spO2Sensor,
      expertScore: req.query.expertScore,
      displayType: req.query.displayType,
      waterResistant: req.query.waterResistant,
      bluetooth: req.query.bluetooth,
      brands: req.query.brands,
      stores: req.query.stores,
      availability: req.query.availability,
      strapMaterial: req.query.strapMaterial,
      bodyDesign: req.query.bodyDesign,
      discounts: req.query.discounts,
    };
    console.log("Received Filters: ", filters);

    const fitnessBands = await fitnessBandService.getAllFitnessBands(filters);
    res.json(fitnessBands);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getFitnessBandById = async (req, res) => {
  try {
    const { fitnessBand, similarFitnessBands } = await fitnessBandService.getFitnessBandById(req.params.id);
    if (fitnessBand) {
      res.json({ fitnessBand, similarFitnessBands });
    } else {
      res.status(404).send("Fitness Band not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createFitnessBand = async (req, res) => {
  try {
    const fitnessBand = await fitnessBandService.createFitnessBand(req.body);
    res.status(201).json(fitnessBand);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateFitnessBand = async (req, res) => {
  try {
    const updatedFitnessBand = await fitnessBandService.updateFitnessBand(req.params.id, req.body);
    if (updatedFitnessBand) {
      res.json(updatedFitnessBand);
    } else {
      res.status(404).send("Fitness Band not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteFitnessBand = async (req, res) => {
  try {
    const result = await fitnessBandService.deleteFitnessBand(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Fitness Band not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
