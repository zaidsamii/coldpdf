
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var times = parseInt(opts.duplicateTimes||2);
  var pagesStr = opts.duplicatePages||'all';
  try {
    var PDFDocument = PDFLib.PDFDocument;
    var src = await PDFDocument.load(files[0]);
    var total = src.getPageCount();
    var toDup;
    if (pagesStr==='all'||!pagesStr.trim()) { toDup=src.getPageIndices(); }
    else { toDup=pagesStr.split(',').map(function(s){return parseInt(s.trim())-1;}).filter(function(n){return n>=0&&n<total;}); }
    var out = await PDFDocument.create();
    var all = await out.copyPages(src, src.getPageIndices());
    all.forEach(function(p) { out.addPage(p); });
    for (var t = 1; t < times; t++) {
      var copies = await out.copyPages(src, toDup);
      copies.forEach(function(p) { out.addPage(p); });
    }
    self.postMessage({ result: (await out.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


