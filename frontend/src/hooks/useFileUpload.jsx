import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file, onSuccess, onError) => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
      
      toast.success('File analyzed successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Upload failed';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
  };
};