import { useCallback, useMemo } from 'react';

export const usePerformance = () => {
  const measurePerformance = useCallback((name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name}: ${end - start}ms`);
    return result;
  }, []);

  const memoizedCallback = useCallback((fn, deps) => {
    return useCallback(fn, deps);
  }, []);

  const memoizedValue = useCallback((fn, deps) => {
    return useMemo(fn, deps);
  }, []);

  return { measurePerformance, memoizedCallback, memoizedValue };
};