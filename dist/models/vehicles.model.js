import mongoose from "mongoose";
const vehicleSchema = new mongoose.Schema({
    licensePlate: {
        type: String,
        required: true,
        unique: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    imageVehicle: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
//# sourceMappingURL=vehicles.model.js.map