// import * as tabletService from "../../services/tablet.service.js";
import * as tabletService from "../../services/tablet.service.js";

export const getTablets = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      RAM: req.query.RAM,
      operatingSystem: req.query.operatingSystem,
      storage: req.query.storage,
      network: req.query.network,
      screenType: req.query.screenType,
      refreshRate: req.query.refreshRate,
      cameraType: req.query.cameraType,
      numOfCores: req.query.numOfCores,
      expertScore: req.query.expertScore,
      brands: req.query.brands,
      screenSize: req.query.screenSize,
      stores: req.query.stores,
      resolution: req.query.resolution,
      chipset:req.query.chipset
    };
    const tablets = await tabletService.getAllTablets(filters);
    res.json(tablets);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getTabletById = async (req, res) => {
  try {
    const tablet = await tabletService.getTabletById(req.params.id);
    if (tablet) {
      res.json(tablet);
    } else {
      res.status(404).send("Tablet not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createTablet = async (req, res) => {
  try {
    const tablet = await tabletService.createTablet(req.body);
    res.status(201).json(tablet);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateTablet = async (req, res) => {
  try {
    const updatedTablet = await tabletService.updateTablet(
      req.params.id,
      req.body
    );
    if (updatedTablet) {
      res.json(updatedTablet);
    } else {
      res.status(404).send("Tablet not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteTablet = async (req, res) => {
  try {
    const result = await tabletService.deleteTablet(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Tablet not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
