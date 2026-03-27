import { Solar } from 'lunar-javascript';

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

/** 获取农历日期文本，如 "四月初一"、"四月十五" */
export function getLunarText(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const lunar = Solar.fromYmd(y, m, d).getLunar();
  const monthName = lunar.getMonthInChinese();
  const dayName = lunar.getDayInChinese();
  return `${monthName}月${dayName}`;
}

/** 是否是农历初一或十五 */
export function isLunarKeyDay(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const lunar = Solar.fromYmd(y, m, d).getLunar();
  const day = lunar.getDay();
  return day === 1 || day === 15;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/** 获取短日期文本，如 "3/27" */
export function getShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 获取星期文本，如 "周一" */
export function getWeekday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  return `周${WEEKDAYS[d.getDay()]}`;
}
