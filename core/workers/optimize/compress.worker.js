importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading...' });
    var pdf = await PDFDocument.load(files[0], { ignoreEncryption: true });
    pdf.setTitle(''); pdf.setAuthor(''); pdf.setSubject(''); pdf.setKeywords([]); pdf.setProducer(''); pdf.setCreator('');
    self.postMessage({ progress: 80, label: 'Saving optimized...' });
    var result = await pdf.save({ useObjectStreams: parseInt(opts.level||2) >= 2 });
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


