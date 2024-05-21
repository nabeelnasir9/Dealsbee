import * as washingMachineService from "../../services/washing.service.js";

export const getWashingMachines = async (req, res) => {
    try {
      const filters = {
        limit: req.query.limit,
        page: req.query.page,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        capacity: req.query.capacity,
        color: req.query.color,
        type: req.query.type,
        control: req.query.control,
        technology: req.query.technology,
        energyRating: req.query.energyRating,
        brands: req.query.brands,
        stores: req.query.stores,
        expertScore: req.query.expertScore,
        warranty: req.query.warranty,
        discounts: req.query.discounts,
      };
      const washingMachines = await washingMachineService.getAllWashingMachines(filters);
      res.json(washingMachines);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const getWashingMachineById = async (req, res) => {
    try {
      const { washingMachine, similarWashingMachines } = await washingMachineService.getWashingMachineById(req.params.id);
      if (washingMachine) {
        res.json({ washingMachine, similarWashingMachines });
      } else {
        res.status(404).send("Washing machine not found");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const createWashingMachine = async (req, res) => {
    try {
      const washingMachine = await washingMachineService.createWashingMachine(req.body);
      res.status(201).json(washingMachine);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const updateWashingMachine = async (req, res) => {
    try {
      const updatedWashingMachine = await washingMachineService.updateWashingMachine(
        req.params.id,
        req.body
      );
      if (updatedWashingMachine) {
        res.json(updatedWashingMachine);
      } else {
        res.status(404).send("Washing machine not found");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const deleteWashingMachine = async (req, res) => {
    try {
      const result = await washingMachineService.deleteWashingMachine(req.params.id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).send("Washing machine not found");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }