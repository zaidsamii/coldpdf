
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument, degrees = PDFLib.degrees;

    self.postMessage({ progress: 20, label: 'Loading original PDF...' });
    var src = await PDFDocument.load(files[0]);
    var out = await PDFDocument.create();

    var pageState = opts.pageState || [];
    if (pageState.length === 0) {
      self.postMessage({ error: 'No pages left to process.' });
      return;
    }

    self.postMessage({ progress: 40, label: 'Processing ' + pageState.length + ' pages...' });

    var indicesToCopy = pageState.map(function(s) { return s.originalIndex; });
    var copiedPages = await out.copyPages(src, indicesToCopy);

    for (var i = 0; i < copiedPages.length; i++) {
      var page = copiedPages[i];
      var state = pageState[i];

      out.addPage(page);

      if (state.rotation) {

        var currentRot = page.getRotation().angle || 0;
        var newRot = (currentRot + state.rotation) % 360;
        page.setRotation(degrees(newRot));
      }
    }

    self.postMessage({ progress: 90, label: 'Saving modified PDF...' });
    var result = await out.save();
    self.postMessage({ result: result.buffer });
  } catch (err) {
    self.postMessage({ error: 'Visual Editor failed: ' + err.message });
  }
};


