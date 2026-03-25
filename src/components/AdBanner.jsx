import { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      // Silently fail - AdSense will handle errors
    }
  }, []);

  // Don't show ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="w-full p-4 bg-gray-200 dark:bg-gray-700 rounded-lg text-center text-sm text-gray-600 dark:text-gray-400">
        Ad Placeholder (Production Only)
      </div>
    );
  }

  return (
    <div className="w-full my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8320354212559217"
        data-ad-slot="5943090493"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
