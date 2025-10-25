import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
    .trim()
    .slice(0, 1000);
};

export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '')
    .slice(0, 254);
};

export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
};

export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

export const validateFileType = (file, allowedTypes) => {
  if (!file || !file.type) return false;
  
  const fileType = file.type.toLowerCase();
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.replace('/*', ''));
    }
    return fileType === type;
  });
};

export const validateFileSize = (file, maxSizeMB) => {
  if (!file || !file.size) return false;
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
