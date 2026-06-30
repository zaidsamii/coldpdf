
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function extractText(arrayBuffer) {
  var loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  var pdf = await loadingTask.promise;
  var lines = [];
  for (var i = 1; i <= pdf.numPages; i++) {
    var page = await pdf.getPage(i);
    var content = await page.getTextContent();
    content.items.forEach(function(item) {
      if (item.str.trim()) lines.push(item.str.trim());
    });
  }
  return lines;
}

self.onmessage = async function(e) {
  var files = e.data.files;
  if (files.length < 2) {
    self.postMessage({ error: 'Please select two PDF files to compare.' });
    return;
  }
  try {
    self.postMessage({ progress: 20, label: 'Reading first PDF...' });
    var doc1 = await extractText(files[0]);

    self.postMessage({ progress: 50, label: 'Reading second PDF...' });
    var doc2 = await extractText(files[1]);

    self.postMessage({ progress: 80, label: 'Comparing document text lines...' });
    var diffLines = [];
    diffLines.push('=== ColdPDF Document Comparison Report ===');
    diffLines.push('PDF 1 Lines Count: ' + doc1.length);
    diffLines.push('PDF 2 Lines Count: ' + doc2.length);
    diffLines.push('===========================================\n');

    var max = Math.max(doc1.length, doc2.length);
    for (var i = 0; i < max; i++) {
      var l1 = doc1[i] || '';
      var l2 = doc2[i] || '';
      if (l1 !== l2) {
        diffLines.push('Line ' + (i+1) + ':');
        if (l1) diffLines.push('-: ' + l1);
        if (l2) diffLines.push('+: ' + l2);
        diffLines.push('');
      }
    }

    if (diffLines.length === 4) {
      diffLines.push('No differences found. The text matches exactly.');
    }

    var encoder = new TextEncoder();
    var arrayBuffer = encoder.encode(diffLines.join('\n')).buffer;
    self.postMessage({ result: arrayBuffer });
  } catch(err) {
    self.postMessage({ error: 'Comparison failed: ' + err.message });
  }
};


