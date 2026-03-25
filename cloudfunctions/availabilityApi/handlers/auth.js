const authService = require('../services/authService');

async function handleLogin(body) {
  return authService.login(body.phone, body.password);
}

async function handleGetMe(user) {
  return {
    success: true,
    data: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      guideId: user.guideId || null,
    },
  };
}

async function handleResetPassword(body) {
  return authService.resetPassword(body.phone, body.oldPassword, body.newPassword);
}

module.exports = { handleLogin, handleGetMe, handleResetPassword };
