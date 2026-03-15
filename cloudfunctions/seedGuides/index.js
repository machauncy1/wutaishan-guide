const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// ===== 10 位导游数据 =====
const guides = [
  {
    name: '魏宏虎',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/wei-honghu.png',
    experienceYear: 12,
    serviceCount: 2300,
    tags: ['寺庙讲解', '朝台路线', '家庭团'],
    phone: '13812340001',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 7,
  },
  {
    name: '韩妮',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/han-ni.png',
    experienceYear: 8,
    serviceCount: 1600,
    tags: ['朝台路线', '老人团', '接站服务'],
    phone: '13812340002',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 2,
  },
  {
    name: '闫嘉豪',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yan-jiahao.png',
    experienceYear: 15,
    serviceCount: 3200,
    tags: ['佛教文化', '寺庙讲解', '文化深度游'],
    phone: '13812340003',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 6,
  },
  {
    name: '郑瑶',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/zheng-yao.jpg',
    experienceYear: 6,
    serviceCount: 980,
    tags: ['摄影路线', '亲子游', '小众寺庙'],
    phone: '13812340004',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 8,
  },
  {
    name: '索晋芳',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/suo-jinfang.png',
    experienceYear: 18,
    serviceCount: 4500,
    tags: ['全程陪同', '朝台路线', '包车服务'],
    phone: '13812340005',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 1,
  },
  {
    name: '王智慧',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/wang-zhihui.jpg',
    experienceYear: 10,
    serviceCount: 1850,
    tags: ['素食推荐', '寺庙讲解', '禅修体验'],
    phone: '13812340006',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 5,
  },
  {
    name: '段紫旋',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/duan-zixuan.jpg',
    experienceYear: 3,
    serviceCount: 420,
    tags: ['年轻活力', '徒步路线', '接站服务'],
    phone: '13812340007',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 9,
  },
  {
    name: '杨树花',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yang-shuhua.png',
    experienceYear: 11,
    serviceCount: 2100,
    tags: ['家庭团', '亲子游', '佛教文化'],
    phone: '13812340008',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 10,
  },
  {
    name: '李艳波',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/li-yanbo.jpg',
    experienceYear: 20,
    serviceCount: 5800,
    tags: ['资深导游', '全程陪同', '定制行程'],
    phone: '13812340009',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 3,
  },
  {
    name: '史小玲',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/shi-xiaoling.png',
    experienceYear: 7,
    serviceCount: 1200,
    tags: ['摄影路线', '星空观测', '小众寺庙'],
    phone: '13812340010',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 4,
  },
  {
    name: '杨振宇',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yang-zhengyu.jpg',
    experienceYear: 5,
    serviceCount: 800,
    tags: ['待补充'],
    phone: '13812340011',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 11,
  },
];

// ===== 全局配置初始数据 =====
const defaultSettings = {
  _id: 'global',
  bannerImage: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/banner-image.png',
  homeTitle: '五台山本地导游',
  homeSubtitle: '寺庙讲解 · 朝台陪同 · 接站包车',
  serviceTotal: 12000,
  contactPhone: '13812340001',
  wechatServiceEnabled: true,
};

exports.main = async (event) => {
  const { force = false } = event;
  const now = Date.now();
  const log = [];

  try {
    // ===== 1. 初始化 guides =====
    // CloudBase 不会自动建集合，需先 createCollection（已存在时会报错，忽略即可）
    try {
      await db.createCollection('guides');
      log.push('guides 集合：已创建');
    } catch (e) {
      log.push('guides 集合：已存在，跳过创建');
    }

    let guidesTotal = 0;
    try {
      const guidesCount = await db.collection('guides').count();
      guidesTotal = guidesCount.total;
    } catch (e) {
      guidesTotal = 0;
    }

    if (guidesTotal > 0 && !force) {
      log.push(`guides：已有 ${guidesTotal} 条数据，跳过（force=true 可强制重置）`);
    } else {
      if (force && guidesTotal > 0) {
        await db.collection('guides')
          .where({ sort: db.command.gte(0) })
          .update({ data: { status: false } });
        log.push('guides：已软删除旧数据');
      }
      for (const guide of guides) {
        await db.collection('guides').add({
          data: { ...guide, createdAt: now, updatedAt: now },
        });
      }
      log.push(`guides：成功插入 ${guides.length} 条`);
    }

    // ===== 2. 初始化 settings =====
    try {
      await db.createCollection('settings');
      log.push('settings 集合：已创建');
    } catch (e) {
      log.push('settings 集合：已存在，跳过创建');
    }

    let settingsExists = false;
    try {
      await db.collection('settings').doc('global').get();
      settingsExists = true;
    } catch (e) {
      settingsExists = false;
    }

    if (settingsExists && !force) {
      log.push('settings：已存在，跳过');
    } else {
      if (settingsExists) {
        await db.collection('settings').doc('global').set({
          data: { ...defaultSettings, updatedAt: now },
        });
        log.push('settings：已更新');
      } else {
        await db.collection('settings').add({
          data: { ...defaultSettings, createdAt: now, updatedAt: now },
        });
        log.push('settings：已创建');
      }
    }

    return { success: true, log };
  } catch (e) {
    return { success: false, errMsg: e.message, log };
  }
};
