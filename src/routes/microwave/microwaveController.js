import * as microwaveService from "../../services/microwave.service.js";

export const getMicrowaveOvens = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      capacity: req.query.capacity,
      controlType: req.query.controlType,
      displayType: req.query.displayType,
      autoCookMenu: req.query.autoCookMenu,
      childLock: req.query.childLock,
      brands: req.query.brands,
      stores: req.query.stores,
      expertScore: req.query.expertScore,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const microwaves = await microwaveService.getAllMicrowaveOvens(filters);
    res.json(microwaves);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getMicrowaveOvenById = async (req, res) => {
  try {
    const { microwave, similarMicrowaveOvens } = await microwaveService.getMicrowaveOvenById(req.params.id);
    if (microwave) {
      res.json({ microwave, similarMicrowaveOvens });
    } else {
      res.status(404).send("Microwave oven not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createMicrowaveOven = async (req, res) => {
  try {
    const microwave = await microwaveService.createMicrowaveOven(req.body);
    res.status(201).json(microwave);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateMicrowaveOven = async (req, res) => {
  try {
    const updatedMicrowave = await microwaveService.updateMicrowaveOven(req.params.id, req.body);
    if (updatedMicrowave) {
      res.json(updatedMicrowave);
    } else {
      res.status(404).send("Microwave oven not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteMicrowaveOven = async (req, res) => {
  try {
    const result = await microwaveService.deleteMicrowaveOven(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Microwave oven not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
