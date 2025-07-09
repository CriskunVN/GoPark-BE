import Vehicle from "../models/vehicles.model.js";

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicle." });
  }
};

// Create new vehicle
export const createVehicle = async (req, res) => {
  try {
    const { licensePlate, capacity, userId } = req.body;
    const newVehicle = new Vehicle({ licensePlate, capacity, userId });
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to create vehicle.", details: err.message });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { licensePlate, capacity, userId } = req.body;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { licensePlate, capacity, userId },
      { new: true }
    );
    if (!updatedVehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }
    res.status(200).json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to update vehicle.", details: err.message });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }
    res.status(200).json({ message: "Vehicle deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete vehicle." });
  }
};
