const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// ===== 10 位导游示例数据 =====
const guides = [
  {
    name: '王建国',
    avatar: '',
    gender: 'male',
    experienceYear: 12,
    serviceCount: 2300,
    tags: ['寺庙讲解', '朝台路线', '家庭团'],
    description:
      '土生土长的五台山人，从业12年，精通五台山各大寺庙的历史典故与佛教文化。带领过无数家庭团完成大朝台，熟悉东西南北中五台的最佳游览路线，擅长用通俗易懂的语言讲解深奥的佛教知识。',
    phone: '13812340001',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 1,
  },
  {
    name: '李翠云',
    avatar: '',
    gender: 'female',
    experienceYear: 8,
    serviceCount: 1600,
    tags: ['朝台路线', '老人团', '接站服务'],
    description:
      '专注老年团服务8年，体贴细心，对五台山各路段的路况、休息点、海拔变化了如指掌。擅长为老年游客规划轻松无压力的朝台路线，注重安全保障，深受老年游客信赖和好评。',
    phone: '13812340002',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 2,
  },
  {
    name: '张明辉',
    avatar: '',
    gender: 'male',
    experienceYear: 15,
    serviceCount: 3200,
    tags: ['佛教文化', '寺庙讲解', '文化深度游'],
    description:
      '五台山资深导游，从业15年，持有国家导游证与佛教文化研究资格认证。曾数次参与五台山文化整理工作，对显通寺、塔院寺、菩萨顶等核心寺庙的建筑史、佛教典故有极深的研究，尤擅长定制化文化深度游行程。',
    phone: '13812340003',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 3,
  },
  {
    name: '刘芳',
    avatar: '',
    gender: 'female',
    experienceYear: 6,
    serviceCount: 980,
    tags: ['摄影路线', '亲子游', '小众寺庙'],
    description:
      '摄影爱好者出身，熟悉五台山各时段、各角度的绝佳拍摄机位，带你拍出朋友圈爆款。同时擅长亲子游路线规划，能把佛教文化讲成孩子爱听的故事，寓教于乐，带你发现鲜为人知的小众寺庙秘境。',
    phone: '13812340004',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 4,
  },
  {
    name: '赵志远',
    avatar: '',
    gender: 'male',
    experienceYear: 18,
    serviceCount: 4500,
    tags: ['全程陪同', '朝台路线', '包车服务'],
    description:
      '五台山导游行业元老，18年服务超4500位游客。提供私人定制全程陪同服务，从机场/火车站接站到全程包车，一站式安排食住行游。朝遍五台山全程5次以上，最熟悉大朝台所有路段的难易程度与补给点位置。',
    phone: '13812340005',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 5,
  },
  {
    name: '陈雪梅',
    avatar: '',
    gender: 'female',
    experienceYear: 10,
    serviceCount: 1850,
    tags: ['素食推荐', '寺庙讲解', '禅修体验'],
    description:
      '本人长期研习佛法，精通五台山素斋文化，能带你体验最地道的寺院素食。擅长安排禅修打坐体验，帮助都市人找回内心宁静。从业10年，对五台山各寺院斋堂、挂单流程及礼佛规范了如指掌。',
    phone: '13812340006',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 6,
  },
  {
    name: '孙大伟',
    avatar: '',
    gender: 'male',
    experienceYear: 3,
    serviceCount: 420,
    tags: ['年轻活力', '徒步路线', '接站服务'],
    description:
      '五台山本地年轻导游，热情开朗，熟悉山区徒步路线，适合喜欢户外探险的年轻游客群体。擅长规划高性价比行程，提供接站服务，带你用脚步丈量五台山的每一寸土地。',
    phone: '13812340007',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 7,
  },
  {
    name: '周美华',
    avatar: '',
    gender: 'female',
    experienceYear: 11,
    serviceCount: 2100,
    tags: ['家庭团', '亲子游', '佛教文化'],
    description:
      '专注家庭亲子游11年，有丰富的带孩子游览经验。深知孩子的体力与注意力特点，善于规划轻松有趣的行程，将文殊菩萨的故事讲得生动有趣。服务过数百个三代同行家庭，老少皆宜，口碑极佳。',
    phone: '13812340008',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 8,
  },
  {
    name: '吴天明',
    avatar: '',
    gender: 'male',
    experienceYear: 20,
    serviceCount: 5800,
    tags: ['资深导游', '全程陪同', '定制行程'],
    description:
      '五台山从业20年的资深导游，服务游客近6000人次。曾多次接待国内外知名人士，具备丰富的高端定制接待经验。精通普通话、山西方言，能根据游客需求量身定制1-5天的五台山深度游行程，是朋友和回头客最多的导游之一。',
    phone: '13812340009',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 9,
  },
  {
    name: '马晓燕',
    avatar: '',
    gender: 'female',
    experienceYear: 7,
    serviceCount: 1200,
    tags: ['摄影路线', '星空观测', '小众寺庙'],
    description:
      '摄影师出身的五台山导游，专注小众深度游7年。带你避开人山人海，探访鲜有人知的隐秘寺庙与山间古道。精通五台山星空观测最佳位置，擅长安排清晨迎接云海日出的特色行程，每张照片都是专属记忆。',
    phone: '13812340010',
    agencyName: '五台山XX旅行社',
    licenseText: '本地持证导游',
    wechatServiceEnabled: true,
    status: true,
    sort: 10,
  },
];

// ===== 全局配置初始数据 =====
const defaultSettings = {
  _id: 'global',
  travelAgencyName: '五台山XX旅行社',
  logo: '',
  bannerImage: '',
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
