import api from '@/lib/axios';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  published_at: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}

export const publicApi = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await api.get('/announcements');
    return response.data;
  },
  getFaqs: async (): Promise<Faq[]> => {
    const response = await api.get('/faqs');
    return response.data;
  }
};