const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, employee_id, alternate_email, phone } = req.body;
    
    if (!employee_id || !alternate_email || !phone) {
      return res.status(400).json({ message: 'Employee ID, Alternate Email, and Phone are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid primary email format' });
    }
    if (alternate_email && !emailRegex.test(alternate_email)) {
      return res.status(400).json({ message: 'Invalid alternate email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Hardcode public self-registration to 'user' role to prevent Privilege Escalation
    const assignedRole = 'user';

    await User.create({
      full_name,
      email,
      password_hash,
      role: assignedRole,
      employee_id,
      alternate_email,
      phone
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const access_token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    const userObj = user.toJSON();
    delete userObj.password_hash;

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      access_token,
      user: userObj
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userObj = user.toJSON();
    delete userObj.password_hash;
    res.status(200).json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    if (process.env.MAIL_USERNAME) {
      await transporter.sendMail({
        from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
        to: user.email,
        subject: 'Password Reset',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link expires in 15 minutes.</p>`
      });
    }

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, employee_id, alternate_email, phone, newPassword, currentPassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: 'Invalid current password' });
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
    }

    if (full_name) user.full_name = full_name;
    if (employee_id) user.employee_id = employee_id;
    if (alternate_email) user.alternate_email = alternate_email;
    if (phone) user.phone = phone;

    await user.save();

    const userObj = user.toJSON();
    delete userObj.password_hash;
    res.status(200).json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
