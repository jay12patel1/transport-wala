import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { getVehicleImage } from '../../utils/vehicleImages';

interface VehicleImageProps {
  src?: string;
  alt: string;
  vehicleType?: string;
  vehicleCategory?: string;
  isRefrigerated?: boolean;
  className?: string;
  fallbackClassName?: string;
}

export const VehicleImage: React.FC<VehicleImageProps> = ({
  src,
  alt,
  vehicleType,
  vehicleCategory,
  isRefrigerated,
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 text-center'
}) => {
  const defaultSource = src || getVehicleImage(vehicleType, vehicleCategory, isRefrigerated);
  const [imgSrc, setImgSrc] = useState<string>(defaultSource);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      // Try fallback catalog image if custom image failed
      const fallback = getVehicleImage(vehicleType, vehicleCategory, isRefrigerated);
      if (fallback !== imgSrc) {
        setImgSrc(fallback);
      } else {
        setHasError(true);
      }
    }
  };

  if (hasError) {
    return (
      <div className={fallbackClassName}>
        <Truck className="w-8 h-8 text-blue-400 mb-1" />
        <span className="text-xs font-bold text-slate-200">{vehicleType || alt || 'Commercial Truck'}</span>
        <span className="text-[10px] text-slate-400">Transport Wala Fleet</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
};
