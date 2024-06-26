import * as smartphoneService from "../../services/smartphone.service.js";

export const getSmartphones = async (req, res) => {
  try {
    const filters = {
      limit: req.query.limit,
      page: req.query.page,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      RAM: req.query.RAM,
      operatingSystem: req.query.operatingSystem,
      capacity: req.query.capacity,
      network: req.query.network,
      mobiletype: req.query.mobiletype,
      refreshRate: req.query.refreshRate,
      cameraType: req.query.cameraType,
      numOfCores: req.query.numOfCores,
      expertScore: req.query.expertScore,
      brands: req.query.brands,
      chipSet: req.query.chipSet,
      graphics: req.query.graphics,
      resolution: req.query.resolution,
      screenSize: req.query.screenSize,
      stores: req.query.stores,
      camera: req.query.camera,
      internalMemory: req.query.internalMemory,
      aspectRatio: req.query.aspectRatio,
      discounts: req.query.discounts,
      display_type: req.query.display_type,
      frontCamera: req.query.frontCamera,
      availability: req.query.availability

    };
    const smartphones = await smartphoneService.getAllSmartphones(filters);
    res.json(smartphones);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// export const getSmartphoneById = async (req, res) => {
//   try {
//     const smartphone = await smartphoneService.getSmartphoneById(req.params.id);
//     if (smartphone) {
//       res.json(smartphone);
//     } else {
//       res.status(404).send("Smartphone not found");
//     }
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// };

export const getSmartphoneById = async (req, res) => {
  try {
    const { smartphone, similarSmartphones } = await smartphoneService.getSmartphoneById(req.params.id);
    if (smartphone) {
      res.json({ smartphone, similarSmartphones });
    } else {
      res.status(404).send("Smartphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Modify this in your smartphoneController.js



export const createSmartphone = async (req, res) => {
  try {
    const smartphone = await smartphoneService.createSmartphone(req.body);
    res.status(201).json(smartphone);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateSmartphone = async (req, res) => {
  try {
    const updatedSmartphone = await smartphoneService.updateSmartphone(
      req.params.id,
      req.body
    );
    if (updatedSmartphone) {
      res.json(updatedSmartphone);
    } else {
      res.status(404).send("Smartphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteSmartphone = async (req, res) => {
  try {
    const result = await smartphoneService.deleteSmartphone(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Smartphone not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
