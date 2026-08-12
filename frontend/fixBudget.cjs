const fs = require('fs');

const path = 'src/pages/Budget.jsx';
let code = fs.readFileSync(path, 'utf8');

// Add states
if (!code.includes('const [creating, setCreating] = useState(false);')) {
  code = code.replace(/const \[deleteConfirmId, setDeleteConfirmId\] = useState\(null\);/, 
    "const [deleteConfirmId, setDeleteConfirmId] = useState(null);\n  const [creating, setCreating] = useState(false);\n  const [deletingId, setDeletingId] = useState(null);");
}

// handleCreateBudget
code = code.replace(/const handleCreateBudget = async \(e\) => \{\n\s*e\.preventDefault\(\);\n\s*try \{/, 
  "const handleCreateBudget = async (e) => {\n    e.preventDefault();\n    setCreating(true);\n    try {");
code = code.replace(/toast\.error\('Failed to create budget\.'\);\n\s*\}/, 
  "toast.error('Failed to create budget.');\n    } finally { setCreating(false); }");

// handleDeleteBudget
code = code.replace(/const handleDeleteBudget = async \(\) => \{\n\s*if \(\!deleteConfirmId\) return;\n\s*try \{/, 
  "const handleDeleteBudget = async () => {\n    if (!deleteConfirmId) return;\n    setDeletingId(deleteConfirmId);\n    try {");
code = code.replace(/toast\.error\('Failed to delete\.'\);\n\s*setDeleteConfirmId\(null\);\n\s*\}/, 
  "toast.error('Failed to delete.');\n    } finally { setDeletingId(null); setDeleteConfirmId(null); }");

// Delete Button
code = code.replace(/<Button \n\s*onClick=\{\(\) => confirmDeleteBudget\(b\.id\)\}\n\s*className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive\/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"/g, 
  `<Button 
                      onClick={() => confirmDeleteBudget(b.id)}
                      isLoading={deletingId === b.id}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"`);

// ConfirmDialog
code = code.replace(/<ConfirmDialog \n\s*isOpen=\{deleteConfirmId !== null\}/, 
  "<ConfirmDialog \n        isOpen={deleteConfirmId !== null}\n        isLoading={deletingId !== null}");

// Create Button string fix
code = code.replace(/PiFloppyDisk Budget/g, "Create Budget");
code = code.replace(/<Button \n\s*type="submit" \n\s*className="w-full bg-primary hover:bg-primary\/90 text-primary-foreground font-bold py-3 rounded transition-colors  active:scale-\[0.98\]"\n\s*>/g, 
  `<Button 
                type="submit" 
                isLoading={creating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded transition-colors  active:scale-[0.98]"
              >`);

fs.writeFileSync(path, code);
console.log('Fixed Budget');
