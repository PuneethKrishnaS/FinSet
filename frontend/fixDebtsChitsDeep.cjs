const fs = require('fs');

function fixDebts() {
  const path = 'src/pages/Debts.jsx';
  let code = fs.readFileSync(path, 'utf8');

  // Fix handleCreateDebt
  code = code.replace(/const handleCreateDebt = async \(e\) => \{\s*e\.preventDefault\(\);\s*try \{/, 
    "const handleCreateDebt = async (e) => {\n    e.preventDefault();\n    setCreatingDebt(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to record debt\.'\);\s*\}/, 
    "toast.error('Failed to record debt.');\n    } finally { setCreatingDebt(false); }");

  // Fix handleSettle
  code = code.replace(/const handleSettle = async \(debt\) => \{\s*try \{/, 
    "const handleSettle = async (debt) => {\n    setSettlingId(debt.id);\n    try {");
  code = code.replace(/toast\.error\('Failed to settle debt'\);\s*\}/, 
    "toast.error('Failed to settle debt');\n    } finally { setSettlingId(null); }");

  // Fix handleDelete
  code = code.replace(/const handleDelete = async \(\) => \{\s*if \(\!deleteConfirm\.id\) return;\s*try \{/, 
    "const handleDelete = async () => {\n    if (!deleteConfirm.id) return;\n    setDeletingId(deleteConfirm.id);\n    try {");
  code = code.replace(/toast\.error\('Failed to delete'\);\s*setDeleteConfirm\(\{ isOpen: false, id: null, type: null \}\);\s*\}/, 
    "toast.error('Failed to delete');\n    } finally { setDeletingId(null); setDeleteConfirm({ isOpen: false, id: null, type: null }); }");

  // Add states if missing
  if (!code.includes('const [creatingDebt, setCreatingDebt]')) {
    code = code.replace(/const \[paymentLoading, setPaymentLoading\] = useState\(false\);/, 
      "const [paymentLoading, setPaymentLoading] = useState(false);\n  const [creatingDebt, setCreatingDebt] = useState(false);\n  const [settlingId, setSettlingId] = useState(null);\n  const [deletingId, setDeletingId] = useState(null);");
  }

  // Update Create Debt button styling to match LogTransaction design
  code = code.replace(/<Button \s*type="submit" \s*isLoading=\{creatingDebt\}\s*className=\{`w-full font-bold py-3 px-4 rounded transition-all  active:scale-\[0\.98\] \$\{type === 'lent' \? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500\/20' : 'bg-destructive hover:bg-destructive\/90 text-white shadow-destructive\/20'\}`\}\s*>/, 
    `<Button 
              type="submit" 
              isLoading={creatingDebt}
              className={\`w-full flex items-center justify-center gap-2 py-4 rounded text-base font-bold text-white transition-all active:scale-[0.98] \${type === 'lent' ? 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25' : 'bg-destructive hover:bg-destructive/90 hover:shadow-destructive/25'}\`}
            >`);

  // Wait, if it wasn't replaced before, I need to match the original:
  code = code.replace(/<Button \s*type="submit" \s*className=\{`w-full font-bold py-3 px-4 rounded transition-all  active:scale-\[0\.98\] \$\{type === 'lent' \? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500\/20' : 'bg-destructive hover:bg-destructive\/90 text-white shadow-destructive\/20'\}`\}\s*>/, 
    `<Button 
              type="submit" 
              isLoading={creatingDebt}
              className={\`w-full flex items-center justify-center gap-2 py-4 rounded text-base font-bold text-white transition-all active:scale-[0.98] \${type === 'lent' ? 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25' : 'bg-destructive hover:bg-destructive/90 hover:shadow-destructive/25'}\`}
            >`);

  fs.writeFileSync(path, code);
}

function fixChits() {
  const path = 'src/pages/ChitFunds.jsx';
  let code = fs.readFileSync(path, 'utf8');

  // Fix handleCreateChit
  code = code.replace(/const handleCreateChit = async \(e\) => \{\s*e\.preventDefault\(\);\s*try \{/, 
    "const handleCreateChit = async (e) => {\n    e.preventDefault();\n    setCreatingChit(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to create chit fund'\);\s*\}/, 
    "toast.error('Failed to create chit fund');\n    } finally { setCreatingChit(false); }");

  // Fix handleJoinChit
  code = code.replace(/const handleJoinChit = async \(chitId\) => \{\s*try \{/, 
    "const handleJoinChit = async (chitId) => {\n    setJoiningId(chitId);\n    try {");
  code = code.replace(/toast\.error\('Failed to join chit fund'\);\s*\}/, 
    "toast.error('Failed to join chit fund');\n    } finally { setJoiningId(null); }");

  // Fix handleAddContribution
  code = code.replace(/const handleAddContribution = async \(e, chitId\) => \{\s*e\.preventDefault\(\);\s*try \{/, 
    "const handleAddContribution = async (e, chitId) => {\n    e.preventDefault();\n    setSavingContribution(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to add contribution'\);\s*\}/, 
    "toast.error('Failed to add contribution');\n    } finally { setSavingContribution(false); }");

  // Fix handleEditContributionSubmit
  code = code.replace(/const handleEditContributionSubmit = async \(e, id\) => \{\s*e\.preventDefault\(\);\s*try \{/, 
    "const handleEditContributionSubmit = async (e, id) => {\n    e.preventDefault();\n    setSavingContribution(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to update contribution'\);\s*\}/, 
    "toast.error('Failed to update contribution');\n    } finally { setSavingContribution(false); }");

  // Fix handleDelete
  code = code.replace(/const handleDelete = async \(\) => \{\s*if \(\!deleteConfirmId\) return;\s*try \{/, 
    "const handleDelete = async () => {\n    if (!deleteConfirmId) return;\n    setDeletingId(deleteConfirmId);\n    try {");
  code = code.replace(/toast\.error\('Failed to delete chit fund'\);\s*setDeleteConfirmId\(null\);\s*\}/, 
    "toast.error('Failed to delete chit fund');\n    } finally { setDeletingId(null); setDeleteConfirmId(null); }");

  if (!code.includes('const [creatingChit, setCreatingChit]')) {
    code = code.replace(/const \[expandedChitId, setExpandedChitId\] = useState\(null\);/, 
      "const [expandedChitId, setExpandedChitId] = useState(null);\n  const [creatingChit, setCreatingChit] = useState(false);\n  const [joiningId, setJoiningId] = useState(null);\n  const [savingContribution, setSavingContribution] = useState(false);\n  const [deletingId, setDeletingId] = useState(null);");
  }

  // Large button style for Create Chit Fund
  code = code.replace(/<Button type="submit" isLoading=\{creatingChit\} className="bg-primary hover:bg-primary\/90 text-primary-foreground font-bold py-2\.5 px-6 rounded transition-colors ">/g, 
    '<Button type="submit" isLoading={creatingChit} className="w-full flex items-center justify-center gap-2 py-4 rounded text-base font-bold text-white transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 hover:shadow-primary/25">');

  code = code.replace(/<Button type="submit" className="bg-primary hover:bg-primary\/90 text-primary-foreground font-bold py-2\.5 px-6 rounded transition-colors ">/g, 
    '<Button type="submit" isLoading={creatingChit} className="w-full flex items-center justify-center gap-2 py-4 rounded text-base font-bold text-white transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 hover:shadow-primary/25">');

  fs.writeFileSync(path, code);
}

fixDebts();
fixChits();
console.log('Fixed Deep Debts and Chits');
