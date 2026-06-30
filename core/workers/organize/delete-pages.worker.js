
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var src = await PDFDocument.load(files[0]);
    var total = src.getPageCount();
    var deleteStr = opts.deletePages || '';
    var toDelete = new Set();
    deleteStr.split(',').forEach(function(p) {
      p = p.trim();
      var m = p.match(/^(\d+)-(\d+)$/);
      if (m) { for(var i=parseInt(m[1]);i<=parseInt(m[2]);i++) toDelete.add(i); }
      else { var n=parseInt(p); if(!isNaN(n)) toDelete.add(n); }
    });
    var keepIndices = [];
    for (var i = 1; i <= total; i++) { if (!toDelete.has(i)) keepIndices.push(i-1); }
    if (!keepIndices.length) { self.postMessage({ error: 'Cannot delete all pages.' }); return; }
    self.postMessage({ progress: 50, label: 'Removing pages...' });
    var out = await PDFDocument.create();
    var pages = await out.copyPages(src, keepIndices);
    pages.forEach(function(p) { out.addPage(p); });
    self.postMessage({ progress: 90, label: 'Saving...' });
    var result = await out.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


