
import React, { useState, useEffect } from 'react';
import { PhotoRecord } from '../types.ts';

interface ImageSliderProps {
  photos: PhotoRecord[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? photos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === photos.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [photos, currentIndex]);

  if (photos.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] sm:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl group">
      {/* Images container */}
      <div className="relative w-full h-full flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(${currentIndex * 100}%)` }}>
        {photos.map((photo, index) => (
          <div key={photo.public_id} className="min-w-full h-full relative">
            <img 
              src={photo.webp_url || photo.secure_url} 
              alt="رمضان 1447هـ" 
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/80 via-transparent to-transparent"></div>
            
            {/* Badge Overlay */}
            <div className="absolute bottom-8 right-8 text-white">
               <span className="bg-[#C5A059] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block shadow-lg">لقطات الميدان</span>
               <h4 className="text-xl font-bold opacity-90">رمضان الخير 1447هـ</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={goToNext}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
        aria-label="الصورة التالية"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={goToPrevious}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
        aria-label="الصورة السابقة"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${currentIndex === i ? 'w-8 bg-[#C5A059]' : 'w-2 bg-white/50'}`}
            aria-label={`الانتقال إلى الصورة ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
