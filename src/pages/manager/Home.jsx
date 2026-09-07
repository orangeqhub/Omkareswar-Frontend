import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../utils/permissions';
import { ShieldCheck } from 'lucide-react';
import { Building2, Inbox, Tags, ImagePlus, FileText, MapPin, Sliders, ClipboardList } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { propertyService } from '../../services/propertyService';
import { enquiryService } from '../../services/enquiryService';
import { categoryService } from '../../services/categoryService';
import { mediaRuleService } from '../../services/mediaRuleService';
import { cmsService } from '../../services/cmsService';
import { settingsService } from '../../services/settingsService';
import { registrationFormService } from '../../services/registrationFormService';

function countCustomLocations(value) {
  if (!value) return 0;
  if (Array.isArray(value)) return value.length;
  return Object.keys(value).reduce((sum, key) => {
    const v = value[key];
    return sum + (Array.isArray(v) ? v.length : Object.keys(v || {}).length);
  }, 0);
}

function countCmsSections(cms) {
  if (!cms || typeof cms !== 'object') return 0;
  const sections = [
    cms.aboutEn, cms.aboutTe, cms.contactPhone, cms.contactEmail,
    cms.contactAddressEn, cms.contactAddressTe, cms.contactWhatsapp,
  ];
  return sections.filter((v) => v !== undefined && v !== null && String(v).trim() !== '').length;
}

function countPropertyFields(settings) {
  const list = settings?.propertyFields;
  if (Array.isArray(list)) return list.length;
  if (list && typeof list === 'object') return Object.keys(list).length;
  return 0;
}

async function loadProperties() {
  const [total, pending] = await Promise.all([
    propertyService.getProperties({ includeAllStatuses: true, pageSize: 1 }).catch(() => ({ total: 0 })),
    propertyService.getProperties({ status: 'pending', includeAllStatuses: true, pageSize: 1 }).catch(() => ({ total: 0 })),
  ]);
  return {
    totalProperties: total.total || 0,
    pendingProperties: pending.total || 0,
  };
}

async function loadEnquiries() {
  return enquiryService.getAllEnquiries().then((list) => list.length).catch(() => 0);
}

async function loadCategories() {
  return categoryService.getPublicCategories().then((list) => list.length).catch(() => 0);
}

async function loadMediaRules() {
  return mediaRuleService.getRules().then((rules) => Object.keys(rules).length).catch(() => 0);
}

async function loadCms() {
  return cmsService.getCms().then((cms) => countCmsSections(cms)).catch(() => 0);
}

async function loadLocations() {
  return settingsService.getSettings().then((s) => countCustomLocations(s?.customLocations)).catch(() => 0);
}

async function loadPropertyFields() {
  return settingsService.getSettings().then((s) => countPropertyFields(s)).catch(() => 0);
}

async function loadRegistrationForms() {
  return registrationFormService.listForms().then((list) => (Array.isArray(list) ? list.length : 0)).catch(() => 0);
}

function buildCards(user, t) {
  const cards = [];
  if (hasPermission(user, 'MANAGER_PROPERTIES_VIEW')) {
    cards.push(
      { key: 'totalProperties', icon: Building2, label: t('manager.stats.totalProperties', { defaultValue: 'Total Properties' }), accent: 'green', fetcher: () => loadProperties().then((r) => r.totalProperties) },
      { key: 'pendingProperties', icon: Building2, label: t('manager.stats.pendingProperties', { defaultValue: 'Pending Properties' }), accent: 'amber', fetcher: () => loadProperties().then((r) => r.pendingProperties) }
    );
  }
  if (hasPermission(user, 'MANAGER_ENQUIRIES_VIEW')) {
    cards.push({ key: 'enquiries', icon: Inbox, label: t('manager.stats.enquiries', { defaultValue: 'Enquiries' }), accent: 'indigo', fetcher: loadEnquiries });
  }
  if (hasPermission(user, 'MANAGER_CATEGORIES_VIEW')) {
    cards.push({ key: 'categories', icon: Tags, label: t('manager.stats.categories', { defaultValue: 'Categories' }), accent: 'purple', fetcher: loadCategories });
  }
  if (hasPermission(user, 'MANAGER_MEDIA_RULES_VIEW')) {
    cards.push({ key: 'mediaRules', icon: ImagePlus, label: t('manager.stats.mediaRules', { defaultValue: 'Media Rules' }), accent: 'cyan', fetcher: loadMediaRules });
  }
  if (hasPermission(user, 'MANAGER_CMS_VIEW')) {
    cards.push({ key: 'cms', icon: FileText, label: t('manager.stats.cms', { defaultValue: 'CMS Content' }), accent: 'blue', fetcher: loadCms });
  }
  if (hasPermission(user, 'MANAGER_LOCATIONS_VIEW')) {
    cards.push({ key: 'locations', icon: MapPin, label: t('manager.stats.locations', { defaultValue: 'Custom Locations' }), accent: 'orange', fetcher: loadLocations });
  }
  if (hasPermission(user, 'MANAGER_PROPERTY_FIELDS_VIEW')) {
    cards.push({ key: 'propertyFields', icon: Sliders, label: t('manager.stats.propertyFields', { defaultValue: 'Property Fields' }), accent: 'green', fetcher: loadPropertyFields });
  }
  if (hasPermission(user, 'MANAGER_REGISTRATION_FORMS_VIEW')) {
    cards.push({ key: 'registrationForms', icon: ClipboardList, label: t('manager.stats.registrationForms', { defaultValue: 'Registration Forms' }), accent: 'red', fetcher: loadRegistrationForms });
  }
  return cards;
}

export default function ManagerHome() {
  const { t } = useTranslation(['dashboard', 'common']);
  const user = useAuthStore((s) => s.user);
  const [cards] = useState(() => buildCards(user, t));
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let active = true;
    cards.forEach((card) => {
      card.fetcher().then((value) => {
        if (active) setCounts((c) => ({ ...c, [card.key]: value }));
      });
    });
    return () => { active = false; };
  }, [cards]);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-800">
        {t('manager.home.title', { defaultValue: 'Manager Dashboard' })}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {t('greeting', { name: user?.name })}
      </p>

      {cards.length === 0 ? (
        <div className="mt-10 flex min-h-[40vh] flex-col items-center justify-center text-center">
          <ShieldCheck size={48} className="text-brand-600" />
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {t('manager.home.noSectionsTitle', { defaultValue: 'Welcome to the Manager Portal' })}
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            {t('manager.home.noSectionsBody', {
              defaultValue: 'No sections have been assigned to your account yet. Please contact the administrator.',
            })}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={counts[card.key] ?? '—'}
              accent={card.accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
