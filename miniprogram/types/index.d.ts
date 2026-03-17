interface IReview {
  nickname: string;
  rating: number;
  tripType: string;
  date: string;
}

interface IProcessedReview extends IReview {
  stars: string[];
}

interface IGuideListItem {
  _id: string;
  avatar: string;
  name: string;
  experienceYear: number;
  serviceCount: number;
  tags: string[];
}

interface IGuideDetail {
  _id: string;
  name: string;
  avatar: string;
  experienceYear: number;
  serviceCount: number;
  phone: string;
  licenseText: string;
  wechatServiceEnabled: boolean;
  status: boolean;
  reviews: IReview[];
}

interface ISettings {
  _id?: string;
  bannerImage: string;
  homeTitle: string;
  homeSubtitle: string;
  serviceTotal: number;
  contactPhone: string;
  wechatServiceEnabled: boolean;
}

interface ITrustPoint {
  label: string;
  value: string;
}
