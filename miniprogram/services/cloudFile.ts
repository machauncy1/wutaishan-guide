interface AvatarItem {
  avatar: string;
}

interface UrlCacheEntry {
  url: string;
  timestamp: number;
}

const _urlCache: Record<string, UrlCacheEntry> = {};
const URL_CACHE_TTL = 90 * 60 * 1000; // 90 分钟（临时 URL 有效期通常为 2 小时）

export async function getTempFileURLMap(fileIds: string[] = []): Promise<Record<string, string>> {
  const cloudIds = [...new Set(fileIds.filter((v) => v && v.startsWith('cloud://')))];
  if (!cloudIds.length) return {};

  const now = Date.now();
  const result: Record<string, string> = {};
  const needFetch: string[] = [];

  cloudIds.forEach((id) => {
    const entry = _urlCache[id];
    if (entry && now - entry.timestamp < URL_CACHE_TTL) {
      result[id] = entry.url;
    } else {
      delete _urlCache[id];
      needFetch.push(id);
    }
  });

  if (!needFetch.length) return result;

  try {
    const res = await wx.cloud.getTempFileURL({ fileList: needFetch });
    if (res && res.fileList) {
      res.fileList.forEach((f) => {
        if (f && f.fileID && f.tempFileURL) {
          _urlCache[f.fileID] = { url: f.tempFileURL, timestamp: Date.now() };
          result[f.fileID] = f.tempFileURL;
        }
      });
    }
  } catch (e) {
    console.warn('[cloudFile] getTempFileURL 失败:', e);
  }

  return result;
}

export async function resolveAvatars<T extends AvatarItem>(items: T[]): Promise<T[]> {
  if (!items || !items.length) return items || [];
  const urlMap = await getTempFileURLMap(items.map((item) => item.avatar));
  if (!Object.keys(urlMap).length) return items;
  return items.map((item) =>
    urlMap[item.avatar] ? { ...item, avatar: urlMap[item.avatar] } : item,
  );
}
