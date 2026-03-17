const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// ===== 11 位导游数据 =====
// reviews 格式：nickname（微信风格带星号）、rating、tripType、date，无 content
const guides = [
  {
    name: '魏宏虎',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/wei-honghu.jpg',
    experienceYear: 8,
    serviceCount: 1500,
    tags: ['包车服务', '寺庙讲解', '家庭游'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 7,
    reviews: [
      { nickname: 'A**e', rating: 5, tripType: '公司团建', date: '2025-08-16' },
      { nickname: '小**子', rating: 5, tripType: '周末游', date: '2025-07-26' },
      { nickname: '云**飞', rating: 5, tripType: '独自出行', date: '2025-06-28' },
      { nickname: 'L**y', rating: 5, tripType: '情侣出行', date: '2025-06-15' },
      { nickname: '阳**光', rating: 5, tripType: '朋友结伴', date: '2025-06-01' },
      { nickname: '风**起', rating: 5, tripType: '带父母', date: '2025-03-22' },
      { nickname: 'M**k', rating: 4, tripType: '家庭出行', date: '2025-02-15' },
    ],
  },
  {
    name: '韩妮',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/han-ni.jpg',
    experienceYear: 8,
    serviceCount: 1500,
    tags: ['佛教文化', '许愿还愿', '司导服务'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 2,
    reviews: [
      { nickname: '静**水', rating: 5, tripType: '带父母', date: '2025-10-01' },
      { nickname: '大**哥', rating: 5, tripType: '公司团建', date: '2025-09-08' },
      { nickname: 'S**n', rating: 5, tripType: '周末游', date: '2025-08-03' },
      { nickname: '花**开', rating: 5, tripType: '许愿祈福', date: '2025-06-15' },
      { nickname: '天**蓝', rating: 5, tripType: '家庭出行', date: '2025-05-18' },
      { nickname: 'J**e', rating: 5, tripType: '朋友结伴', date: '2024-12-30' },
    ],
  },
  {
    name: '闫嘉豪',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yan-jiahao.jpg',
    experienceYear: 10,
    serviceCount: 2000,
    tags: ['深度礼佛', '司导服务', '寺庙讲解'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 6,
    reviews: [
      { nickname: '心**然', rating: 5, tripType: '独自出行', date: '2025-08-03' },
      { nickname: '雨**后', rating: 5, tripType: '许愿祈福', date: '2025-07-26' },
      { nickname: 'W**g', rating: 5, tripType: '公司团建', date: '2025-06-15' },
      { nickname: '星**辰', rating: 5, tripType: '朋友结伴', date: '2025-03-22' },
      { nickname: '悠**然', rating: 5, tripType: '周末游', date: '2024-12-30' },
      { nickname: 'R**n', rating: 5, tripType: '带父母', date: '2024-11-20' },
      { nickname: '梦**圆', rating: 4, tripType: '家庭出行', date: '2024-11-03' },
    ],
  },
  {
    name: '郑瑶',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/zheng-yao.jpg',
    experienceYear: 7,
    serviceCount: 1200,
    tags: ['行程规划', '亲子游', '定制路线'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 8,
    reviews: [
      { nickname: '清**风', rating: 5, tripType: '许愿祈福', date: '2025-10-01' },
      { nickname: 'K**y', rating: 5, tripType: '公司团建', date: '2025-06-28' },
      { nickname: '暖**阳', rating: 5, tripType: '情侣出行', date: '2025-05-03' },
      { nickname: 'T**a', rating: 5, tripType: '带父母', date: '2025-04-20' },
      { nickname: '小**鱼', rating: 4, tripType: '周末游', date: '2024-11-03' },
    ],
  },
  {
    name: '索晋芳',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/suo-jinfang.jpg',
    experienceYear: 9,
    serviceCount: 1800,
    tags: ['全程陪同', '深度礼佛', '行程规划'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 1,
    reviews: [
      { nickname: 'D**d', rating: 5, tripType: '周末游', date: '2025-10-01' },
      { nickname: '安**好', rating: 5, tripType: '家庭出行', date: '2025-08-22' },
      { nickname: '思**远', rating: 5, tripType: '情侣出行', date: '2025-08-16' },
      { nickname: 'H**n', rating: 5, tripType: '带父母', date: '2025-07-26' },
      { nickname: '乐**天', rating: 5, tripType: '独自出行', date: '2025-07-12' },
      { nickname: '晓**月', rating: 5, tripType: '朋友结伴', date: '2024-12-30' },
    ],
  },
  {
    name: '王志慧',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/wang-zhihui.jpg',
    experienceYear: 9,
    serviceCount: 1700,
    tags: ['素食推荐', '司导服务', '佛教文化'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 5,
    reviews: [
      { nickname: 'C**y', rating: 5, tripType: '公司团建', date: '2025-09-15' },
      { nickname: '微**笑', rating: 5, tripType: '家庭出行', date: '2025-07-12' },
      { nickname: 'Z**o', rating: 5, tripType: '情侣出行', date: '2025-06-28' },
      { nickname: '如**意', rating: 5, tripType: '独自出行', date: '2025-04-05' },
      { nickname: '朝**阳', rating: 5, tripType: '带父母', date: '2025-03-08' },
      { nickname: 'X**n', rating: 5, tripType: '周末游', date: '2025-02-15' },
      { nickname: '平**安', rating: 4, tripType: '朋友结伴', date: '2024-12-15' },
    ],
  },
  {
    name: '段紫旋',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/duan-zixuan.jpg',
    experienceYear: 8,
    serviceCount: 1400,
    tags: ['年轻活力', '徒步路线', '双人游'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 9,
    reviews: [
      { nickname: '逐**梦', rating: 5, tripType: '朋友结伴', date: '2025-10-01' },
      { nickname: 'B**o', rating: 5, tripType: '公司团建', date: '2025-09-28' },
      { nickname: '若**水', rating: 5, tripType: '情侣出行', date: '2025-08-16' },
      { nickname: 'Y**i', rating: 5, tripType: '周末游', date: '2025-07-26' },
      { nickname: '念**念', rating: 4, tripType: '许愿祈福', date: '2024-12-15' },
    ],
  },
  {
    name: '杨树花',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yang-shuhua.jpg',
    experienceYear: 13,
    serviceCount: 2800,
    tags: ['家庭游', '亲子游', '许愿还愿'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 10,
    reviews: [
      { nickname: '向**阳', rating: 5, tripType: '情侣出行', date: '2025-10-05' },
      { nickname: 'F**g', rating: 5, tripType: '独自出行', date: '2025-07-12' },
      { nickname: '自**在', rating: 5, tripType: '朋友结伴', date: '2025-05-18' },
      { nickname: '慕**白', rating: 5, tripType: '家庭出行', date: '2025-03-22' },
      { nickname: 'N**l', rating: 5, tripType: '许愿祈福', date: '2024-12-15' },
      { nickname: '初**见', rating: 4, tripType: '周末游', date: '2024-11-20' },
    ],
  },
  {
    name: '李艳波',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/li-yanbo.jpg',
    experienceYear: 8,
    serviceCount: 1500,
    tags: ['全程陪同', '包车服务', '定制路线'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 3,
    reviews: [
      { nickname: 'G**o', rating: 5, tripType: '朋友结伴', date: '2025-10-05' },
      { nickname: '望**山', rating: 5, tripType: '独自出行', date: '2025-08-16' },
      { nickname: '归**来', rating: 5, tripType: '家庭出行', date: '2025-07-26' },
      { nickname: 'P**r', rating: 5, tripType: '许愿祈福', date: '2025-07-12' },
      { nickname: '淡**然', rating: 5, tripType: '周末游', date: '2024-11-20' },
    ],
  },
  {
    name: '史小玲',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/shi-xiaoling.jpg',
    experienceYear: 13,
    serviceCount: 3000,
    tags: ['徒步路线', '文化深度游', '定制路线'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 4,
    reviews: [
      { nickname: '拾**光', rating: 5, tripType: '许愿祈福', date: '2025-10-05' },
      { nickname: 'E**a', rating: 5, tripType: '独自出行', date: '2025-09-28' },
      { nickname: '知**秋', rating: 5, tripType: '带父母', date: '2025-09-15' },
      { nickname: 'V**n', rating: 5, tripType: '周末游', date: '2025-07-26' },
      { nickname: '长**安', rating: 5, tripType: '家庭出行', date: '2025-06-28' },
      { nickname: '听**风', rating: 5, tripType: '朋友结伴', date: '2025-03-08' },
      { nickname: 'Q**n', rating: 4, tripType: '情侣出行', date: '2025-01-25' },
    ],
  },
  {
    name: '杨振宇',
    avatar: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/guides/yang-zhengyu.jpg',
    experienceYear: 13,
    serviceCount: 2900,
    tags: ['全程陪同', '司导服务', '徒步路线'],
    phone: '18834032968',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 11,
    reviews: [
      { nickname: '素**心', rating: 5, tripType: '带父母', date: '2025-06-15' },
      { nickname: '半**夏', rating: 5, tripType: '公司团建', date: '2025-04-20' },
      { nickname: 'I**s', rating: 5, tripType: '家庭出行', date: '2025-03-08' },
      { nickname: '观**海', rating: 5, tripType: '许愿祈福', date: '2024-12-15' },
      { nickname: 'U**e', rating: 4, tripType: '情侣出行', date: '2024-11-03' },
    ],
  },
];

// ===== 全局配置初始数据 =====
const defaultSettings = {
  _id: 'global',
  bannerImage: 'cloud://cloud1-7g44gn8c3a08ced5.636c-cloud1-7g44gn8c3a08ced5-1411386376/banner-image.jpg',
  homeTitle: '五台山当地导游',
  homeSubtitle: '专业讲解 · 行程规划 · 定制化包车游',
  serviceTotal: 21300,
  contactPhone: '18834032968',
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
        // 云数据库 remove 每次最多删 20 条，需循环删除
        let deleted = 0;
        while (true) {
          const res = await db.collection('guides')
            .where({ sort: db.command.gte(0) })
            .limit(20)
            .remove();
          deleted += res.stats.removed;
          if (res.stats.removed === 0) break;
        }
        log.push(`guides：已硬删除 ${deleted} 条旧数据`);
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
        const { _id, ...settingsData } = defaultSettings;
        await db.collection('settings').doc('global').set({
          data: { ...settingsData, updatedAt: now },
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
