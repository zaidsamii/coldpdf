
importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
);
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 5, label: 'Loading PDF...' });
    var pdf = await pdfjsLib.getDocument({ data: files[0] }).promise;
    var zip = new JSZip();
    for (var i = 1; i <= pdf.numPages; i++) {
      self.postMessage({ progress: 5 + Math.round((i/pdf.numPages)*88), label: 'Extracting page ' + i + '/' + pdf.numPages });
      var page = await pdf.getPage(i);
      var vp = page.getViewport({ scale: 2.0 });
      var canvas = new OffscreenCanvas(Math.round(vp.width), Math.round(vp.height));
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      var blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
      zip.file('image-' + String(i).padStart(3,'0') + '.jpg', await blob.arrayBuffer());
    }
    self.postMessage({ progress: 95, label: 'Zipping...' });
    self.postMessage({ result: await zip.generateAsync({ type: 'arraybuffer' }) });
  } catch(err) { self.postMessage({ error: err.message }); }
};


