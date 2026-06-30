importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var degrees = parseInt(opts.deg || 90);
  try {
    var PDFDocument = PDFLib.PDFDocument, degreesLib = PDFLib.degrees;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    pdf.getPages().forEach(function(page) {
      page.setRotation(degreesLib((page.getRotation().angle + degrees) % 360));
    });
    self.postMessage({ progress: 90, label: 'Saving...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


