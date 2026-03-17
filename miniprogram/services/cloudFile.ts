interface AvatarItem {
  avatar: string;
}

const _urlCache: Record<string, string> = {};

export async function getTempFileURLMap(fileIds: string[] = []): Promise<Record<string, string>> {
  const cloudIds = [...new Set(fileIds.filter((v) => v && v.startsWith('cloud://')))];
  if (!cloudIds.length) return {};

  const result: Record<string, string> = {};
  const needFetch: string[] = [];

  cloudIds.forEach((id) => {
    if (_urlCache[id]) {
      result[id] = _urlCache[id];
    } else {
      needFetch.push(id);
    }
  });

  if (!needFetch.length) return result;

  try {
    const res = await wx.cloud.getTempFileURL({ fileList: needFetch });
    if (res && res.fileList) {
      res.fileList.forEach((f) => {
        if (f && f.fileID && f.tempFileURL) {
          _urlCache[f.fileID] = f.tempFileURL;
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
