importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var password = opts.pwd1||'';
  if (!password) { self.postMessage({ error: 'Password cannot be empty.' }); return; }
  if (password !== opts.pwd2) { self.postMessage({ error: 'Passwords do not match.' }); return; }
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading...' });
    var pdf = await PDFDocument.load(files[0]);
    self.postMessage({ progress: 60, label: 'Encrypting...' });
    var result = await pdf.save({ userPassword: password, ownerPassword: password+'_owner', permissions: { printing:'highResolution', modifying:false, copying:false, annotating:false, fillingForms:false, contentAccessibility:true, documentAssembly:false } });
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


