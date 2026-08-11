import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '../services/feedbackService';
import type { FeedbackCreate, FeedbackUpdate } from '../services/feedbackService';

export const feedbackKeys = {
  all: ['feedback'] as const,
  myFeedback: (skip: number, limit: number) => ['feedback', 'my', skip, limit] as const,
  adminAllFeedback: (skip: number, limit: number) => ['feedback', 'admin', 'all', skip, limit] as const,
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeedbackCreate) => feedbackService.createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
};

export const useMyFeedback = (skip = 0, limit = 20) => {
  return useQuery({
    queryKey: feedbackKeys.myFeedback(skip, limit),
    queryFn: () => feedbackService.getMyFeedback(skip, limit),
  });
};

export const useAdminAllFeedback = (skip = 0, limit = 20) => {
  return useQuery({
    queryKey: feedbackKeys.adminAllFeedback(skip, limit),
    queryFn: () => feedbackService.getAllFeedback(skip, limit),
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackUpdate }) => feedbackService.updateFeedbackStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
};
