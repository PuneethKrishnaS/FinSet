import React from 'react';
import { PiHouseDuotone, PiCoffeeDuotone, PiCarDuotone, PiLightningDuotone, PiFilmStripDuotone, PiToteDuotone, PiHeartbeatDuotone, PiDotsThree, PiBookDuotone, PiGraduationCapDuotone, PiBriefcaseDuotone, PiMonitorDuotone, PiDeviceMobileDuotone, PiAirplaneDuotone, PiGiftDuotone, PiHeartDuotone, PiCurrencyDollarDuotone, PiTShirtDuotone, PiWrenchDuotone, PiMusicNoteDuotone, PiScissorsDuotone, PiTicketDuotone } from "react-icons/pi";

export const ICON_MAP = {
  'PiHouseDuotone': PiHouseDuotone,
  'PiCoffeeDuotone': PiCoffeeDuotone,
  'PiCarDuotone': PiCarDuotone,
  'PiLightningDuotone': PiLightningDuotone,
  'PiFilmStripDuotone': PiFilmStripDuotone,
  'PiToteDuotone': PiToteDuotone,
  'PiHeartbeatDuotone': PiHeartbeatDuotone,
  'PiDotsThree': PiDotsThree,
  'PiBookDuotone': PiBookDuotone,
  'PiGraduationCapDuotone': PiGraduationCapDuotone,
  'PiBriefcaseDuotone': PiBriefcaseDuotone,
  'PiMonitorDuotone': PiMonitorDuotone,
  'PiDeviceMobileDuotone': PiDeviceMobileDuotone,
  'PiAirplaneDuotone': PiAirplaneDuotone,
  'PiGiftDuotone': PiGiftDuotone,
  'PiHeartDuotone': PiHeartDuotone,
  'PiCurrencyDollarDuotone': PiCurrencyDollarDuotone,
  'PiTShirtDuotone': PiTShirtDuotone,
  'PiWrenchDuotone': PiWrenchDuotone,
  'PiMusicNoteDuotone': PiMusicNoteDuotone,
  'PiScissorsDuotone': PiScissorsDuotone,
  'PiTicketDuotone': PiTicketDuotone
};

export const PREDEFINED_CATEGORIES = [
  { name: 'Housing', icon: 'PiHouseDuotone' },
  { name: 'Food & Dining', icon: 'PiCoffeeDuotone' },
  { name: 'Transportation', icon: 'PiCarDuotone' },
  { name: 'Utilities', icon: 'PiLightningDuotone' },
  { name: 'Entertainment', icon: 'PiFilmStripDuotone' },
  { name: 'Shopping', icon: 'PiToteDuotone' },
  { name: 'Health & Fitness', icon: 'PiHeartbeatDuotone' },
  { name: 'Education', icon: 'PiBookDuotone' },
  { name: 'Travel', icon: 'PiAirplaneDuotone' },
  { name: 'Gifts', icon: 'PiGiftDuotone' },
  { name: 'Electronics', icon: 'PiDeviceMobileDuotone' },
  { name: 'Clothing', icon: 'PiTShirtDuotone' },
  { name: 'Maintenance', icon: 'PiWrenchDuotone' },
  { name: 'Personal Care', icon: 'PiScissorsDuotone' },
  { name: 'Events', icon: 'PiTicketDuotone' }
];

export const getCategoryIcon = (iconName, size = 16, color = 'currentColor') => {
  const IconComponent = ICON_MAP[iconName] || PiDotsThree;
  return <IconComponent size={size} color={color} />;
};

export const getIconForCategory = (categoryObj, size = 16, color = 'currentColor') => {
  if (!categoryObj) return getCategoryIcon(null, size, color);
  const iconName = categoryObj.icon || PREDEFINED_CATEGORIES.find(pc => pc.name === categoryObj.name)?.icon;
  return getCategoryIcon(iconName, size, color);
};
