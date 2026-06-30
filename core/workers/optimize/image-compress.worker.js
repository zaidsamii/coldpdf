
importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var quality = parseFloat(opts.quality || 0.6);
  var scale = parseFloat(opts.scale || 1.0);
  try {
    self.postMessage({ progress: 5, label: 'Loading PDF...' });
    var srcPdf = await pdfjsLib.getDocument({ data: files[0] }).promise;
    var PDFDocument = PDFLib.PDFDocument;
    var newPdf = await PDFDocument.create();
    for (var i = 1; i <= srcPdf.numPages; i++) {
      self.postMessage({ progress: 5 + Math.round((i/srcPdf.numPages)*85), label: 'Resampling page ' + i + '/' + srcPdf.numPages });
      var page = await srcPdf.getPage(i);
      var vp = page.getViewport({ scale: scale });
      var canvas = new OffscreenCanvas(Math.round(vp.width), Math.round(vp.height));
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      var blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: quality });
      var imgBuf = await blob.arrayBuffer();
      var img = await newPdf.embedJpg(imgBuf);
      var newPage = newPdf.addPage([img.width, img.height]);
      newPage.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
    }
    self.postMessage({ progress: 95, label: 'Saving...' });
    var result = await newPdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


