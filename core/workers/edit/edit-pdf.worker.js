
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var addText = opts.addText || '';
  var textX = parseInt(opts.textX || 50);
  var textY = parseInt(opts.textY || 50);
  var textSize = parseInt(opts.textSize || 12);
  var targetPage = parseInt(opts.targetPage || 1) - 1;

  try {
    var PDFDocument = PDFLib.PDFDocument, rgb = PDFLib.rgb, StandardFonts = PDFLib.StandardFonts;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var font = await pdf.embedFont(StandardFonts.Helvetica);
    var pages = pdf.getPages();

    if (addText.trim()) {
      self.postMessage({ progress: 50, label: 'Adding text overlay...' });
      if (targetPage >= 0 && targetPage < pages.length) {
        var page = pages[targetPage];
        page.drawText(addText, {
          x: textX,
          y: textY,
          size: textSize,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
    }

    self.postMessage({ progress: 85, label: 'Saving changes...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Edit PDF failed: ' + err.message });
  }
};


