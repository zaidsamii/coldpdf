
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var src = await PDFDocument.load(files[0]);
    var total = src.getPageCount();
    var orderStr = opts.pageOrder || '';
    var indices;
    if (!orderStr.trim()) { indices = src.getPageIndices(); }
    else {
      indices = orderStr.split(',').map(function(s){ return parseInt(s.trim())-1; })
        .filter(function(n){ return !isNaN(n)&&n>=0&&n<total; });
    }
    if (!indices.length) { self.postMessage({ error: 'No valid page order.' }); return; }
    self.postMessage({ progress: 60, label: 'Reordering ' + indices.length + ' pages...' });
    var out = await PDFDocument.create();
    var pages = await out.copyPages(src, indices);
    pages.forEach(function(p) { out.addPage(p); });
    self.postMessage({ progress: 90, label: 'Saving...' });
    var result = await out.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


