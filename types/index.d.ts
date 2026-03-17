// ===== 值约束 =====

type TripType =
  | '家庭出行'
  | '朋友结伴'
  | '独自出行'
  | '情侣出行'
  | '带父母'
  | '公司团建'
  | '许愿祈福'
  | '周末游';

type GuideTag =
  | '全程陪同'
  | '深度礼佛'
  | '行程规划'
  | '佛教文化'
  | '许愿还愿'
  | '司导服务'
  | '包车服务'
  | '寺庙讲解'
  | '家庭游'
  | '亲子游'
  | '定制路线'
  | '素食推荐'
  | '文化深度游'
  | '徒步路线'
  | '年轻活力'
  | '双人游';

type Rating = 1 | 2 | 3 | 4 | 5;

interface Review {
  nickname: string;
  rating: Rating;
  tripType: TripType;
  date: string;
}

interface ProcessedReview extends Review {
  stars: string[];
}

// ===== 集合: guides =====

/** 完整导游文档 */
interface Guide {
  _id?: string;
  name: string;
  avatar: string;
  experienceYear: number;
  serviceCount: number;
  tags: GuideTag[];
  phone: string;
  licenseText: string;
  wechatServiceEnabled: boolean;
  status: boolean;
  sort: number;
  reviews: Review[];
}

/** 列表页查询子集 */
type GuideListItem = Pick<
  Guide,
  '_id' | 'avatar' | 'name' | 'experienceYear' | 'serviceCount' | 'tags'
> & { _id: string };

/** 详情页查询子集 */
type GuideDetail = Omit<Guide, 'sort' | 'tags'> & { _id: string };

// ===== 集合: settings =====

interface Settings {
  _id?: string;
  bannerImage: string;
  homeTitle: string;
  homeSubtitle: string;
  serviceTotal: number;
  contactPhone: string;
  wechatServiceEnabled: boolean;
}

// ===== 集合: bookings =====

type TimePeriod = '上午' | '下午';

/** 预约记录文档 */
interface Booking {
  _id?: string;
  guideId: string;
  guideName: string;
  openid: string;
  touristName: string;
  touristPhone: string;
  date: string;
  timePeriod: TimePeriod;
  groupSize: number;
  remark: string;
  createdAt: Date;
}

// ===== 前端视图类型 =====

interface TrustPoint {
  label: string;
  value: string;
}
