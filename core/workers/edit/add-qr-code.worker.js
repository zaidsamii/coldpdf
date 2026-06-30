
importScripts(
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
);
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var qrText = opts.qrText || 'https://coldpdf.app';
  var qrSize = parseInt(opts.qrSize || 80);
  var position = opts.qrPosition || 'bottom-right';
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 10, label: 'Generating QR code...' });

    var qr = qrcode(0, 'M');
    qr.addData(qrText);
    qr.make();
    var modules = qr.getModuleCount();

    var canvas = new OffscreenCanvas(modules, modules);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, modules, modules);
    ctx.fillStyle = '#000000';
    for (var r = 0; r < modules; r++) {
      for (var c = 0; c < modules; c++) {
        if (qr.isDark(r, c)) ctx.fillRect(c, r, 1, 1);
      }
    }
    var qrBlob = await canvas.convertToBlob({ type: 'image/png' });
    var qrBuf = await qrBlob.arrayBuffer();
    self.postMessage({ progress: 40, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var qrImg = await pdf.embedPng(qrBuf);
    var pages = pdf.getPages();
    var margin = 15;
    pages.forEach(function(page, i) {
      var w = page.getWidth(), h = page.getHeight();
      var x = position.includes('right') ? w - qrSize - margin : margin;
      var y = position.includes('top') ? h - qrSize - margin : margin;
      page.drawImage(qrImg, { x: x, y: y, width: qrSize, height: qrSize });
      self.postMessage({ progress: 40+Math.round((i/pages.length)*50), label: 'Stamping page '+(i+1)+'/'+pages.length });
    });
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


