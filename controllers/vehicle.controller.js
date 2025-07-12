import Vehicle from "../models/vehicles.model.js";

// [GET] /api/v1/vehicles/my-vehicles
export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.status(200).json({ status: "success", data: vehicles });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to fetch your vehicles." });
  }
};

// [POST] /api/v1/vehicles
export const createVehicle = async (req, res) => {
  try {
    const { licensePlate, capacity, imageVehicle } = req.body;

    const newVehicle = new Vehicle({
      licensePlate,
      capacity,
      userId: req.user.id,
      imageVehicle: imageVehicle || "",
    });

    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    if (err.code === 11000) {
      // ⚠️ Duplicate key error
      return res.status(400).json({
        error: "A vehicle with this license plate already exists.",
        field: "licensePlate",
      });
    }

    console.error("❌ Error creating vehicle:", err);
    res.status(400).json({ error: "Failed to create vehicle." });
  }
};

// [PUT] /api/v1/vehicles/:id
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { licensePlate, capacity, imageVehicle } = req.body;

    // Tìm xe theo ID và kiểm tra quyền sở hữu
    const vehicle = await Vehicle.findOne({ _id: id, userId: req.user.id });

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found or you do not have permission to update it.",
      });
    }

    // Cập nhật thông tin xe
    vehicle.licensePlate = licensePlate || vehicle.licensePlate;
    vehicle.capacity = capacity || vehicle.capacity;
    vehicle.imageVehicle = imageVehicle !== undefined ? imageVehicle : vehicle.imageVehicle;

    await vehicle.save();
    res.status(200).json({ status: "success", data: vehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: "A vehicle with this license plate already exists.",
        field: "licensePlate",
      });
    }

    console.error("❌ Error updating vehicle:", err);
    res.status(400).json({ error: "Failed to update vehicle." });
  }
};

// [DELETE] /api/v1/vehicles/:id
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm và xóa xe theo ID và kiểm tra quyền sở hữu
    const vehicle = await Vehicle.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!vehicle) {
      return res.status(404).json({
        error: "Vehicle not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({ status: "success", message: "Vehicle deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting vehicle:", err);
    res.status(400).json({ error: "Failed to delete vehicle." });
  }
};