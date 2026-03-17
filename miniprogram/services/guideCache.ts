import { getGuideDetail } from './guide';

interface CacheEntry {
  data: GuideDetail;
  timestamp: number;
}

const _cache: Record<string, CacheEntry> = {};
const _pending: Record<string, Promise<void>> = {};
const CACHE_TTL = 5 * 60 * 1000;

export function prefetchGuide(guideId: string): void {
  if (!guideId) return;
  if (_cache[guideId] && Date.now() - _cache[guideId].timestamp < CACHE_TTL) return;
  if (guideId in _pending) return;

  const p = getGuideDetail(guideId)
    .then((res) => {
      const data = res.data as GuideDetail;
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

export function getCachedGuide(guideId: string): GuideDetail | null {
  const entry = _cache[guideId];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete _cache[guideId];
    return null;
  }
  return entry.data;
}
