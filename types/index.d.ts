interface Review {
  nickname: string;
  rating: number;
  tripType: string;
  date: string;
}

interface ProcessedReview extends Review {
  stars: string[];
}

interface Guide {
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
  reviews: Review[];
}

type GuideListItem = Pick<
  Guide,
  '_id' | 'avatar' | 'name' | 'experienceYear' | 'serviceCount' | 'tags'
> & { _id: string };

type GuideDetail = Omit<Guide, 'sort' | 'tags'> & { _id: string };

interface Settings {
  _id?: string;
  bannerImage: string;
  homeTitle: string;
  homeSubtitle: string;
  serviceTotal: number;
  contactPhone: string;
  wechatServiceEnabled: boolean;
}

interface TrustPoint {
  label: string;
  value: string;
}
