import ParkingLot from "../models/parkinglot.model.js";

// [GET] /api/v1/search/city?location=Đà Nẵng
export const searchParkingLots = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || location.trim() === '') {
      return res.status(400).json({ message: 'Location is required' });
    }

    const lots = await ParkingLot.find({
      address: { $regex: location, $options: 'i' },
      isActive: true,
    }).populate('parkingOwner', 'userName email');

    res.status(200).json({ results: lots.length, data: lots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
