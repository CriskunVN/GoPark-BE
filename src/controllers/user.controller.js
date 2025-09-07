import User from '../models/user.model.js';
// [GET] /api/v1/users/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -passwordConfirm'
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Admin tạo user mới
export const createUser = async (req, res) => {
  try {
    const { userName, email, phoneNumber } = req.body;

    if (!userName || !email) {
      return res.status(400).json({
        error: 'Vui lòng nhập tên và email',
      });
    }

    // Set password mặc định
    const defaultPassword = '12345678';

    const newUser = await User.create({
      userName,
      email,
      password: defaultPassword,
      passwordConfirm: defaultPassword,
      phoneNumber: phoneNumber || '',
      role: 'user', // Mặc định là user
    });

    // Ẩn password trong response
    newUser.password = undefined;
    newUser.passwordConfirm = undefined;

    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
};
// Lấy danh sách users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -passwordConfirm');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy thông tin 1 user
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -passwordConfirm'
    );

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật hàm updateUser
export const updateUser = async (req, res) => {
  try {
    const { userName, email, phoneNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { userName, email, phoneNumber },
      { new: true, runValidators: true }
    ).select('-password -passwordConfirm -__v -role');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json({
      id: updatedUser._id,
      userName: updatedUser.userName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật hàm deleteUser
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json({
      success: true,
      message: 'Xóa user thành công',
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
