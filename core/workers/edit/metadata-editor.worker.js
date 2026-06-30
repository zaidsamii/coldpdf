
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    var pdf = await PDFDocument.load(files[0]);
    if (opts.metaTitle   !== undefined) pdf.setTitle(opts.metaTitle);
    if (opts.metaAuthor  !== undefined) pdf.setAuthor(opts.metaAuthor);
    if (opts.metaSubject !== undefined) pdf.setSubject(opts.metaSubject);
    if (opts.metaKeywords!== undefined) pdf.setKeywords(opts.metaKeywords.split(',').map(function(s){return s.trim();}));
    if (opts.metaCreator !== undefined) pdf.setCreator(opts.metaCreator);
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


