export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) break;
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

export const isRetryableError = (error) => {
  const retryableCodes = [408, 429, 500, 502, 503, 504];
  return retryableCodes.includes(error.response?.status) || error.code === 'NETWORK_ERROR';
};