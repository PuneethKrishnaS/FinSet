import React from 'react';
import { 
  Home, Coffee, Car, Zap, Film, ShoppingBag, HeartPulse, MoreHorizontal, 
  Book, GraduationCap, Briefcase, Monitor, Smartphone, Plane, 
  Gift, Heart, DollarSign, Shirt, Wrench, Music, Scissors, Ticket
} from 'lucide-react';

export const ICON_MAP = {
  'Home': Home,
  'Coffee': Coffee,
  'Car': Car,
  'Zap': Zap,
  'Film': Film,
  'ShoppingBag': ShoppingBag,
  'HeartPulse': HeartPulse,
  'MoreHorizontal': MoreHorizontal,
  'Book': Book,
  'GraduationCap': GraduationCap,
  'Briefcase': Briefcase,
  'Monitor': Monitor,
  'Smartphone': Smartphone,
  'Plane': Plane,
  'Gift': Gift,
  'Heart': Heart,
  'DollarSign': DollarSign,
  'Shirt': Shirt,
  'Wrench': Wrench,
  'Music': Music,
  'Scissors': Scissors,
  'Ticket': Ticket
};

export const PREDEFINED_CATEGORIES = [
  { name: 'Housing', icon: 'Home' },
  { name: 'Food & Dining', icon: 'Coffee' },
  { name: 'Transportation', icon: 'Car' },
  { name: 'Utilities', icon: 'Zap' },
  { name: 'Entertainment', icon: 'Film' },
  { name: 'Shopping', icon: 'ShoppingBag' },
  { name: 'Health & Fitness', icon: 'HeartPulse' },
  { name: 'Education', icon: 'Book' },
  { name: 'Travel', icon: 'Plane' },
  { name: 'Gifts', icon: 'Gift' },
  { name: 'Electronics', icon: 'Smartphone' },
  { name: 'Clothing', icon: 'Shirt' },
  { name: 'Maintenance', icon: 'Wrench' },
  { name: 'Personal Care', icon: 'Scissors' },
  { name: 'Events', icon: 'Ticket' }
];

export const getCategoryIcon = (iconName, size = 16, color = 'currentColor') => {
  const IconComponent = ICON_MAP[iconName] || MoreHorizontal;
  return <IconComponent size={size} color={color} />;
};

export const getIconForCategory = (categoryObj, size = 16, color = 'currentColor') => {
  if (!categoryObj) return getCategoryIcon(null, size, color);
  const iconName = categoryObj.icon || PREDEFINED_CATEGORIES.find(pc => pc.name === categoryObj.name)?.icon;
  return getCategoryIcon(iconName, size, color);
};
