import * as earbudService from "../../services/earbud.service.js";

export const getEarbuds = async (req, res) => {
    try {
      const filters = {
        limit: req.query.limit,
        page: req.query.page,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        impedance: req.query.impedance,
        expertScore: req.query.expertScore,
        sensitivity: req.query.sensitivity,
        frequencyResponse: req.query.frequencyResponse,
        colours: req.query.colours,
        noiseCancellation: req.query.noiseCancellation,
        microphone: req.query.microphone,
        batteryCapacity: req.query.batteryCapacity,
        playbackTime: req.query.playbackTime,
        bluetoothVersion: req.query.bluetoothVersion,
        brands: req.query.brands,
        stores: req.query.stores,
        availability: req.query.availability,
        discounts: req.query.discounts,
      };
      const earbuds = await earbudService.getAllEarbuds(filters);
      res.json(earbuds);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const getEarbudById = async (req, res) => {
    try {
      const { earbud, similarEarbuds } = await earbudService.getEarbudById(req.params.id);
      if (earbud) {
        res.json({ earbud, similarEarbuds });
      } else {
        res.status(404).send("Earbud not found");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const createEarbud = async (req, res) => {
    try {
      const earbud = await earbudService.createEarbud(req.body);
      res.status(201).json(earbud);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const updateEarbud = async (req, res) => {
    try {
      const updatedEarbud = await earbudService.updateEarbud(req.params.id, req.body);
      if (updatedEarbud) {
        res.json(updatedEarbud);
      } else {
        res.status(404).send("Earbud not found");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  export const deleteEarbud = async (req, res) => {
    try {
      const result = await earbudService.deleteEarbud(req.params.id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).send("Earbud not found");
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  };