import * as airPurifierService from "../../services/airpurifier.service.js";

export const getAirPurifiers = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      airFlowLevel: req.query.airFlowLevel,
      numberOfFilters: req.query.numberOfFilters,
      expertScore: req.query.expertScore,
      colour: req.query.colour,
      filterType: req.query.filterType,
      wiFiEnabled: req.query.wiFiEnabled,
      silentMode: req.query.silentMode,
      sleepMode: req.query.sleepMode,
      childLock: req.query.childLock,
      mobileAppSupport: req.query.mobileAppSupport,
      brands: req.query.brands,
      stores: req.query.stores,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const airPurifiers = await airPurifierService.getAllAirPurifiers(filters);
    res.json(airPurifiers);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getAirPurifierById = async (req, res) => {
  try {
    const { airPurifier, similarAirPurifiers } = await airPurifierService.getAirPurifierById(req.params.id);
    if (airPurifier) {
      res.json({ airPurifier, similarAirPurifiers });
    } else {
      res.status(404).send("Air Purifier not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createAirPurifier = async (req, res) => {
  try {
    const airPurifier = await airPurifierService.createAirPurifier(req.body);
    res.status(201).json(airPurifier);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateAirPurifier = async (req, res) => {
  try {
    const updatedAirPurifier = await airPurifierService.updateAirPurifier(req.params.id, req.body);
    if (updatedAirPurifier) {
      res.json(updatedAirPurifier);
    } else {
      res.status(404).send("Air Purifier not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteAirPurifier = async (req, res) => {
  try {
    const result = await airPurifierService.deleteAirPurifier(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Air Purifier not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
