const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

async function resolveFileIDs(fileIDs) {
  const ids = fileIDs.filter(Boolean);
  if (!ids.length) return {};
  const res = await cloud.getTempFileURL({ fileList: ids });
  const map = {};
  res.fileList.forEach(({ fileID, tempFileURL }) => {
    map[fileID] = tempFileURL;
  });
  return map;
}

exports.main = async () => {
  try {
    const res = await db
      .collection('guides')
      .where({ status: true })
      .orderBy('sort', 'asc')
      .field({
        avatar: true,
        name: true,
        gender: true,
        experienceYear: true,
        serviceCount: true,
        tags: true,
        agencyName: true,
        licenseText: true,
      })
      .get();

    const fileIDs = res.data.map(g => g.avatar);
    const urlMap = await resolveFileIDs(fileIDs);

    const data = res.data.map(g => ({
      ...g,
      avatar: urlMap[g.avatar] || g.avatar,
    }));

    return { success: true, data };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
