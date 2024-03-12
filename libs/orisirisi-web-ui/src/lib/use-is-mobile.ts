import { useEffect, useState } from 'react';

export const useIsMobile = (maxMobileWidth = 600): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.innerWidth <= maxMobileWidth
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= maxMobileWidth);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [maxMobileWidth]);

  return isMobile;
};

export default useIsMobile;
