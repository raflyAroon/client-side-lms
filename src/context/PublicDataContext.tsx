'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { publicApi, Announcement, Faq } from '@/Services/publicApi';

interface PublicDataContextType {
  announcements: Announcement[];
  faqs: Faq[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const PublicDataContext = createContext<PublicDataContextType | undefined>(undefined);

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (!context) throw new Error('usePublicData must be used within PublicDataProvider');
  return context;
};

export const PublicDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const [announcementsData, faqsData] = await Promise.all([
      publicApi.getAnnouncements(),
      publicApi.getFaqs(),
    ]);
    setAnnouncements(announcementsData);
    setFaqs(faqsData);
  } catch (err: any) {
    console.error('Fetch error:', err);
    setError(err.response?.data?.error || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PublicDataContext.Provider
      value={{ announcements, faqs, loading, error, refresh: fetchData }}
    >
      {children}
    </PublicDataContext.Provider>
  );
};