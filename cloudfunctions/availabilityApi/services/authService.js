const crypto = require('crypto');
const userRepo = require('../repositories/userRepo');
const sessionRepo = require('../repositories/sessionRepo');

const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function generateToken() {
  return crypto.randomUUID();
}

async function login(phone, password) {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return { success: false, errMsg: '请输入正确的手机号' };
  }

  const user = await userRepo.findByPhone(phone);
  if (!user) {
    return { success: false, errMsg: '该手机号未注册' };
  }

  const expected = user.password || phone.slice(-4);
  if (password !== expected) {
    return { success: false, errMsg: '密码错误' };
  }

  const token = generateToken();
  const session = {
    _id: token,
    userId: user._id,
    role: user.role,
    expireAt: Date.now() + SESSION_TTL_MS,
    isRevoked: false,
  };

  await sessionRepo.create(session);

  return {
    success: true,
    data: { token, role: user.role, name: user.name },
  };
}

async function authenticate(token) {
  if (!token) return null;

  const session = await sessionRepo.findByToken(token);
  if (!session) return null;
  if (session.isRevoked) return null;
  if (session.expireAt < Date.now()) return null;

  const user = await userRepo.findById(session.userId);
  if (!user) return null;

  return user;
}

module.exports = { login, authenticate };
