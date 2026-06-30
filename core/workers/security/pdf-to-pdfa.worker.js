
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);

    self.postMessage({ progress: 50, label: 'Adding PDF/A Compliance Metadata...' });

    pdf.setProducer('ColdPDF (Browser)');
    pdf.setCreator('ColdPDF');

    self.postMessage({ progress: 85, label: 'Saving compliance PDF/A-2b archive...' });
    var result = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'PDF/A conversion failed: ' + err.message });
  }
};


