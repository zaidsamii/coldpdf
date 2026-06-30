
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument, rgb = PDFLib.rgb;

    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var pages = pdf.getPages();

    var strokes = opts.strokes || [];
    self.postMessage({ progress: 40, label: 'Applying ' + strokes.length + ' strokes...' });

    for (var i = 0; i < strokes.length; i++) {
      var stroke = strokes[i];
      if (stroke.pageIndex < 0 || stroke.pageIndex >= pages.length) continue;

      var page = pages[stroke.pageIndex];
      var ph = page.getHeight();

      if (!stroke.points || stroke.points.length < 2) continue;

      var path = 'M ' + stroke.points[0].x + ' ' + (ph - stroke.points[0].y);
      for (var p = 1; p < stroke.points.length; p++) {
        path += ' L ' + stroke.points[p].x + ' ' + (ph - stroke.points[p].y);
      }

      var col = stroke.color;

      page.drawSvgPath(path, {
        borderColor: rgb(col[0], col[1], col[2]),
        borderWidth: stroke.thickness,
        borderOpacity: stroke.opacity !== undefined ? stroke.opacity : 1.0,
        color: undefined
      });

      if (i % 10 === 0) {
        self.postMessage({ progress: 40 + Math.round((i / strokes.length) * 40), label: 'Drawing...' });
      }
    }

    self.postMessage({ progress: 90, label: 'Saving PDF...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Mark PDF Visual failed: ' + err.message });
  }
};


