import User from '../models/user.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  cookieOptions,
} from '../config/jwt.js';

const payload = (user) => ({ id: user._id, role: user.role });

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, role, company } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: 'fullName, email and password are required' });
    if (role === 'recruiter' && !company)
      return res.status(400).json({ success: false, message: 'Company name is required for recruiters' });

    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ fullName, email, password, role, company });
    const accessToken  = generateAccessToken(payload(user));
    const refreshToken = generateRefreshToken(payload(user));
    user.refreshToken  = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.status(201).json({ success: true, accessToken, user: user.toProfile() });
  } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated' });

    const accessToken  = generateAccessToken(payload(user));
    const refreshToken = generateRefreshToken(payload(user));
    user.refreshToken  = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.json({ success: true, accessToken, user: user.toProfile() });
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({ success: false, message: 'No refresh token' });

    let decoded;
    try { decoded = verifyRefreshToken(token); }
    catch { return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' }); }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      if (user) { user.refreshToken = null; await user.save(); }
      return res.status(401).json({ success: false, message: 'Token reuse detected' });
    }

    const newAccess  = generateAccessToken(payload(user));
    const newRefresh = generateRefreshToken(payload(user));
    user.refreshToken = newRefresh;
    await user.save();

    res.cookie('refreshToken', newRefresh, cookieOptions);
    return res.json({ success: true, accessToken: newAccess });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
      if (user) { user.refreshToken = null; await user.save(); }
    }
    res.clearCookie('refreshToken', cookieOptions);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = (req, res) =>
  res.json({ success: true, user: req.user });
