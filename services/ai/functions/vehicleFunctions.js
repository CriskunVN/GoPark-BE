// functions/vehicleFunctions.js
import Vehicle from "../../../models/vehicles.model.js";

export async function getUserVehicles(userId) {
  try {
    console.log(`🚗 Getting vehicles for user: ${userId}`);
    
    const vehicles = await Vehicle.find({ userId })
      .select('licensePlate capacity imageVehicle createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return {
      vehicles: vehicles.map(vehicle => ({
        _id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        capacity: vehicle.capacity,
        image: vehicle.imageVehicle,
        registeredAt: vehicle.createdAt
      })),
      total: vehicles.length
    };
  } catch (error) {
    console.error('❌ Error in getUserVehicles:', error);
    throw new Error('Không thể lấy thông tin xe');
  }
}

export async function addUserVehicle(userId, vehicleData) {
  try {
    const { licensePlate, capacity, imageVehicle } = vehicleData;
    
    console.log(`➕ Adding vehicle for user: ${userId}`, { licensePlate, capacity });

    // Kiểm tra xe đã tồn tại chưa
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      throw new Error('Biển số xe đã được đăng ký trong hệ thống');
    }

    const vehicle = await Vehicle.create({
      licensePlate: licensePlate.toUpperCase(),
      capacity,
      imageVehicle: imageVehicle || '',
      userId
    });

    return {
      success: true,
      vehicle: {
        _id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        capacity: vehicle.capacity,
        image: vehicle.imageVehicle
      }
    };
  } catch (error) {
    console.error('❌ Error in addUserVehicle:', error);
    throw new Error(`Không thể thêm xe: ${error.message}`);
  }
}

export async function removeUserVehicle(vehicleId, userId) {
  try {
    console.log(`🗑️ Removing vehicle: ${vehicleId} for user: ${userId}`);
    
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
    
    if (!vehicle) {
      throw new Error('Không tìm thấy xe hoặc bạn không có quyền xóa');
    }

    // TODO: Kiểm tra xem xe có đang được sử dụng trong booking active không

    await Vehicle.findByIdAndDelete(vehicleId);

    return {
      success: true,
      message: 'Đã xóa xe thành công',
      vehicleId: vehicle._id
    };
  } catch (error) {
    console.error('❌ Error in removeUserVehicle:', error);
    throw new Error(`Không thể xóa xe: ${error.message}`);
  }
}