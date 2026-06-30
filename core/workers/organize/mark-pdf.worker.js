
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument, rgb = PDFLib.rgb;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var pages = pdf.getPages();
    var color = opts.markColor === 'red' ? rgb(1,0.2,0.2)
              : opts.markColor === 'blue' ? rgb(0.2,0.4,1)
              : rgb(1,0.9,0);

    pages.forEach(function(page) {
      var w = page.getWidth(), h = page.getHeight();
      page.drawRectangle({
        x: 0, y: h - 30, width: w, height: 20,
        color: color, opacity: 0.3
      });
    });
    self.postMessage({ progress: 90, label: 'Saving...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


