import {
  ShoppingCart,
  Home,
  Receipt,
  Wifi,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type CategoryId = 'groceries' | 'rent' | 'utilities' | 'internet' | 'other';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  ring: string;
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  groceries: {
    id: 'groceries',
    label: 'Продукти',
    icon: ShoppingCart,
    color: 'rgb(var(--cat-groceries))',
    bg: 'rgb(var(--cat-groceries-bg))',
    ring: 'rgb(var(--cat-groceries))',
  },
  rent: {
    id: 'rent',
    label: 'Оренда',
    icon: Home,
    color: 'rgb(var(--cat-rent))',
    bg: 'rgb(var(--cat-rent-bg))',
    ring: 'rgb(var(--cat-rent))',
  },
  utilities: {
    id: 'utilities',
    label: 'Комунальні послуги',
    icon: Receipt,
    color: 'rgb(var(--cat-utilities))',
    bg: 'rgb(var(--cat-utilities-bg))',
    ring: 'rgb(var(--cat-utilities))',
  },
  internet: {
    id: 'internet',
    label: 'Інтернет',
    icon: Wifi,
    color: 'rgb(var(--cat-internet))',
    bg: 'rgb(var(--cat-internet-bg))',
    ring: 'rgb(var(--cat-internet))',
  },
  other: {
    id: 'other',
    label: 'Інше',
    icon: Sparkles,
    color: 'rgb(var(--cat-other))',
    bg: 'rgb(var(--cat-other-bg))',
    ring: 'rgb(var(--cat-other))',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const AVATAR_COLORS = [
  { bg: '#6C63FF', text: '#FFFFFF' },
  { bg: '#20C9A6', text: '#FFFFFF' },
  { bg: '#F59E0B', text: '#FFFFFF' },
  { bg: '#3B82F6', text: '#FFFFFF' },
  { bg: '#EC4899', text: '#FFFFFF' },
  { bg: '#14B8A6', text: '#FFFFFF' },
  { bg: '#F97316', text: '#FFFFFF' },
  { bg: '#0EA5E9', text: '#FFFFFF' },
];

export type SplitMode = 'equal' | 'manual';
