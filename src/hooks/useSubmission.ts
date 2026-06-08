// hooks/useSubmission.ts
import { useState, useCallback } from 'react';
import { submissionService } from '@/Services/submissionService';
import { Submission, CreateSubmissionPayload, UpdateSubmissionPayload, SubmissionFile } from '@/types/submission';

export const useSubmission = (submissionId?: number) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await submissionService.getSubmission(submissionId);
      setSubmission(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  const create = async (payload: CreateSubmissionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await submissionService.createSubmission(payload);
      setSubmission(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (payload: UpdateSubmissionPayload) => {
    if (!submission) throw new Error('No submission loaded');
    setLoading(true);
    setError(null);
    try {
      const data = await submissionService.updateSubmission(submission.id, payload);
      setSubmission(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!submission) throw new Error('No submission loaded');
    setLoading(true);
    setError(null);
    try {
      const uploaded = await submissionService.uploadFiles(submission.id, files);
      // Refresh submission to get updated files
      await fetchSubmission();
      return uploaded;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addLink = async (url: string, description?: string) => {
    if (!submission) throw new Error('No submission loaded');
    setLoading(true);
    setError(null);
    try {
      const link = await submissionService.addLink(submission.id, url, description);
      await fetchSubmission();
      return link;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: number) => {
    if (!submission) throw new Error('No submission loaded');
    setLoading(true);
    setError(null);
    try {
      await submissionService.deleteFile(fileId);
      await fetchSubmission();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!submission) throw new Error('No submission loaded');
    setLoading(true);
    setError(null);
    try {
      await submissionService.submitSubmission(submission.id);
      await fetchSubmission();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submission,
    loading,
    error,
    fetchSubmission,
    create,
    update,
    uploadFiles,
    addLink,
    deleteFile,
    submit,
  };
};