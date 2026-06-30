
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var afterPages = (opts.afterPages||'').split(',').map(function(s){ return parseInt(s.trim()); }).filter(function(n){ return !isNaN(n); });
  var count = parseInt(opts.blankCount||1);
  try {
    var PDFDocument = PDFLib.PDFDocument;
    var src = await PDFDocument.load(files[0]);
    var total = src.getPageCount();
    var out = await PDFDocument.create();
    var pages = await out.copyPages(src, src.getPageIndices());
    var insertSet = new Set(afterPages);
    var inserted = [];
    pages.forEach(function(page, i) {
      inserted.push(page);
      if (insertSet.has(i+1)) {
        var sample = pages[i];
        for (var b = 0; b < count; b++) {
          inserted.push(out.addPage([sample.getWidth(), sample.getHeight()]));
          inserted.pop();
        }
      }
    });

    var out2 = await PDFDocument.create();
    var srcPages = await out2.copyPages(src, src.getPageIndices());
    var refW = srcPages[0].getWidth(), refH = srcPages[0].getHeight();
    var pageIdx = 0;
    srcPages.forEach(function(pg, i) {
      out2.addPage(pg);
      if (insertSet.has(i+1)) {
        for (var b = 0; b < count; b++) out2.addPage([refW, refH]);
      }
    });
    self.postMessage({ result: (await out2.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


