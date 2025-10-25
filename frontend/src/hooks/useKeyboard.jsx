import { useEffect, useCallback } from 'react';

export const useKeyboard = (shortcuts = {}) => {
  const handleKeyPress = useCallback((event) => {
    const key = event.key.toLowerCase();
    const combo = [
      event.ctrlKey && 'ctrl',
      event.altKey && 'alt', 
      event.shiftKey && 'shift',
      key
    ].filter(Boolean).join('+');

    if (shortcuts[combo]) {
      event.preventDefault();
      shortcuts[combo]();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};