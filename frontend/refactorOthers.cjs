const fs = require('fs');

function refactorNotifications() {
  const path = 'd:/Internship/Project/frontend/src/pages/Notifications.jsx';
  let code = fs.readFileSync(path, 'utf8');
  
  if (!code.includes('import Button')) {
    code = code.replace(/import useFinanceStore from '\.\.\/store\/useFinanceStore';/, "import useFinanceStore from '../store/useFinanceStore';\nimport Button from '../components/Button';");
  }

  // Add states
  if (!code.includes('const [markingAll, setMarkingAll]')) {
    code = code.replace(/const \[isPushEnabled, setIsPushEnabled\] = useState\(true\);.*/, "const [isPushEnabled, setIsPushEnabled] = useState(true);\n  const [markingAll, setMarkingAll] = useState(false);\n  const [clearingAll, setClearingAll] = useState(false);\n  const [markingId, setMarkingId] = useState(null);\n  const [pushLoading, setPushLoading] = useState(false);");
  }

  // update markAllAsRead
  code = code.replace(/const markAllAsRead = async \(\) => \{\n\s*try \{/, "const markAllAsRead = async () => {\n    setMarkingAll(true);\n    try {");
  code = code.replace(/console\.error\(err\);\n\s*\}\n\s*\};/g, "console.error(err);\n    } finally {\n      setMarkingAll(false);\n      setClearingAll(false);\n      setMarkingId(null);\n    }\n  };");
  
  // update clearAll
  code = code.replace(/const clearAll = async \(\) => \{\n\s*try \{/, "const clearAll = async () => {\n    setClearingAll(true);\n    try {");

  // update markAsRead
  code = code.replace(/const markAsRead = async \(id\) => \{\n\s*try \{/, "const markAsRead = async (id) => {\n    setMarkingId(id);\n    try {");

  // update subscribeToPush
  code = code.replace(/const subscribeToPush = async \(\) => \{/, "const subscribeToPush = async () => {\n    setPushLoading(true);");
  code = code.replace(/toast\.error\('Failed to enable: ' \+ \(error\.message \|\| 'Unknown error'\)\);\n\s*\}/, "toast.error('Failed to enable: ' + (error.message || 'Unknown error'));\n    } finally {\n      setPushLoading(false);\n    }");

  // replace <button> with <Button>
  code = code.replace(/<button/g, '<Button');
  code = code.replace(/<\/button>/g, '</Button>');
  
  // assign isLoading states
  code = code.replace(/onClick=\{markAllAsRead\}/g, 'onClick={markAllAsRead} isLoading={markingAll}');
  code = code.replace(/onClick=\{clearAll\}/g, 'onClick={clearAll} isLoading={clearingAll}');
  code = code.replace(/onClick=\{subscribeToPush\}/g, 'onClick={subscribeToPush} isLoading={pushLoading}');
  code = code.replace(/onClick=\{\(\) => markAsRead\(notif\.id\)\}/g, 'onClick={() => markAsRead(notif.id)} isLoading={markingId === notif.id}');

  fs.writeFileSync(path, code);
}

function refactorSettings() {
  const path = 'd:/Internship/Project/frontend/src/pages/Settings.jsx';
  let code = fs.readFileSync(path, 'utf8');
  
  if (!code.includes('import Button')) {
    code = code.replace(/import { PiMoonDuotone/, "import Button from '../components/Button';\nimport { PiMoonDuotone");
  }

  // In settings, I already added setSaving in previous script, wait, let me check Settings.jsx
  
  code = code.replace(/<button/g, '<Button');
  code = code.replace(/<\/button>/g, '</Button>');
  
  // Clean up PiSpinnerGap injection
  code = code.replace(/\{saving && <PiSpinnerGap className="animate-spin" size=\{18\} \/>\} /, '');
  code = code.replace(/disabled=\{saving\}/g, 'isLoading={saving}');

  fs.writeFileSync(path, code);
}

refactorNotifications();
refactorSettings();
console.log('Refactored Settings and Notifications');
