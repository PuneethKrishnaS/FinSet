const fs = require('fs');

const files = ['Login.jsx', 'Register.jsx', 'ForgotPassword.jsx', 'ResetPassword.jsx', 'LogTransaction.jsx'];
files.forEach(f => {
  const path = 'd:/Internship/Project/frontend/src/pages/' + f;
  let code = fs.readFileSync(path, 'utf8');
  
  if (!code.includes('import Button')) {
    code = code.replace(/import React/, "import Button from '../components/Button';\nimport React");
  }

  // Auth pages have `disabled={loading}`
  // LogTransaction has `disabled={submitting || !isFormValid}`
  
  code = code.replace(/\{loading && <PiSpinnerGap className="animate-spin" size=\{18\} \/>\}\\n?\s*/g, '');
  code = code.replace(/\{submitting && <PiSpinnerGap className="animate-spin" size=\{18\} \/>\}\\n?\s*/g, '');

  code = code.replace(/<button/g, '<Button');
  code = code.replace(/<\/button>/g, '</Button>');
  
  code = code.replace(/disabled=\{loading\}/g, 'isLoading={loading}');
  // LogTransaction trick
  code = code.replace(/disabled=\{submitting \|\| !isFormValid\}/g, 'isLoading={submitting} disabled={!isFormValid}');

  fs.writeFileSync(path, code);
});
console.log('Refactored Auth and LogTransaction');
