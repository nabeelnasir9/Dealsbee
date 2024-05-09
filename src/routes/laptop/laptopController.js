// import * as tabletService from "../../services/tablet.service.js";
import * as laptopService from "../../services/laptop.service.js";

export const getLaptops = async (req, res) => {
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
      Capacity: req.query.Capacity,
      SSDCapacity: req.query["SSD Capacity"],
      brands: req.query.brands,
      ramType: req.query.ramType,
      processorBrand: req.query.processorBrand,
    };
    const laptops = await laptopService.getAllLaptops(filters);
    res.json(laptops);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getLaptopById = async (req, res) => {
  try {
    const laptop = await laptopService.getLaptopById(req.params.id);
    if (laptop) {
      res.json(laptop);
    } else {
      res.status(404).send("laptop not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createLaptop = async (req, res) => {
  try {
    const laptop = await laptopService.createLaptop(req.body);
    res.status(201).json(laptop);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateLaptop = async (req, res) => {
  try {
    const updatedLaptop = await laptopService.updateLaptop(
      req.params.id,
      req.body
    );
    if (updatedLaptop) {
      res.json(updatedLaptop);
    } else {
      res.status(404).send("laptop not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteLaptop = async (req, res) => {
  try {
    const result = await laptopService.deleteLaptop(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("laptop not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
