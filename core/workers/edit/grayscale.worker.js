
importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 5, label: 'Loading PDF...' });
    var src = await pdfjsLib.getDocument({ data: files[0] }).promise;
    var PDFDocument = PDFLib.PDFDocument;
    var newPdf = await PDFDocument.create();
    for (var i = 1; i <= src.numPages; i++) {
      self.postMessage({ progress: 5+Math.round((i/src.numPages)*85), label: 'Converting page '+i+'/'+src.numPages });
      var page = await src.getPage(i);
      var vp = page.getViewport({ scale: 1.5 });
      var canvas = new OffscreenCanvas(Math.round(vp.width), Math.round(vp.height));
      var ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: vp }).promise;

      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var d = imgData.data;
      for (var j = 0; j < d.length; j += 4) {
        var gray = 0.299*d[j] + 0.587*d[j+1] + 0.114*d[j+2];
        d[j] = d[j+1] = d[j+2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
      var blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      var img = await newPdf.embedJpg(await blob.arrayBuffer());
      var p = newPdf.addPage([img.width, img.height]);
      p.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
    }
    self.postMessage({ progress: 96, label: 'Saving...' });
    var result = await newPdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


