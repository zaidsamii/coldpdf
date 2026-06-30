
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;

  var sigText = opts.sigText || 'Signed Digitally';
  var sigPage = parseInt(opts.sigPage || 1) - 1;
  var sigX = parseInt(opts.sigX || 100);
  var sigY = parseInt(opts.sigY || 100);

  try {
    var PDFDocument = PDFLib.PDFDocument, rgb = PDFLib.rgb, StandardFonts = PDFLib.StandardFonts;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var pages = pdf.getPages();

    if (sigPage >= 0 && sigPage < pages.length) {
      var page = pages[sigPage];
      if (files.length >= 2) {
        self.postMessage({ progress: 50, label: 'Embedding signature image...' });
        var imgBytes = new Uint8Array(files[1].slice(0, 4));
        var isPng = imgBytes[0] === 0x89 && imgBytes[1] === 0x50;
        var sigImg = isPng ? await pdf.embedPng(files[1]) : await pdf.embedJpg(files[1]);
        page.drawImage(sigImg, {
          x: sigX,
          y: sigY,
          width: opts.sigWidth ? parseInt(opts.sigWidth) : 120,
          height: opts.sigHeight ? parseInt(opts.sigHeight) : 50
        });
      } else {
        self.postMessage({ progress: 50, label: 'Drawing signature text...' });
        var font = await pdf.embedFont(StandardFonts.CourierBoldOblique);
        page.drawText(sigText, {
          x: sigX,
          y: sigY,
          size: 14,
          font: font,
          color: rgb(0.05, 0.1, 0.4)
        });
        page.drawText('Date: ' + new Date().toISOString().slice(0, 10), {
          x: sigX,
          y: sigY - 14,
          size: 9,
          font: await pdf.embedFont(StandardFonts.Helvetica),
          color: rgb(0.3, 0.3, 0.3)
        });
      }
    }

    self.postMessage({ progress: 90, label: 'Saving signed PDF...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Sign PDF failed: ' + err.message });
  }
};


