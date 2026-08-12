const fs = require('fs');

const pages = [
  'Login.jsx',
  'Register.jsx',
  'ForgotPassword.jsx',
  'ResetPassword.jsx',
  'LogTransaction.jsx',
  'Profile.jsx',
  'Settings.jsx',
  'Budget.jsx',
  'Debts.jsx',
  'ChitFunds.jsx'
];

pages.forEach(page => {
  const file = 'src/pages/' + page;
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Make sure PiSpinnerGap is imported from react-icons/pi
  if (!content.includes('PiSpinnerGap') && content.includes('react-icons/pi')) {
    content = content.replace(/} from ["']react-icons\/pi["'];/, ', PiSpinnerGap } from "react-icons/pi";');
  }

  // 1. Auth pages
  if (['Login.jsx', 'Register.jsx', 'ForgotPassword.jsx', 'ResetPassword.jsx'].includes(page)) {
    // These already have `loading` state.
    // Let's replace {loading ? '...' : (...)} with spinner
    content = content.replace(/{loading \? '[^']+' : \(([\s\S]*?)\)}/, '{loading && <PiSpinnerGap className="animate-spin" size={18} />}\n              $1');
  }
  
  // 2. LogTransaction
  if (page === 'LogTransaction.jsx') {
    // it uses submitting state
    content = content.replace(/disabled={submitting \|\| !isFormValid}/, 'disabled={submitting || !isFormValid}');
    content = content.replace(/{submitting \? 'Saving\.\.\.' : \(([\s\S]*?)\)}/, '{submitting && <PiSpinnerGap className="animate-spin" size={18} />}\n                    $1');
  }
  
  // 3. Profile
  if (page === 'Profile.jsx') {
    // Profile has updatingProfile and updatingPassword
    content = content.replace(/{updatingProfile \? 'Saving\.\.\.' : \(([\s\S]*?)\)}/, '{updatingProfile && <PiSpinnerGap className="animate-spin" size={18} />}\n                          $1');
    content = content.replace(/{updatingPassword \? 'Updating\.\.\.' : \(([\s\S]*?)\)}/, '{updatingPassword && <PiSpinnerGap className="animate-spin" size={18} />}\n                          $1');
  }
  
  // 4. Settings
  if (page === 'Settings.jsx') {
    // settings doesn't have saving state. We need to inject it.
    if (!content.includes('const [saving, setSaving]')) {
      content = content.replace(/const \[activeTab, setActiveTab\] = useState\('general'\);/, "const [activeTab, setActiveTab] = useState('general');\n  const [saving, setSaving] = useState(false);");
      content = content.replace(/const handleSave = \(\) => {/, "const handleSave = async () => {\n    setSaving(true);\n    // simulated delay\n    await new Promise(r => setTimeout(r, 600));");
      // Add finally block to handleSave
      // Since it's a dummy function, we just add setSaving(false)
      content = content.replace(/setTheme\(localTheme\);\n\s+toast\.success\('Preferences saved successfully'\);\n\s+}/, "setTheme(localTheme);\n    toast.success('Preferences saved successfully');\n    setSaving(false);\n  }");
      
      // Update button
      content = content.replace(/<button onClick={handleSave}/, '<button onClick={handleSave} disabled={saving}');
      content = content.replace(/Save Preferences/, '{saving && <PiSpinnerGap className="animate-spin" size={18} />} Save Preferences');
    }
  }
  
  // 5. Budget, Debts, ChitFunds
  // Budget
  if (page === 'Budget.jsx') {
    if (!content.includes('const [saving, setSaving]')) {
       content = content.replace(/const \[isCreateOpen, setIsCreateOpen\] = useState\(false\);/, "const [isCreateOpen, setIsCreateOpen] = useState(false);\n  const [saving, setSaving] = useState(false);");
       content = content.replace(/const handleSubmit = async \(e\) => {\n\s+e\.preventDefault\(\);/, "const handleSubmit = async (e) => {\n    e.preventDefault();\n    setSaving(true);");
       content = content.replace(/toast\.error\('Failed to save budget'\);\n\s+}/, "toast.error('Failed to save budget');\n    } finally { setSaving(false); }");
       
       content = content.replace(/<button\n\s+type="submit"\n\s+className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary\/90 transition-colors"\n\s+>/, '<button\n                          type="submit"\n                          disabled={saving}\n                          className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors flex items-center gap-2"\n                        >');
       content = content.replace(/Create Budget\n\s+<\/button>/, '{saving && <PiSpinnerGap className="animate-spin" size={18} />} Create Budget\n                        </button>');
    }
  }
  
  // Debts
  if (page === 'Debts.jsx') {
     if (!content.includes('const [saving, setSaving]')) {
       content = content.replace(/const \[isCreateOpen, setIsCreateOpen\] = useState\(false\);/, "const [isCreateOpen, setIsCreateOpen] = useState(false);\n  const [saving, setSaving] = useState(false);");
       content = content.replace(/const handleCreateDebt = async \(e\) => {\n\s+e\.preventDefault\(\);/, "const handleCreateDebt = async (e) => {\n    e.preventDefault();\n    setSaving(true);");
       content = content.replace(/toast\.error\('Failed to create debt'\);\n\s+}/, "toast.error('Failed to create debt');\n    } finally { setSaving(false); }");
       
       content = content.replace(/<button\n\s+type="submit"\n\s+className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary\/90 transition-colors"\n\s+>/, '<button\n                          type="submit"\n                          disabled={saving}\n                          className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors flex items-center gap-2"\n                        >');
       content = content.replace(/Add Debt\n\s+<\/button>/, '{saving && <PiSpinnerGap className="animate-spin" size={18} />} Add Debt\n                        </button>');
     }
  }
  
  // ChitFunds
  if (page === 'ChitFunds.jsx') {
     if (!content.includes('const [saving, setSaving]')) {
       content = content.replace(/const \[isCreateOpen, setIsCreateOpen\] = useState\(false\);/, "const [isCreateOpen, setIsCreateOpen] = useState(false);\n  const [saving, setSaving] = useState(false);\n  const [joining, setJoining] = useState(false);");
       
       content = content.replace(/const handleCreateChit = async \(e\) => {\n\s+e\.preventDefault\(\);/, "const handleCreateChit = async (e) => {\n    e.preventDefault();\n    setSaving(true);");
       content = content.replace(/toast\.error\('Failed to create chit fund'\);\n\s+}/, "toast.error('Failed to create chit fund');\n    } finally { setSaving(false); }");
       
       content = content.replace(/const handleJoinChit = async \(chitId\) => {\n\s+try {/, "const handleJoinChit = async (chitId) => {\n    setJoining(true);\n    try {");
       content = content.replace(/toast\.error\('Failed to join chit fund'\);\n\s+}/, "toast.error('Failed to join chit fund');\n    } finally { setJoining(false); }");
       
       content = content.replace(/<button\n\s+type="submit"\n\s+className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary\/90 transition-colors"\n\s+>/, '<button\n                          type="submit"\n                          disabled={saving}\n                          className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors flex items-center gap-2"\n                        >');
       content = content.replace(/Create Chit Fund\n\s+<\/button>/, '{saving && <PiSpinnerGap className="animate-spin" size={18} />} Create Chit Fund\n                        </button>');
       
       content = content.replace(/<button \n\s+onClick=\{\(\) => handleJoinChit\(chit\.id\)\}\n\s+className="w-full mt-4 py-2 bg-primary\/10 text-primary font-bold rounded hover:bg-primary\/20 transition-colors"\n\s+>/, '<button \n                          onClick={() => handleJoinChit(chit.id)}\n                          disabled={joining}\n                          className="w-full mt-4 py-2 bg-primary/10 text-primary font-bold rounded hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"\n                        >');
       content = content.replace(/Join Chit Fund\n\s+<\/button>/, '{joining && <PiSpinnerGap className="animate-spin" size={18} />} Join Chit Fund\n                        </button>');
     }
  }

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Added spinners to buttons!');
