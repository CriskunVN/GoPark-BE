import Vehicle from "../models/vehicles.model.js";
// [GET] /api/v1/vehicles/my-vehicles
export const getMyVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        res.status(200).json({ status: "success", data: vehicles });
    }
    catch (err) {
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
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                error: "A vehicle with this license plate already exists.",
                field: "licensePlate",
            });
        }
        res.status(400).json({ error: "Failed to create vehicle." });
    }
};
// [PUT] /api/v1/vehicles/:id
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { licensePlate, capacity, imageVehicle } = req.body;
        const vehicle = await Vehicle.findOne({ _id: id, userId: req.user.id });
        if (!vehicle) {
            return res.status(404).json({
                error: "Vehicle not found or you do not have permission to update it.",
            });
        }
        vehicle.licensePlate = licensePlate || vehicle.licensePlate;
        vehicle.capacity = capacity || vehicle.capacity;
        vehicle.imageVehicle = imageVehicle !== undefined ? imageVehicle : vehicle.imageVehicle;
        await vehicle.save();
        res.status(200).json({ status: "success", data: vehicle });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                error: "A vehicle with this license plate already exists.",
                field: "licensePlate",
            });
        }
        res.status(400).json({ error: "Failed to update vehicle." });
    }
};
// [DELETE] /api/v1/vehicles/:id
export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!vehicle) {
            return res.status(404).json({
                error: "Vehicle not found or you do not have permission to delete it.",
            });
        }
        res.status(200).json({ status: "success", message: "Vehicle deleted successfully." });
    }
    catch (err) {
        res.status(400).json({ error: "Failed to delete vehicle." });
    }
};
// [GET] /api/v1/vehicles/by-user/:userId
export const getVehiclesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const vehicles = await Vehicle.find({ userId });
        if (!vehicles) {
            return res.status(404).json({ error: "No vehicles found for this user." });
        }
        res.status(200).json(vehicles);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch vehicles." });
    }
};
// [POST] /api/v1/vehicles/for-user/:userId
export const addVehicleForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { licensePlate, capacity, imageVehicle } = req.body;
        const newVehicle = new Vehicle({
            licensePlate,
            capacity,
            imageVehicle: imageVehicle || "",
            userId,
        });
        await newVehicle.save();
        res.status(201).json({ status: "success", data: newVehicle });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                error: "A vehicle with this license plate already exists.",
                field: "licensePlate",
            });
        }
        res.status(400).json({ error: "Failed to create vehicle." });
    }
};
//# sourceMappingURL=vehicle.controller.js.map