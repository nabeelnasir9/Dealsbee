import * as powerBankService from "../../services/powerbank.service.js";

export const getPowerBanks = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      capacity: req.query.capacity,
      batteryType: req.query.batteryType,
      connectorType: req.query.connectorType,
      bodyMaterial: req.query.bodyMaterial,
      weight: req.query.weight,
      color: req.query.color,
      overChargeProtection: req.query.overChargeProtection,
      overDischargeProtection: req.query.overDischargeProtection,
      shortCircuitProtection: req.query.shortCircuitProtection,
      ledIndicators: req.query.ledIndicators,
      overCurrentProtection: req.query.overCurrentProtection,
      temperatureProtections: req.query.temperatureProtections,
      fastCharge: req.query.fastCharge,
      ledFlashlight: req.query.ledFlashlight,
      brands: req.query.brands,
      stores: req.query.stores,
      expertScore: req.query.expertScore,
      availability: req.query.availability,
      discounts: req.query.discounts,
    };
    const powerBanks = await powerBankService.getAllPowerBanks(filters);
    res.json(powerBanks);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getPowerBankById = async (req, res) => {
  try {
    const { powerBank, similarPowerBanks } = await powerBankService.getPowerBankById(req.params.id);
    if (powerBank) {
      res.json({ powerBank, similarPowerBanks });
    } else {
      res.status(404).send("Power Bank not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createPowerBank = async (req, res) => {
  try {
    const powerBank = await powerBankService.createPowerBank(req.body);
    res.status(201).json(powerBank);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updatePowerBank = async (req, res) => {
  try {
    const updatedPowerBank = await powerBankService.updatePowerBank(req.params.id, req.body);
    if (updatedPowerBank) {
      res.json(updatedPowerBank);
    } else {
      res.status(404).send("Power Bank not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deletePowerBank = async (req, res) => {
  try {
    const result = await powerBankService.deletePowerBank(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Power Bank not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
