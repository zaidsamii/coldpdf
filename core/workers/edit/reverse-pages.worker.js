
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    var src = await PDFDocument.load(files[0]);
    var indices = src.getPageIndices().reverse();
    var out = await PDFDocument.create();
    var pages = await out.copyPages(src, indices);
    pages.forEach(function(p) { out.addPage(p); });
    self.postMessage({ result: (await out.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


