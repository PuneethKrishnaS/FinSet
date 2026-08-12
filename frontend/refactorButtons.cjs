const fs = require('fs');

const files = ['Budget.jsx', 'Debts.jsx', 'ChitFunds.jsx'];
files.forEach(f => {
  const path = 'd:/Internship/Project/frontend/src/pages/' + f;
  let code = fs.readFileSync(path, 'utf8');
  
  if (!code.includes('import Button from')) {
    code = code.replace(/import React/, "import Button from '../components/Button';\nimport React");
  }
  
  // Clean up the PiSpinnerGap injections because Button handles it
  code = code.replace(/\{saving && <PiSpinnerGap className="animate-spin" size=\{18\} \/>\}\s*/g, '');
  code = code.replace(/\{joining && <PiSpinnerGap className="animate-spin" size=\{18\} \/>\}\s*/g, '');
  
  // Replace <button with <Button
  code = code.replace(/<button\b/g, '<Button');
  // Replace </button> with </Button>
  code = code.replace(/<\/button>/g, '</Button>');
  
  // Map disabled={saving} to isLoading={saving}
  code = code.replace(/disabled=\{saving\}/g, 'isLoading={saving}');
  // Map disabled={joining} to isLoading={joining}
  code = code.replace(/disabled=\{joining\}/g, 'isLoading={joining}');
  
  fs.writeFileSync(path, code);
});
console.log('Refactored buttons in Budget, Debts, ChitFunds');
