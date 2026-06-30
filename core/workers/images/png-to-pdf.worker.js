
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    var pdf = await PDFDocument.create();
    for (var i = 0; i < files.length; i++) {
      self.postMessage({ progress: Math.round((i/files.length)*85), label: 'Embedding PNG ' + (i+1) + '/' + files.length });
      var img = await pdf.embedPng(files[i]);
      var page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
    }
    self.postMessage({ progress: 95, label: 'Saving...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


