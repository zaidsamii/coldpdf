
importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js'
);

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var lang = opts.ocrLang || 'eng';

  try {
    self.postMessage({ progress: 10, label: 'Reading PDF pages...' });
    var loadingTask = pdfjsLib.getDocument({ data: files[0] });
    var pdf = await loadingTask.promise;
    var resultText = [];

    self.postMessage({ progress: 20, label: 'Initializing Tesseract OCR Engine...' });

    var worker = await Tesseract.createWorker({
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/worker.min.js',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js'
    });
    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    for (var i = 1; i <= pdf.numPages; i++) {
      self.postMessage({ progress: 20 + Math.round((i / pdf.numPages) * 70), label: 'OCR scan on page ' + i + '/' + pdf.numPages });
      var page = await pdf.getPage(i);
      var vp = page.getViewport({ scale: 1.5 });
      var canvas = new OffscreenCanvas(Math.round(vp.width), Math.round(vp.height));
      var ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: vp }).promise;

      var blob = await canvas.convertToBlob({ type: 'image/png' });
      var res = await worker.recognize(blob);
      resultText.push('--- Page ' + i + ' ---');
      resultText.push(res.data.text);
      resultText.push('\n');
    }

    await worker.terminate();

    var encoder = new TextEncoder();
    var arrayBuffer = encoder.encode(resultText.join('\n')).buffer;
    self.postMessage({ result: arrayBuffer });
  } catch(err) {
    self.postMessage({ error: 'OCR PDF failed: ' + err.message });
  }
};


