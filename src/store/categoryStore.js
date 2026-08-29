import { create } from 'zustand';
import { categoryService } from '../services/categoryService';
import { mergeCategoryDefaults } from '../config/categoryDefaults';

export const useCategoryStore = create((set, get) => ({
  categories: [
    {
      slug: 'open-plots',
      ruleKey: 'openPlot',
      nameEn: 'Open Plots',
      nameTe: 'ఓపెన్ ప్లాట్లు',
      icon: 'Trees',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'apartments',
      ruleKey: 'apartment',
      nameEn: 'Apartments',
      nameTe: 'అపార్ట్‌మెంట్లు',
      icon: 'Building2',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'independent-houses',
      ruleKey: 'independentHouse',
      nameEn: 'Independent Houses',
      nameTe: 'ఇండిపెండెంట్ హౌస్‌లు',
      icon: 'Home',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'gated-communities',
      ruleKey: 'gatedCommunity',
      nameEn: 'Gated Communities',
      nameTe: 'గేటెడ్ కమ్యూనిటీలు',
      icon: 'ShieldCheck',
      image: 'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'agricultural-lands',
      ruleKey: 'agriculturalLand',
      nameEn: 'Agricultural Lands',
      nameTe: 'వ్యవసాయ భూములు',
      icon: 'Wheat',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'flats',
      ruleKey: 'apartment',
      nameEn: 'Independent Apartments',
      nameTe: 'ఇండిపెండెంట్ అపార్ట్‌మెంట్లు',
      icon: 'Building',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'villas',
      ruleKey: 'independentHouse',
      nameEn: 'Villas',
      nameTe: 'విల్లాలు',
      icon: 'Castle',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'commercial-properties',
      ruleKey: 'commercialPlot',
      nameEn: 'Commercial Properties',
      nameTe: 'వాణిజ్య ఆస్తులు',
      icon: 'Building2',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'industrial-lands',
      ruleKey: 'commercialPlot',
      nameEn: 'Industrial Lands',
      nameTe: 'పారిశ్రామిక భూములు',
      icon: 'Factory',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'warehouse-godowns',
      ruleKey: 'commercialPlot',
      nameEn: 'Warehouses / Godowns',
      nameTe: 'గోదాములు',
      icon: 'Warehouse',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=60',
    },
    {
      slug: 'farm-houses',
      ruleKey: 'independentHouse',
      nameEn: 'Farm Houses',
      nameTe: 'ఫారం హౌస్‌లు',
      icon: 'Trees',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=60',
    },
  ],
  loaded: false,
  loading: false,

  loadCategories: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const list = await categoryService.getPublicCategories();
      if (list && list.length > 0) {
        const merged = mergeCategoryDefaults(list);
        const fetched = new Set(merged.map((c) => c.slug));
        const defaults = get().categories.filter((c) => !fetched.has(c.slug));
        const combined = mergeCategoryDefaults([...merged, ...defaults]);
        const ordered = [...combined].sort((a, b) => {
          const ai = merged.findIndex((m) => m.slug === a.slug);
          const bi = merged.findIndex((m) => m.slug === b.slug);
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
        set({ categories: ordered, loaded: true });
      }
    } catch (err) {
      console.error('Failed to load dynamic categories, falling back to default:', err);
    } finally {
      set({ loading: false });
    }
  },

  getCategoryBySlug: (slug) => {
    return get().categories.find((c) => c.slug === slug);
  },

  getCategoryByRuleKey: (ruleKey) => {
    return get().categories.find((c) => c.ruleKey === ruleKey);
  },
}));
