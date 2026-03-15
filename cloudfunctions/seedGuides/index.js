const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// ===== 10 位导游数据 =====
const guides = [
  {
    name: '魏宏虎',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/wei-honghu.png',
    gender: 'male',
    experienceYear: 12,
    serviceCount: 2300,
    tags: ['寺庙讲解', '朝台路线', '家庭团'],
    description: '待补充',
    phone: '13812340001',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 7,
  },
  {
    name: '韩妮',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/han-ni.png',
    gender: 'female',
    experienceYear: 8,
    serviceCount: 1600,
    tags: ['朝台路线', '老人团', '接站服务'],
    description: '待补充',
    phone: '13812340002',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 2,
  },
  {
    name: '闫嘉豪',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yan-jiahao.png',
    gender: 'male',
    experienceYear: 15,
    serviceCount: 3200,
    tags: ['佛教文化', '寺庙讲解', '文化深度游'],
    description: '待补充',
    phone: '13812340003',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 6,
  },
  {
    name: '郑瑶',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/zheng-yao.jpg',
    gender: 'female',
    experienceYear: 6,
    serviceCount: 980,
    tags: ['摄影路线', '亲子游', '小众寺庙'],
    description: '待补充',
    phone: '13812340004',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 8,
  },
  {
    name: '索晋芳',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/suo-jinfang.png',
    gender: 'female',
    experienceYear: 18,
    serviceCount: 4500,
    tags: ['全程陪同', '朝台路线', '包车服务'],
    description: '待补充',
    phone: '13812340005',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 1,
  },
  {
    name: '王智慧',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/wang-zhihui.jpg',
    gender: 'female',
    experienceYear: 10,
    serviceCount: 1850,
    tags: ['素食推荐', '寺庙讲解', '禅修体验'],
    description: '待补充',
    phone: '13812340006',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 5,
  },
  {
    name: '段紫旋',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/duan-zixuan.jpg',
    gender: 'female',
    experienceYear: 3,
    serviceCount: 420,
    tags: ['年轻活力', '徒步路线', '接站服务'],
    description: '待补充',
    phone: '13812340007',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 9,
  },
  {
    name: '杨树花',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yang-shuhua.png',
    gender: 'female',
    experienceYear: 11,
    serviceCount: 2100,
    tags: ['家庭团', '亲子游', '佛教文化'],
    description: '待补充',
    phone: '13812340008',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 10,
  },
  {
    name: '李艳波',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/li-yanbo.jpg',
    gender: 'female',
    experienceYear: 20,
    serviceCount: 5800,
    tags: ['资深导游', '全程陪同', '定制行程'],
    description: '待补充',
    phone: '13812340009',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 3,
  },
  {
    name: '史小玲',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/shi-xiaoling.png',
    gender: 'female',
    experienceYear: 7,
    serviceCount: 1200,
    tags: ['摄影路线', '星空观测', '小众寺庙'],
    description: '待补充',
    phone: '13812340010',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 4,
  },
  {
    name: '杨振宇',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yang-zhengyu.jpg',
    gender: 'male',
    experienceYear: 5,
    serviceCount: 800,
    tags: ['待补充'],
    description: '待补充',
    phone: '13812340011',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 11,
  },
];

// ===== 全局配置初始数据 =====
const defaultSettings = {
  _id: 'global',
  travelAgencyName: '五台山XX旅行社',
  logo: '',
  bannerImage: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/banner-image.png',  // 文件名无中文，可直接使用
  homeTitle: '五台山本地导游',
  homeSubtitle: '寺庙讲解 · 朝台陪同 · 接站包车',
  introText: '本地持证导游 · 已服务游客12000+',
  serviceTotal: 12000,
  contactPhone: '13812340001',
  aboutText:
    '五台山XX旅行社成立于2010年，扎根五台山本地超过10年，是五台山地区专业导游服务团队。团队全部成员均为本地持证导游，熟悉山区地形、气候与寺庙文化，已累计服务游客超12000人次，获得广大游客的一致好评。',
  licenseImages: [],
  address: '山西省忻州市五台县五台山风景区',
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
