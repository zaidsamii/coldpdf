
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 10, label: 'Loading PDF...' });
    var pdf = await pdfjsLib.getDocument({ data: files[0] }).promise;
    var lines = [];
    for (var i = 1; i <= pdf.numPages; i++) {
      self.postMessage({ progress: 10+Math.round((i/pdf.numPages)*80), label: 'Extracting page '+i+'/'+pdf.numPages });
      var page = await pdf.getPage(i);
      var content = await page.getTextContent();
      lines.push('=== Page ' + i + ' ===');
      var pageText = '';
      content.items.forEach(function(item) { pageText += item.str + (item.hasEOL ? '\n' : ' '); });
      lines.push(pageText.trim());
      lines.push('');
    }
    var text = lines.join('\n');
    var encoder = new TextEncoder();
    self.postMessage({ result: encoder.encode(text).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


