const fs = require('fs');

const path = 'src/pages/History.jsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import Button')) {
  code = code.replace(/import React/, "import Button from '../components/Button';\nimport React");
}

// Add deletingId
if (!code.includes('const [deletingId, setDeletingId] = useState(null)')) {
  code = code.replace(/const \[deleteConfirmInfo, setDeleteConfirmInfo\] = useState\(\{ isOpen: false, id: null, type: null \}\);/, 
    "const [deleteConfirmInfo, setDeleteConfirmInfo] = useState({ isOpen: false, id: null, type: null });\n  const [deletingId, setDeletingId] = useState(null);");
}

// Update handleDelete
code = code.replace(/const handleDelete = async \(\) => \{\n\s*const \{ id, type \} = deleteConfirmInfo;\n\s*try \{/, 
  "const handleDelete = async () => {\n    const { id, type } = deleteConfirmInfo;\n    setDeletingId(id);\n    try {");
code = code.replace(/toast\.error\('Failed to delete transaction'\);\n\s*setDeleteConfirmInfo\(\{ isOpen: false, id: null, type: null \}\);\n\s*\}/, 
  "toast.error('Failed to delete transaction');\n    } finally {\n      setDeletingId(null);\n      setDeleteConfirmInfo({ isOpen: false, id: null, type: null });\n    }");

// Replace <button> with <Button>
code = code.replace(/<button/g, '<Button');
code = code.replace(/<\/button>/g, '</Button>');

// Bind isLoading to delete button
code = code.replace(/onClick=\{\(\) => confirmDelete\(t\.id, t\.type\)\} \n\s*className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive\/10 rounded-full transition-colors opacity-0 md:group-hover:opacity-100 flex items-center justify-center focus:opacity-100"/g, 
  `onClick={() => confirmDelete(t.id, t.type)} 
                                isLoading={deletingId === t.id}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 md:group-hover:opacity-100 flex items-center justify-center focus:opacity-100"`);

// Bind isLoading to ConfirmDialog
code = code.replace(/<ConfirmDialog \n\s*isOpen=\{deleteConfirmInfo\.isOpen\}/, 
  "<ConfirmDialog \n        isOpen={deleteConfirmInfo.isOpen}\n        isLoading={deletingId !== null}");

fs.writeFileSync(path, code);
console.log('Fixed History.jsx');
