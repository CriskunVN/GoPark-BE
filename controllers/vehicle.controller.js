import Vehicle from "../models/vehicles.model.js";

// ✅ Admin: Get vehicles by userId
export const getVehiclesByUser = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.params.userId });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles for this user." });
  }
};

// ✅ Admin: Create vehicle for specific user
export const createVehicleForUser = async (req, res) => {
  try {
    const { licensePlate, capacity, imageVehicle } = req.body;
    const userId = req.params.userId;

    const newVehicle = new Vehicle({
      licensePlate,
      capacity,
      userId,
      imageVehicle: imageVehicle || ""
    });

    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to create vehicle.", details: err.message });
  }
};

// Lấy xe của user hiện tại (qua token)
export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your vehicles." });
  }
};

// Các hàm khác giữ nguyên
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found." });
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicle." });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { licensePlate, capacity, imageVehicle } = req.body;

    const newVehicle = new Vehicle({
      licensePlate,
      capacity,
      userId: req.user.id,
      imageVehicle: imageVehicle || ""
    });

    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to create vehicle.", details: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found or not owned by you." });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        licensePlate: req.body.licensePlate,
        capacity: req.body.capacity,
        imageVehicle: req.body.imageVehicle || vehicle.imageVehicle
      },
      { new: true }
    );

    res.status(200).json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to update vehicle." });
  }
};

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
