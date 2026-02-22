import React from 'react';

interface WelcomePageProps {
  onEnter: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center p-8 text-white text-center relative overflow-hidden font-['Tajawal']" dir="rtl">
      {/* Background elements for decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#C5A059]/10 rounded-full filter blur-3xl opacity-50"></div>
      
      <div className="relative z-10 flex flex-col items-center animate-in" style={{ animationName: 'fade-in', animationDuration: '1s' }}>
        
        <div 
          className="flex items-center justify-center gap-8 mb-12"
          style={{ animation: 'slide-in-from-top 0.8s ease-out' }}
        >
          <img 
            src="https://next.rajhifoundation.org/files/52c533df-1.png" 
            alt="شعار مؤسسة عبدالله الراجحي الخيرية" 
            className="h-24 w-24 bg-white p-2 rounded-3xl shadow-2xl transform transition-transform hover:scale-105" 
          />
          <img 
            src="https://rajhifoundation.org/wp-content/uploads/sites/2858/2024/11/Asset-6.svg" 
            alt="شعار مؤسسة الراجحي" 
            className="w-64 h-auto filter brightness-0 invert"
          />
        </div>

        <h1 
          className="text-4xl md:text-6xl font-black mb-4"
          style={{ animation: 'fade-in 1s 0.2s both' }}
        >
          مرحباً بكم
        </h1>
        
        <p 
          className="text-lg md:text-xl text-white/70 max-w-2xl mb-12 font-medium"
          style={{ animation: 'fade-in 1s 0.4s both' }}
        >
          في منصة إدارة الأنشطة الرمضانية لمؤسسة عبدالله بن عبدالعزيز الراجحي الخيرية لعام 1447هـ
        </p>

        <button 
          onClick={onEnter} 
          className="bg-[#C5A059] text-[#003366] px-12 py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-white transition-all transform hover:scale-105 active:scale-95 border-4 border-white/20 mt-8"
          style={{ animation: 'fade-in 1s 0.6s both' }}
        >
          الدخول إلى المنصة
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;