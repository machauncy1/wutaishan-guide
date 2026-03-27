import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyAvailability,
  setAvailability,
  getDailyGuides,
  updateGuideStatus,
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

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, status }: { date: string; status: AvailabilityStatus }) =>
      setAvailability(date, status),
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
    }: {
      guideId: string;
      date: string;
      status: AvailabilityStatus;
    }) => updateGuideStatus(guideId, date, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['daily-guides', variables.date] });
    },
  });
}
