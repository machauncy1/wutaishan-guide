import { getGuideDetail } from './guide';

interface ICacheEntry {
  data: IGuideDetail;
  timestamp: number;
}

const _cache: Record<string, ICacheEntry> = {};
const _pending: Record<string, Promise<void>> = {};
const CACHE_TTL = 5 * 60 * 1000;

export function prefetchGuide(guideId: string): void {
  if (!guideId) return;
  if (_cache[guideId] && Date.now() - _cache[guideId].timestamp < CACHE_TTL) return;
  if (guideId in _pending) return;

  const p = getGuideDetail(guideId)
    .then((res) => {
      const data = res.data as IGuideDetail;
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

export function getCachedGuide(guideId: string): IGuideDetail | null {
  const entry = _cache[guideId];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete _cache[guideId];
    return null;
  }
  return entry.data;
}
