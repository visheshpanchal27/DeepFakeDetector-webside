import { useState } from 'react';
import { validateFileType, validateFileSize } from '../utils/sanitize';

export const useFileValidation = () => {
  const [error, setError] = useState(null);

  const validateFile = (file, options = {}) => {
    const {
      maxSizeMB = 500,
      allowedTypes = ['image/*', 'video/*']
    } = options;

    setError(null);

    if (!file) {
      setError('No file selected');
      return false;
    }

    if (!validateFileType(file, allowedTypes)) {
      setError('Invalid file type. Please upload an image or video.');
      return false;
    }

    if (!validateFileSize(file, maxSizeMB)) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    return true;
  };

  return { validateFile, error, clearError: () => setError(null) };
};
