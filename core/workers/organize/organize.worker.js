
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var orderStr = opts.pageOrder || '';

  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var src = await PDFDocument.load(files[0]);
    var totalPages = src.getPageCount();

    var indices;
    if (!orderStr.trim()) {
      indices = src.getPageIndices();
    } else {
      indices = orderStr.split(',').map(function(s) {
        return parseInt(s.trim()) - 1;
      }).filter(function(n) {
        return !isNaN(n) && n >= 0 && n < totalPages;
      });
    }

    if (indices.length === 0) {
      self.postMessage({ error: 'No valid pages in order: "' + orderStr + '"' });
      return;
    }

    self.postMessage({ progress: 50, label: 'Reorganizing pages...' });
    var out = await PDFDocument.create();
    var pages = await out.copyPages(src, indices);
    pages.forEach(function(p) { out.addPage(p); });

    self.postMessage({ progress: 90, label: 'Saving organized PDF...' });
    var result = await out.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: err.message });
  }
};


