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
  Activity: 'PiActivityDuotone',
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
  const lucideRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];?/g;
  
  let hasChanges = false;
  let replacements = []; // original -> new
  
  content = content.replace(lucideRegex, (match, importsStr) => {
    hasChanges = true;
    const imports = importsStr.split(',').map(i => i.trim()).filter(i => i);
    let newImports = [];
    
    imports.forEach(imp => {
      let originalName = imp;
      let alias = null;
      if (imp.includes(' as ')) {
        const parts = imp.split(' as ');
        originalName = parts[0].trim();
        alias = parts[1].trim();
      }
      
      const newName = iconMap[originalName];
      if (!newName) {
        console.log('MISSING MAPPING FOR:', originalName, 'in', file);
        return;
      }
      
      if (alias) {
        newImports.push(newName + ' as ' + alias);
      } else {
        newImports.push(newName);
        replacements.push({ old: originalName, new: newName });
      }
    });
    
    return 'import { ' + newImports.join(', ') + ' } from "react-icons/pi";';
  });
  
  if (hasChanges) {
    replacements.forEach(r => {
      // Replace JSX tags: <Icon ... /> or <Icon>
      const tagRegex = new RegExp('<' + r.old + '(\\\\s|>)', 'g');
      content = content.replace(tagRegex, '<' + r.new + '$1');
      
      const closingTagRegex = new RegExp('<\/' + r.old + '>', 'g');
      content = content.replace(closingTagRegex, '</' + r.new + '>');
      
      // Replace references like icon: Icon
      const refRegex = new RegExp('\\\\b' + r.old + '\\\\b', 'g');
      content = content.replace(refRegex, r.new);
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
