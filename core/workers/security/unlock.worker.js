importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading encrypted PDF...' });
    var src = await PDFDocument.load(files[0], { password: opts.unlockPwd||'' });
    var fresh = await PDFDocument.create();
    var pages = await fresh.copyPages(src, src.getPageIndices());
    pages.forEach(function(p) { fresh.addPage(p); });
    self.postMessage({ progress: 90, label: 'Saving unlocked PDF...' });
    var result = await fresh.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: (err.message||'').toLowerCase().includes('password') ? 'Wrong password. Try again.' : err.message });
  }
};


