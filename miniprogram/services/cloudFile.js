// services/cloudFile.js

// 内存缓存：fileID -> tempFileURL，避免重复调用 API
const _urlCache = {};

/**
 * 批量将 cloud:// 文件ID 转换为临时 HTTPS 链接（带内存缓存）
 * 转换失败不会抛异常，返回空映射，不阻塞主流程
 * @param {string[]} fileIds - cloud:// 文件ID 数组
 * @returns {Promise<Object>} fileID -> tempFileURL 的映射
 */
export async function getTempFileURLMap(fileIds = []) {
  const cloudIds = [
    ...new Set(
      (Array.isArray(fileIds) ? fileIds : []).filter((v) => v && v.startsWith('cloud://')),
    ),
  ];
  if (!cloudIds.length) return {};

  const result = {};
  const needFetch = [];

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
