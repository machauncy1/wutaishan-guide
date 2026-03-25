const authService = require('./services/authService');
const { handleLogin, handleGetMe, handleResetPassword } = require('./handlers/auth');
const {
  handleGetMyAvailability,
  handleSetAvailability,
  handleGetDailyGuides,
  handleUpdateGuideStatus,
} = require('./handlers/availability');

// Route definitions: [method, path, handler, requiresAuth]
const routes = [
  ['POST', '/login', handleLogin, false],
  ['POST', '/reset-password', handleResetPassword, false],
  ['GET', '/me', handleGetMe, true],
  ['GET', '/my-availability', handleGetMyAvailability, true],
  ['POST', '/set-availability', handleSetAvailability, true],
  ['GET', '/daily-guides', handleGetDailyGuides, true],
  ['POST', '/update-status', handleUpdateGuideStatus, true],
];

function parseBody(event) {
  if (!event.body) return {};
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (_e) {
    return {};
  }
}

function parseQuery(event) {
  return event.queryStringParameters || {};
}

function extractToken(event) {
  const auth = (event.headers || {}).authorization || (event.headers || {}).Authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return '';
}

function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
    body: JSON.stringify(data),
  };
}

exports.main = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return response(204, '');
  }

  const method = (event.httpMethod || '').toUpperCase();
  const path = event.path || '';

  // Match route
  const matched = routes.find((r) => r[0] === method && path.endsWith(r[1]));
  if (!matched) {
    return response(404, { success: false, errMsg: '接口不存在' });
  }

  const [, , handler, requiresAuth] = matched;

  try {
    // Auth check
    let user = null;
    if (requiresAuth) {
      const token = extractToken(event);
      user = await authService.authenticate(token);
      if (!user) {
        return response(401, { success: false, errMsg: '未登录或登录已过期' });
      }
    }

    // Call handler
    const body = parseBody(event);
    const query = parseQuery(event);
    let result;

    if (!requiresAuth) {
      // login: handler(body)
      result = await handler(body);
    } else if (method === 'GET') {
      // GET: handler(user, query)
      result = await handler(user, query);
    } else {
      // POST: handler(user, body)
      result = await handler(user, body);
    }

    return response(result.success === false ? 400 : 200, result);
  } catch (e) {
    console.error('avail-api error:', e);
    return response(500, { success: false, errMsg: '服务器内部错误' });
  }
};
