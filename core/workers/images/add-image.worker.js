
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;

  if (files.length < 2) { self.postMessage({ error: 'Please provide both a PDF and an image file.' }); return; }
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 15, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    self.postMessage({ progress: 30, label: 'Loading image...' });
    var imgBytes = new Uint8Array(files[1].slice(0,4));
    var isPng = imgBytes[0]===0x89 && imgBytes[1]===0x50;
    var img = isPng ? await pdf.embedPng(files[1]) : await pdf.embedJpg(files[1]);
    var position = opts.position || 'bottom-right';
    var sizePercent = parseInt(opts.logoSize || 15) / 100;
    var pages = pdf.getPages();
    self.postMessage({ progress: 50, label: 'Stamping on ' + pages.length + ' pages...' });
    pages.forEach(function(page) {
      var w = page.getWidth(), h = page.getHeight();
      var imgW = w * sizePercent;
      var imgH = (img.height / img.width) * imgW;
      var margin = 20;
      var x = position.includes('right') ? w - imgW - margin : margin;
      var y = position.includes('top') ? h - imgH - margin : margin;
      page.drawImage(img, { x: x, y: y, width: imgW, height: imgH, opacity: parseFloat(opts.logoOpacity||1) });
    });
    self.postMessage({ progress: 92, label: 'Saving...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


