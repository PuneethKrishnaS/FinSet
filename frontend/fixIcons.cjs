const fs = require('fs');

const iconMap = {
  // UI Icons -> Regular
  ArrowDownRight: 'PiArrowDownRight',
  ArrowLeft: 'PiArrowLeft',
  ArrowRight: 'PiArrowRight',
  ArrowRightLeft: 'PiArrowsLeftRight',
  ArrowUpRight: 'PiArrowUpRight',
  Check: 'PiCheck',
  CheckCircle: 'PiCheckCircle',
  CheckCircle2: 'PiCheckCircle',
  ChevronDown: 'PiCaretDown',
  ChevronLeft: 'PiCaretLeft',
  ChevronRight: 'PiCaretRight',
  ChevronUp: 'PiCaretUp',
  Download: 'PiDownload',
  Edit2: 'PiPencilSimple',
  Filter: 'PiFunnel',
  Info: 'PiInfo',
  Lock: 'PiLock',
  LogOut: 'PiSignOut',
  MinusCircle: 'PiMinusCircle',
  MoreHorizontal: 'PiDotsThree',
  MoreVertical: 'PiDotsThreeVertical',
  Plus: 'PiPlus',
  PlusCircle: 'PiPlusCircle',
  Save: 'PiFloppyDisk',
  Search: 'PiMagnifyingGlass',
  Settings: 'PiGear',
  Trash2: 'PiTrash',
  X: 'PiX',
  
  // Feature Icons -> Duotone
  Activity: 'PiPulseDuotone', // was PiActivityDuotone
  AlertCircle: 'PiWarningCircleDuotone',
  AlertTriangle: 'PiWarningDuotone',
  Bell: 'PiBellDuotone',
  Book: 'PiBookDuotone',
  Briefcase: 'PiBriefcaseDuotone',
  Calendar: 'PiCalendarDuotone',
  Car: 'PiCarDuotone',
  Coffee: 'PiCoffeeDuotone',
  CreditCard: 'PiCreditCardDuotone',
  DollarSign: 'PiCurrencyDollarDuotone',
  Film: 'PiFilmStripDuotone',
  Gift: 'PiGiftDuotone',
  Globe: 'PiGlobeDuotone',
  GraduationCap: 'PiGraduationCapDuotone',
  Heart: 'PiHeartDuotone',
  HeartPulse: 'PiHeartbeatDuotone',
  History: 'PiClockCounterClockwiseDuotone',
  Home: 'PiHouseDuotone',
  Layout: 'PiColumnsDuotone',
  LayoutDashboard: 'PiSquaresFourDuotone',
  Mail: 'PiEnvelopeDuotone',
  Monitor: 'PiMonitorDuotone',
  Moon: 'PiMoonDuotone',
  Music: 'PiMusicNoteDuotone',
  PieChart: 'PiChartPieDuotone',
  Plane: 'PiAirplaneDuotone',
  Scissors: 'PiScissorsDuotone',
  Shirt: 'PiTShirtDuotone',
  ShoppingBag: 'PiToteDuotone',
  Smartphone: 'PiDeviceMobileDuotone',
  Sun: 'PiSunDuotone',
  Target: 'PiTargetDuotone',
  Ticket: 'PiTicketDuotone',
  TrendingDown: 'PiTrendDownDuotone',
  TrendingUp: 'PiTrendUpDuotone',
  User: 'PiUserDuotone',
  UserPlus: 'PiUserPlusDuotone',
  Users: 'PiUsersDuotone',
  Wallet: 'PiWalletDuotone',
  Wrench: 'PiWrenchDuotone',
  Zap: 'PiLightningDuotone'
};

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = findFiles('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  // We'll replace all JSX tags <OldIcon and </OldIcon>
  // Also we'll replace {OldIcon} or { icon: OldIcon }
  // We can just use a word boundary replacement for all keys, but we should be careful not to replace random words.
  // Wait! If the file imports 'PiSquaresFourDuotone', we know it used 'LayoutDashboard' before.
  // So we only replace 'LayoutDashboard' with 'PiSquaresFourDuotone' IF 'PiSquaresFourDuotone' is in the file.
  
  for (const [oldName, newName] of Object.entries(iconMap)) {
    if (content.includes(newName)) {
      // Replace JSX opening tags
      const openRegex = new RegExp('<' + oldName + '(\\s|>)', 'g');
      if (openRegex.test(content)) {
        content = content.replace(openRegex, '<' + newName + '$1');
        hasChanges = true;
      }
      
      // Replace JSX closing tags
      const closeRegex = new RegExp('<\/' + oldName + '>', 'g');
      if (closeRegex.test(content)) {
        content = content.replace(closeRegex, '</' + newName + '>');
        hasChanges = true;
      }
      
      // Replace references like icon: OldIcon, but only exact word matches
      const refRegex = new RegExp('\\b' + oldName + '\\b', 'g');
      // But we shouldn't replace it if it's already newName (which we already checked, they are different).
      // We must avoid replacing the word if it's part of a string? Usually it's an identifier.
      // Let's just do a blanket word boundary replace for OldName -> NewName, EXCEPT in import statements?
      // Wait, the import statement already has NewName!
      // So OldName shouldn't be in the import statement anyway!
      if (refRegex.test(content)) {
        content = content.replace(refRegex, newName);
        hasChanges = true;
      }
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed usages in:', file);
  }
});
