
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;

  var filter = opts.scanFilter || 'monochrome';

  try {
    var PDFDocument = PDFLib.PDFDocument;
    var pdf = await PDFDocument.create();

    for (var i = 0; i < files.length; i++) {
      self.postMessage({ progress: 10 + Math.round((i / files.length) * 80), label: 'Processing image ' + (i+1) + '/' + files.length });

      var isPng = new Uint8Array(files[i].slice(0, 4))[0] === 0x89;

      var img = isPng ? await pdf.embedPng(files[i]) : await pdf.embedJpg(files[i]);
      var page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    self.postMessage({ progress: 95, label: 'Saving scanned document...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Scan to PDF failed: ' + err.message });
  }
};


