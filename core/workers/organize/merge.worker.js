importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    var merged = await PDFDocument.create();
    for (var i = 0; i < files.length; i++) {
      self.postMessage({ progress: Math.round((i / files.length) * 85), label: 'Merging ' + (i+1) + '/' + files.length });
      var pdf = await PDFDocument.load(files[i]);
      var pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(function(p) { merged.addPage(p); });
    }
    self.postMessage({ progress: 95, label: 'Saving...' });
    var result = await merged.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


