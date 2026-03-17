interface IReview {
  nickname: string;
  rating: number;
  tripType: string;
  date: string;
}

interface IProcessedReview extends IReview {
  stars: string[];
}

interface IGuide {
  _id?: string;
  name: string;
  avatar: string;
  experienceYear: number;
  serviceCount: number;
  tags: string[];
  phone: string;
  licenseText: string;
  wechatServiceEnabled: boolean;
  status: boolean;
  sort: number;
  reviews: IReview[];
}

type IGuideListItem = Pick<
  IGuide,
  '_id' | 'avatar' | 'name' | 'experienceYear' | 'serviceCount' | 'tags'
> & { _id: string };

type IGuideDetail = Omit<IGuide, 'sort' | 'tags'> & { _id: string };

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
