
importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var src = await pdfjsLib.getDocument({ data: files[0] }).promise;
    var PDFDocument = PDFLib.PDFDocument;
    var newPdf = await PDFDocument.create();
    for (var i = 1; i <= src.numPages; i++) {
      self.postMessage({ progress: 5+Math.round((i/src.numPages)*85), label: 'Dark mode page '+i+'/'+src.numPages });
      var page = await src.getPage(i);
      var vp = page.getViewport({ scale: 1.5 });
      var canvas = new OffscreenCanvas(Math.round(vp.width), Math.round(vp.height));
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;

      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var d = imgData.data;
      for (var j = 0; j < d.length; j += 4) {

        var avg = (d[j]+d[j+1]+d[j+2])/3;
        d[j]   = avg > 200 ? 20 : Math.max(0, 255-d[j]-80);
        d[j+1] = avg > 200 ? 20 : Math.max(0, 255-d[j+1]-80);
        d[j+2] = avg > 200 ? 35 : Math.max(0, 255-d[j+2]-60);
      }
      ctx.putImageData(imgData, 0, 0);
      var blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      var img = await newPdf.embedJpg(await blob.arrayBuffer());
      var p = newPdf.addPage([img.width, img.height]);
      p.drawImage(img, { x:0, y:0, width:img.width, height:img.height });
    }
    self.postMessage({ result: (await newPdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


