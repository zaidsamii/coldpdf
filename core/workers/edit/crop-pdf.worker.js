
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var cropL = parseFloat(opts.cropLeft || 10) / 100;
  var cropR = parseFloat(opts.cropRight || 10) / 100;
  var cropT = parseFloat(opts.cropTop || 10) / 100;
  var cropB = parseFloat(opts.cropBottom || 10) / 100;

  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 25, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var pages = pdf.getPages();

    self.postMessage({ progress: 50, label: 'Cropping pages...' });
    pages.forEach(function(page, i) {
      var box = page.getMediaBox();
      var newX = box.x + box.width * cropL;
      var newY = box.y + box.height * cropB;
      var newW = box.width * (1 - cropL - cropR);
      var newH = box.height * (1 - cropT - cropB);

      page.setMediaBox(newX, newY, newW, newH);
      page.setCropBox(newX, newY, newW, newH);
      self.postMessage({ progress: 50 + Math.round((i / pages.length) * 35), label: 'Page ' + (i+1) + '/' + pages.length });
    });

    self.postMessage({ progress: 90, label: 'Saving cropped PDF...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Crop PDF failed: ' + err.message });
  }
};


