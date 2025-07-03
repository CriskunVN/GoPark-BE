import ParkingLot from '../models/parkinglot.model.js';

export const searchParkingLots = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || location.trim() === '') {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Tìm theo tên gần giống (index text đã được tạo trên trường `name`)
    const lots = await ParkingLot.find({
      name: { $regex: location, $options: 'i' },
      isActive: true,
    }).populate('parkingOwner', 'userName email');

    res.status(200).json({ results: lots.length, data: lots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
