
import React, { useState, useMemo } from 'react';
import { PhotoRecord, MosqueInfo } from '../types.ts';
import { Search, Image as ImageIcon, X, ArrowRight, Grid, List, Play, Film } from 'lucide-react';

interface PhotoGalleryProps {
  photos: PhotoRecord[];
  mosques: MosqueInfo[];
  onBack: () => void;
}

// Smart Media Detection
const isVideo = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.quicktime', '.m4v'];
  const lowercaseUrl = url.toLowerCase();
  
  // Check extension
  const hasVideoExtension = videoExtensions.some(ext => lowercaseUrl.endsWith(ext));
  if (hasVideoExtension) return true;

  // Check Cloudinary video path
  if (lowercaseUrl.includes('/video/upload/')) return true;

  return false;
};

const MediaGallery: React.FC<PhotoGalleryProps> = ({ photos, mosques, onBack }) => {
  const [selectedMosqueCode, setSelectedMosqueCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxMedia, setLightboxMedia] = useState<string | null>(null);

  // Group media by mosque_code (from tags)
  const mosqueMediaStats = useMemo(() => {
    const stats: Record<string, { photos: number, videos: number }> = {};
    photos.forEach(item => {
      if (item.tags) {
        if (!stats[item.tags]) {
          stats[item.tags] = { photos: 0, videos: 0 };
        }
        if (isVideo(item.secure_url)) {
          stats[item.tags].videos += 1;
        } else {
          stats[item.tags].photos += 1;
        }
      }
    });
    return stats;
  }, [photos]);

  const filteredMosques = useMemo(() => {
    return mosques
      .filter(m => m.المسجد.includes(searchQuery))
      .map(m => ({
        ...m,
        stats: mosqueMediaStats[m.mosque_code] || { photos: 0, videos: 0 }
      }))
      .sort((a, b) => (b.stats.photos + b.stats.videos) - (a.stats.photos + a.stats.videos));
  }, [mosques, searchQuery, mosqueMediaStats]);

  const mosqueMedia = useMemo(() => {
    if (!selectedMosqueCode) return [];
    return photos.filter(p => p.tags === selectedMosqueCode);
  }, [photos, selectedMosqueCode]);

  const selectedMosqueName = useMemo(() => {
    return mosques.find(m => m.mosque_code === selectedMosqueCode)?.المسجد || '';
  }, [mosques, selectedMosqueCode]);

  return (
    <div className="space-y-8 animate-in fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={selectedMosqueCode ? () => setSelectedMosqueCode(null) : onBack} 
            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowRight className="h-6 w-6 text-slate-500" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-[#003366]">
              {selectedMosqueCode ? selectedMosqueName : 'معرض الوسائط الميداني'}
            </h2>
            <p className="text-slate-400 text-sm font-bold">
              {selectedMosqueCode 
                ? `توثيق بصري لجميع الأنشطة في الموقع (${mosqueMedia.length} وسيط)` 
                : 'تصفح التوثيق البصري (صور وفيديو) لجميع المواقع والمساجد'}
            </p>
          </div>
        </div>

        {!selectedMosqueCode && (
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن اسم الجامع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-[#0054A6] transition-all font-bold text-[#003366]"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      {!selectedMosqueCode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMosques.map(mosque => (
            <button
              key={mosque.mosque_code}
              onClick={() => setSelectedMosqueCode(mosque.mosque_code)}
              className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0054A6]/20 transition-all text-right flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${(mosque.stats.photos + mosque.stats.videos) > 0 ? 'bg-[#0054A6]/10 text-[#0054A6]' : 'bg-slate-50 text-slate-300'}`}>
                  {mosque.stats.videos > 0 ? <Film className="w-7 h-7" /> : <ImageIcon className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="font-black text-[#003366] group-hover:text-[#0054A6] transition-colors">{mosque.المسجد}</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">{mosque["نوع الموقع"]}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-[#003366] tabular-nums">{mosque.stats.photos}</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase">صورة</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-[#C5A059] tabular-nums">{mosque.stats.videos}</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase">فيديو</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mosqueMedia.length > 0 ? (
            mosqueMedia.map((photo, idx) => (
              <div 
                key={photo.public_id} 
                className="group relative aspect-square rounded-[2rem] overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-xl transition-all"
                onClick={() => setLightboxMedia(photo.secure_url)}
              >
                {isVideo(photo.secure_url) ? (
                  <div className="w-full h-full relative">
                    <video 
                      src={photo.secure_url} 
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-[#003366] fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-[#C5A059] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      فيديو
                    </div>
                  </div>
                ) : (
                  <img 
                    src={photo.webp_url || photo.secure_url} 
                    alt={`وسيط ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white text-xs font-bold">{isVideo(photo.secure_url) ? 'تشغيل الفيديو' : 'عرض الصورة'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
              <ImageIcon className="w-20 h-20 opacity-20" />
              <p className="font-black text-xl">لا توجد صور متوفرة لهذا الموقع</p>
              <button 
                onClick={() => setSelectedMosqueCode(null)}
                className="text-[#0054A6] font-bold hover:underline"
              >
                العودة لقائمة المواقع
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div 
            className="absolute inset-0 bg-[#003366]/95 backdrop-blur-md" 
            onClick={() => setLightboxMedia(null)}
          ></div>
          <button 
            onClick={() => setLightboxMedia(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-full max-h-full animate-in zoom-in duration-300 flex items-center justify-center">
            {isVideo(lightboxMedia) ? (
              <video 
                src={lightboxMedia} 
                controls 
                autoPlay 
                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border-4 border-white/10"
              />
            ) : (
              <img 
                src={lightboxMedia} 
                alt="Full size" 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
