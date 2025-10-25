export const validateFile = (file, maxSize, allowedTypes) => {
  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`);
  }

  // Type validation
  const fileType = file.type.toLowerCase();
  const isValidType = allowedTypes.some(type => {
    if (type.includes('*')) {
      return fileType.startsWith(type.replace('*', ''));
    }
    return fileType === type;
  });

  if (!isValidType) {
    errors.push('File type not supported');
  }

  // Security checks
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
  const fileName = file.name.toLowerCase();
  if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
    errors.push('File type not allowed for security reasons');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};