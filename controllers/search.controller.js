import ParkingLot from '../models/parkinglot.model.js';

export const searchParkingLots = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || location.trim() === '') {
      return res.status(400).json({ message: 'Location is required' });
    }

    const lots = await ParkingLot.find({
      $or: [
        { address: { $regex: location, $options: 'i' } },
        // { name: { $regex: location, $options: 'i' } }
      ],
      isActive: true,
    }).populate('parkingOwner', 'userName email');

    res.status(200).json({ results: lots.length, data: lots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
