import { getAmenityIcon } from '../../config/amenityIcons';

export default function AmenityIcon({ amenity, size = 16, className = '' }) {
  const Icon = getAmenityIcon(amenity);
  return <Icon size={size} className={className} />;
}