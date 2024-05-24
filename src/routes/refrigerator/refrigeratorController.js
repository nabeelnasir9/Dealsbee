import * as refrigeratorService from "../../services/refrigerator.service.js";

export const getRefrigerators = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      capacity: req.query.capacity,
      energyRating: req.query.energyRating,
      brands: req.query.brands,
      color: req.query.color,
      doorFinish: req.query.doorFinish,
      handleType: req.query.handleType,
      turboMode: req.query.turboMode,
      humidityController: req.query.humidityController,
      expressFreezing: req.query.expressFreezing,
      stores: req.query.stores,
      expertScore: req.query.expertScore,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const refrigerators = await refrigeratorService.getAllRefrigerators(filters);
    res.json(refrigerators);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getRefrigeratorById = async (req, res) => {
  try {
    const { refrigerator, similarRefrigerators } = await refrigeratorService.getRefrigeratorById(req.params.id);
    if (refrigerator) {
      res.json({ refrigerator, similarRefrigerators });
    } else {
      res.status(404).send("Refrigerator not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createRefrigerator = async (req, res) => {
  try {
    const refrigerator = await refrigeratorService.createRefrigerator(req.body);
    res.status(201).json(refrigerator);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateRefrigerator = async (req, res) => {
  try {
    const updatedRefrigerator = await refrigeratorService.updateRefrigerator(req.params.id, req.body);
    if (updatedRefrigerator) {
      res.json(updatedRefrigerator);
    } else {
      res.status(404).send("Refrigerator not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteRefrigerator = async (req, res) => {
  try {
    const result = await refrigeratorService.deleteRefrigerator(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Refrigerator not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
