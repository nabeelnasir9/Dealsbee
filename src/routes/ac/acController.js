import * as acService from "../../services/ac.service.js";

export const getAirConditioners = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      starRating: req.query.starRating,
      capacity: req.query.capacity,
      acType: req.query.acType,
      coolingCapacity: req.query.coolingCapacity,
      brands: req.query.brands,
      availability: req.query.availability,
      stores: req.query.stores,
      discounts: req.query.discounts,
      expertScore: req.query.expertScore,
    };
    const airConditioners = await acService.getAllAirConditioners(filters);
    res.json(airConditioners);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getAirConditionerById = async (req, res) => {
  try {
    const { airConditioner, similarAirConditioners } = await acService.getAirConditionerById(req.params.id);
    if (airConditioner) {
      res.json({ airConditioner, similarAirConditioners });
    } else {
      res.status(404).send("Air Conditioner not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createAirConditioner = async (req, res) => {
  try {
    const airConditioner = await acService.createAirConditioner(req.body);
    res.status(201).json(airConditioner);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateAirConditioner = async (req, res) => {
  try {
    const updatedAirConditioner = await acService.updateAirConditioner(
      req.params.id,
      req.body
    );
    if (updatedAirConditioner) {
      res.json(updatedAirConditioner);
    } else {
      res.status(404).send("Air Conditioner not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteAirConditioner = async (req, res) => {
  try {
    const result = await acService.deleteAirConditioner(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Air Conditioner not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
