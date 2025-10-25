import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LazyImage = ({ src, alt, className, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {inView && (
        <>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="sm" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            {...props}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(LazyImage);