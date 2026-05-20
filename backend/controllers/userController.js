const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.role) query.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get single user (admin)
// @route   GET /api/users/:id
// @access  Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

// @desc    Update user role/status (admin)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role, isActive: req.body.isActive },
    { new: true, runValidators: true }
  );
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin users'); }
  await user.deleteOne();
  res.json({ success: true, message: 'User removed' });
});

module.exports = { getUsers, getUser, updateUser, deleteUser };
