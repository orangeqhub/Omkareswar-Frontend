import { useEffect, useState } from 'react';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import PropertyCard from '../../components/properties/PropertyCard';
import EmptyState from '../../components/common/EmptyState';

export default function Properties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    if (!user) return;
    propertyService
      .getProperties({ includeAllStatuses: true, pageSize: 100, viewer: user, scopeMode: 'mediator' })
      .then((r) => setProperties(r.items));
  }, [user]);

  if (properties === null) return null;
  if (properties.length === 0) return <EmptyState titleKey="empty.noData" />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
    </div>
  );
}
