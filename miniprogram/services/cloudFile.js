// services/cloudFile.js

/**
 * 批量将 cloud:// 文件ID 转换为临时 HTTPS 链接
 * 转换失败不会抛异常，返回空映射，不阻塞主流程
 * @param {string[]} fileIds - cloud:// 文件ID 数组
 * @returns {Promise<Object>} fileID -> tempFileURL 的映射
 */
export async function getTempFileURLMap(fileIds = []) {
  const cloudIds = [...new Set(
    (Array.isArray(fileIds) ? fileIds : []).filter((v) => v && v.startsWith('cloud://')),
  )];
  if (!cloudIds.length) return {};

  try {
    const res = await wx.cloud.getTempFileURL({ fileList: cloudIds });
    const map = {};
    if (res && res.fileList) {
      res.fileList.forEach((f) => {
        if (f && f.fileID && f.tempFileURL) {
          map[f.fileID] = f.tempFileURL;
        }
      });
    }
    return map;
  } catch (e) {
    console.warn('[cloudFile] getTempFileURL 失败，使用原始文件ID:', e);
    return {};
  }
}
