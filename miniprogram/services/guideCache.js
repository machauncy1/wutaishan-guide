// services/guideCache.js
// 导游详情预加载缓存

import { getGuideDetail } from './guide';

const _cache = {};       // guideId -> { data, timestamp }
const _pending = {};     // guideId -> Promise（防止重复请求）
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟有效期

/**
 * 预加载导游详情（静默，不影响主流程）
 */
export function prefetchGuide(guideId) {
  if (!guideId) return;
  // 缓存未过期，跳过
  if (_cache[guideId] && Date.now() - _cache[guideId].timestamp < CACHE_TTL) return;
  // 已有请求在飞，跳过
  if (_pending[guideId]) return;

  const p = getGuideDetail(guideId)
    .then((res) => {
      const data = res.data;
      if (data) {
        _cache[guideId] = { data, timestamp: Date.now() };
      }
    })
    .catch(() => {})
    .finally(() => {
      delete _pending[guideId];
    });

  _pending[guideId] = p;
}

/**
 * 读取缓存的导游详情（命中返回数据，未命中返回 null）
 */
export function getCachedGuide(guideId) {
  const entry = _cache[guideId];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete _cache[guideId];
    return null;
  }
  return entry.data;
}
