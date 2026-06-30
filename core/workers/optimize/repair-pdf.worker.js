
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Reading raw byte stream...' });

    self.postMessage({ progress: 40, label: 'Attempting recovery parse...' });

    var pdf = await PDFDocument.load(files[0], {
      ignoreEncryption: true,
      throwOnInvalidObject: false
    });

    self.postMessage({ progress: 65, label: 'Rebuilding page tree structure...' });
    var fresh = await PDFDocument.create();
    var indices = pdf.getPageIndices();

    var pagesCount = 0;
    for (var i = 0; i < indices.length; i++) {
      try {
        var copied = await fresh.copyPages(pdf, [indices[i]]);
        fresh.addPage(copied[0]);
        pagesCount++;
      } catch (pageErr) {

      }
    }

    self.postMessage({ progress: 90, label: 'Re-serializing clean cross-reference table...' });
    var result = await fresh.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Repair failed: ' + err.message });
  }
};


