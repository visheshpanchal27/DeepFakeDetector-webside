// Web vitals will be imported when available
// import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { analytics } from './analytics';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Web vitals tracking will be enabled when library is available
    console.log('Web vitals tracking ready');
  }
};

export const trackWebVitals = () => {
  reportWebVitals((metric) => {
    console.log('Performance metric:', metric);
  });
};

export default reportWebVitals;