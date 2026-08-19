import { useCategoryStore } from '../store/categoryStore';

export const CATEGORIES = new Proxy([], {
  get(target, prop) {
    const activeList = useCategoryStore.getState().categories || [];
    const val = Reflect.get(activeList, prop);
    if (typeof val === 'function') {
      return val.bind(activeList);
    }
    return val;
  }
});

export function getCategoryBySlug(slug) {
  return useCategoryStore.getState().getCategoryBySlug(slug);
}

export function getCategoryByRuleKey(ruleKey) {
  return useCategoryStore.getState().getCategoryByRuleKey(ruleKey);
}
