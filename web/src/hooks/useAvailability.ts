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
    mutationFn: ({
      date,
      status,
      source,
      sourceNote,
    }: {
      date: string;
      status: AvailabilityStatus;
      source?: BookingSource;
      sourceNote?: string;
    }) => setAvailability(date, status, source, sourceNote),
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
      sourceNote,
    }: {
      guideId: string;
      date: string;
      status: AvailabilityStatus;
      source?: BookingSource;
      sourceNote?: string;
    }) => updateGuideStatus(guideId, date, status, source, sourceNote),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['daily-guides', variables.date] });
    },
  });
}
