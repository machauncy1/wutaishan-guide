const db = wx.cloud.database();

export function getGuideList(): Promise<DB.IQueryResult> {
  return db
    .collection('guides')
    .where({ status: true })
    .orderBy('sort', 'asc')
    .field({
      avatar: true,
      name: true,
      experienceYear: true,
      serviceCount: true,
      tags: true,
    })
    .get();
}

export function getGuideDetail(guideId: string): Promise<DB.IQuerySingleResult> {
  return db
    .collection('guides')
    .doc(guideId)
    .field({
      name: true,
      avatar: true,
      experienceYear: true,
      serviceCount: true,
      phone: true,
      licenseText: true,
      wechatServiceEnabled: true,
      status: true,
      reviews: true,
    })
    .get();
}
