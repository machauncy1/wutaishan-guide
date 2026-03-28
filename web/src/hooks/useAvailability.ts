import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyAvailability,
  setAvailability,
  getDailyGuides,
  updateGuideStatus,
  getSourceOptions,
} from '../services/availService';

export function useMyAvailability() {
  return useQuery({
    queryKey: ['my-availability'],
    queryFn: async () => {
      const res = await getMyAvailability();
      if (res.success && res.data) return res.data;
      throw new Error(res.errMsg || '获取失败');
    },
  });
}

export function useDailyGuides(date: string) {
  return useQuery({
    queryKey: ['daily-guides', date],
    queryFn: async () => {
      const res = await getDailyGuides(date);
      if (res.success && res.data) return res.data;
      throw new Error(res.errMsg || '获取失败');
    },
  });
}

export function useSourceOptions() {
  return useQuery({
    queryKey: ['source-options'],
    queryFn: async () => {
      const res = await getSourceOptions();
      if (res.success && res.data) return res.data;
      throw new Error(res.errMsg || '获取失败');
    },
    staleTime: 5 * 60 * 1000, // 5 分钟内不重新请求
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      date,
      status,
      source,
    }: {
      date: string;
      status: AvailabilityStatus;
      source?: string;
    }) => setAvailability(date, status, source),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-availability'] });
    },
  });
}

export function useUpdateGuideStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      guideId,
      date,
      status,
      source,
    }: {
      guideId: string;
      date: string;
      status: AvailabilityStatus;
      source?: string;
    }) => updateGuideStatus(guideId, date, status, source),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['daily-guides', variables.date] });
    },
  });
}
