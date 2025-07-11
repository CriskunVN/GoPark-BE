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

export const searchParkingNearMe = async (req, res) => {
  try {
    const { lat, lng, radius } = req.params;
    if (!lat || !lng || !radius) {
      return res
        .status(400)
        .json({ message: 'Latitude, longitude and radius are required' });
    }

    const lots = await ParkingLot.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            parseFloat(radius) / 6378.1,
          ],
        },
      },
      isActive: true,
    });

    res.status(200).json({ results: lots.length, data: lots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
