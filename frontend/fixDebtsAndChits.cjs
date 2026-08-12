const fs = require('fs');

function fixDebts() {
  const path = 'src/pages/Debts.jsx';
  let code = fs.readFileSync(path, 'utf8');

  // Add states
  if (!code.includes('const [creatingDebt, setCreatingDebt]')) {
    code = code.replace(/const \[paymentLoading, setPaymentLoading\] = useState\(false\);/, 
      "const [paymentLoading, setPaymentLoading] = useState(false);\n  const [creatingDebt, setCreatingDebt] = useState(false);\n  const [settlingId, setSettlingId] = useState(null);\n  const [deletingId, setDeletingId] = useState(null);");
  }

  // Create Debt
  code = code.replace(/const handleCreateDebt = async \(e\) => \{\n\s*e\.preventDefault\(\);\n\s*try \{/, 
    "const handleCreateDebt = async (e) => {\n    e.preventDefault();\n    setCreatingDebt(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to create debt'\);\n\s*\}/, 
    "toast.error('Failed to create debt');\n    } finally { setCreatingDebt(false); }");
  code = code.replace(/<Button \n\s*type="submit" \n\s*className=\{`w-full font-bold py-3 px-4 rounded transition-all  active:scale-\[0.98\] \$\{type === 'lent' \? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500\/20' : 'bg-destructive hover:bg-destructive\/90 text-white shadow-destructive\/20'\}`\}\n\s*>/, 
    `<Button 
              type="submit" 
              isLoading={creatingDebt}
              className={\`w-full font-bold py-3 px-4 rounded transition-all  active:scale-[0.98] \${type === 'lent' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20'}\`}
            >`);

  // Settle Debt
  code = code.replace(/const handleSettle = async \(debt\) => \{\n\s*try \{/, 
    "const handleSettle = async (debt) => {\n    setSettlingId(debt.id);\n    try {");
  code = code.replace(/toast\.error\('Failed to settle debt'\);\n\s*\}/, 
    "toast.error('Failed to settle debt');\n    } finally { setSettlingId(null); }");
  code = code.replace(/<Button \n\s*onClick=\{\(\) => handleSettle\(d\)\} \n\s*className="flex-1 flex items-center justify-center gap-2 bg-emerald-500\/10 hover:bg-emerald-500\/20 text-emerald-600 border border-emerald-500\/20 py-2.5 rounded text-sm font-bold transition-colors"\n\s*>/g, 
    `<Button 
                                onClick={() => handleSettle(d)} 
                                isLoading={settlingId === d.id}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 py-2.5 rounded text-sm font-bold transition-colors"
                              >`);

  // Delete
  code = code.replace(/const handleDelete = async \(\) => \{\n\s*if \(\!deleteConfirm\.id\) return;\n\s*try \{/, 
    "const handleDelete = async () => {\n    if (!deleteConfirm.id) return;\n    setDeletingId(deleteConfirm.id);\n    try {");
  code = code.replace(/toast\.error\('Failed to delete'\);\n\s*setDeleteConfirm\(\{ isOpen: false, id: null, type: null \}\);\n\s*\}/, 
    "toast.error('Failed to delete');\n    } finally { setDeletingId(null); setDeleteConfirm({ isOpen: false, id: null, type: null }); }");
  code = code.replace(/<ConfirmDialog \n\s*isOpen=\{deleteConfirm\.isOpen\}/, 
    "<ConfirmDialog \n        isOpen={deleteConfirm.isOpen}\n        isLoading={deletingId !== null}");

  // Payment Loading
  code = code.replace(/disabled=\{paymentLoading\}/g, 'isLoading={paymentLoading}');

  fs.writeFileSync(path, code);
}

function fixChits() {
  const path = 'src/pages/ChitFunds.jsx';
  let code = fs.readFileSync(path, 'utf8');

  // Add states
  if (!code.includes('const [creatingChit, setCreatingChit]')) {
    code = code.replace(/const \[expandedChitId, setExpandedChitId\] = useState\(null\);/, 
      "const [expandedChitId, setExpandedChitId] = useState(null);\n  const [creatingChit, setCreatingChit] = useState(false);\n  const [joiningId, setJoiningId] = useState(null);\n  const [savingContribution, setSavingContribution] = useState(false);\n  const [deletingId, setDeletingId] = useState(null);");
  }

  // Create Chit
  code = code.replace(/const handleCreateChit = async \(e\) => \{\n\s*e\.preventDefault\(\);\n\s*try \{/, 
    "const handleCreateChit = async (e) => {\n    e.preventDefault();\n    setCreatingChit(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to create chit fund'\);\n\s*\}/, 
    "toast.error('Failed to create chit fund');\n    } finally { setCreatingChit(false); }");
  code = code.replace(/<Button type="submit" className="bg-primary hover:bg-primary\/90 text-primary-foreground font-bold py-2.5 px-6 rounded transition-colors ">/, 
    '<Button type="submit" isLoading={creatingChit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded transition-colors ">');

  // Join Chit
  code = code.replace(/const handleJoinChit = async \(chitId\) => \{\n\s*try \{/, 
    "const handleJoinChit = async (chitId) => {\n    setJoiningId(chitId);\n    try {");
  code = code.replace(/toast\.error\('Failed to join chit fund'\);\n\s*\}/, 
    "toast.error('Failed to join chit fund');\n    } finally { setJoiningId(null); }");
  code = code.replace(/<Button \n\s*onClick=\{\(\) => handleJoinChit\(chit\.id\)\} \n\s*className="w-full mt-4 py-2 bg-primary\/10 text-primary font-bold rounded hover:bg-primary\/20 transition-colors"\n\s*>/g, 
    `<Button 
                          onClick={() => handleJoinChit(chit.id)} 
                          isLoading={joiningId === chit.id}
                          className="w-full mt-4 py-2 bg-primary/10 text-primary font-bold rounded hover:bg-primary/20 transition-colors"
                        >`);

  // Add Contribution
  code = code.replace(/const handleAddContribution = async \(e, chitId\) => \{\n\s*e\.preventDefault\(\);\n\s*try \{/, 
    "const handleAddContribution = async (e, chitId) => {\n    e.preventDefault();\n    setSavingContribution(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to add contribution'\);\n\s*\}/, 
    "toast.error('Failed to add contribution');\n    } finally { setSavingContribution(false); }");
  
  // Edit Contribution
  code = code.replace(/const handleEditContributionSubmit = async \(e, id\) => \{\n\s*e\.preventDefault\(\);\n\s*try \{/, 
    "const handleEditContributionSubmit = async (e, id) => {\n    e.preventDefault();\n    setSavingContribution(true);\n    try {");
  code = code.replace(/toast\.error\('Failed to update contribution'\);\n\s*\}/, 
    "toast.error('Failed to update contribution');\n    } finally { setSavingContribution(false); }");
  
  // Add Contribution Save Button
  code = code.replace(/<Button type="submit" className="bg-primary hover:bg-primary\/90 text-primary-foreground font-bold py-2\.5 px-5 rounded transition-colors text-sm">Save<\/Button>/g, 
    '<Button type="submit" isLoading={savingContribution} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-5 rounded transition-colors text-sm">Save</Button>');
  
  // Edit Contribution Save Button
  code = code.replace(/<Button type="submit" className="bg-primary text-primary-foreground text-xs font-bold py-1\.5 px-3 rounded">Save<\/Button>/g, 
    '<Button type="submit" isLoading={savingContribution} className="bg-primary text-primary-foreground text-xs font-bold py-1.5 px-3 rounded">Save</Button>');

  // Delete
  code = code.replace(/const handleDelete = async \(\) => \{\n\s*if \(\!deleteConfirmId\) return;\n\s*try \{/, 
    "const handleDelete = async () => {\n    if (!deleteConfirmId) return;\n    setDeletingId(deleteConfirmId);\n    try {");
  code = code.replace(/toast\.error\('Failed to delete chit fund'\);\n\s*setDeleteConfirmId\(null\);\n\s*\}/, 
    "toast.error('Failed to delete chit fund');\n    } finally { setDeletingId(null); setDeleteConfirmId(null); }");
  code = code.replace(/<ConfirmDialog \n\s*isOpen=\{deleteConfirmId !== null\}/, 
    "<ConfirmDialog \n        isOpen={deleteConfirmId !== null}\n        isLoading={deletingId !== null}");

  fs.writeFileSync(path, code);
}

fixDebts();
fixChits();
console.log('Fixed Debts and Chits buttons');
