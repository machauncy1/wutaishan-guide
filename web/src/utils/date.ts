/** 获取北京时间今天的日期字符串 YYYY-MM-DD */
export function todayBJ(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
}

/** 获取北京时间从今天起偏移 N 天的日期字符串 */
export function offsetDateBJ(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
}
