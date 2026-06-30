importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
function parseRange(str, total) {
  if (!str || str.trim() === '' || str.trim() === 'all') { var a=[]; for(var i=0;i<total;i++) a.push(i); return a; }
  var idx = [];
  str.split(',').forEach(function(p) {
    p = p.trim();
    var m = p.match(/^(\d+)-(\d+)$/);
    if (m) { 
      var start = parseInt(m[1]) - 1;
      var end = parseInt(m[2]) - 1;
      var min = Math.min(start, end), max = Math.max(start, end);
      for(var i = min; i <= max && i < total; i++) { if (i >= 0) idx.push(i); } 
    }
    else { var n = parseInt(p) - 1; if(!isNaN(n) && n >= 0 && n < total) idx.push(n); }
  });
  return idx;
}
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading...' });
    var src = await PDFDocument.load(files[0]);
    var total = src.getPageCount();
    var indices = parseRange(opts.pageRange, total);
    if (!indices.length) { self.postMessage({ error: 'No valid pages in range. Total pages: ' + total }); return; }
    self.postMessage({ progress: 50, label: 'Extracting ' + indices.length + ' pages...' });
    var out = await PDFDocument.create();
    var pages = await out.copyPages(src, indices);
    pages.forEach(function(p) { out.addPage(p); });
    self.postMessage({ progress: 90, label: 'Saving...' });
    var result = await out.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


