import { useEffect } from 'react';

//This prevents backgrownd scrolling when a modal is opened
//just use     useBodyScrollLock(true); at the beginning of the modal component
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLocked) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isLocked]);
};