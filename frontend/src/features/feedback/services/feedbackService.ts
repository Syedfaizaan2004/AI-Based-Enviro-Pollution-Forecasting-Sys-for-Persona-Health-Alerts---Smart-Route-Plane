import { api } from '@/services/api';
import { FEEDBACK_ENDPOINTS } from './endpoints';

export interface FeedbackCreate {
  category: 'bug' | 'feature' | 'ui_ux' | 'data' | 'general';
  subject: string;
  message: string;
  rating?: number | null;
}

export interface FeedbackUpdate {
  status: 'new' | 'reviewed' | 'resolved';
  admin_response?: string;
}

export interface FeedbackResponse {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  message: string;
  rating: number | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface PaginatedFeedback {
  items: FeedbackResponse[];
  total_count: number;
  page: number;
  size: number;
}

export const feedbackService = {
  createFeedback: async (data: FeedbackCreate): Promise<FeedbackResponse> => {
    const response = await api.post(FEEDBACK_ENDPOINTS.CREATE, data);
    return response.data;
  },

  getMyFeedback: async (skip = 0, limit = 20): Promise<PaginatedFeedback> => {
    const response = await api.get(FEEDBACK_ENDPOINTS.GET_MY, { params: { skip, limit } });
    return response.data;
  },

  getAllFeedback: async (skip = 0, limit = 20): Promise<PaginatedFeedback> => {
    const response = await api.get(FEEDBACK_ENDPOINTS.GET_ALL, { params: { skip, limit } });
    return response.data;
  },

  updateFeedbackStatus: async (id: string, data: FeedbackUpdate): Promise<FeedbackResponse> => {
    const response = await api.patch(FEEDBACK_ENDPOINTS.UPDATE_STATUS(id), data);
    return response.data;
  }
};
