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
    color: '#6C63FF',
    bg: '#EDEBFF',
    ring: '#6C63FF',
  },
  rent: {
    id: 'rent',
    label: 'Оренда',
    icon: Home,
    color: '#F59E0B',
    bg: '#FEF3C7',
    ring: '#F59E0B',
  },
  utilities: {
    id: 'utilities',
    label: 'Комунальні послуги',
    icon: Receipt,
    color: '#20C9A6',
    bg: '#D6F5EC',
    ring: '#20C9A6',
  },
  internet: {
    id: 'internet',
    label: 'Інтернет',
    icon: Wifi,
    color: '#3B82F6',
    bg: '#DBEAFE',
    ring: '#3B82F6',
  },
  other: {
    id: 'other',
    label: 'Інше',
    icon: Sparkles,
    color: '#EC4899',
    bg: '#FCE7F3',
    ring: '#EC4899',
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
