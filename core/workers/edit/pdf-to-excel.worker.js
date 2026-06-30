
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 10, label: 'Reading PDF...' });
    var loadingTask = pdfjsLib.getDocument({ data: files[0] });
    var pdf = await loadingTask.promise;
    var csvLines = [];

    for (var i = 1; i <= pdf.numPages; i++) {
      self.postMessage({ progress: 10 + Math.round((i / pdf.numPages) * 75), label: 'Processing page ' + i + '/' + pdf.numPages });
      var page = await pdf.getPage(i);
      var textContent = await page.getTextContent();

      var rows = {};
      textContent.items.forEach(function(item) {
        if (!item.str.trim()) return;
        var y = Math.round(item.transform[5]);
        var x = item.transform[4];
        if (!rows[y]) {
          rows[y] = [];
        }
        rows[y].push({ text: item.str, x: x });
      });

      var sortedY = Object.keys(rows).map(Number).sort(function(a, b) { return b - a; });

      csvLines.push('--- PAGE ' + i + ' ---');
      sortedY.forEach(function(y) {

        var cols = rows[y].sort(function(a, b) { return a.x - b.x; });
        var rowText = cols.map(function(c) {

          var t = c.text.replace(/"/g, '""');
          if (t.includes(',') || t.includes('"') || t.includes('\n')) {
            return '"' + t + '"';
          }
          return t;
        }).join(',');
        csvLines.push(rowText);
      });
      csvLines.push('');
    }

    self.postMessage({ progress: 90, label: 'Generating Excel CSV...' });
    var csvString = csvLines.join('\n');
    var encoder = new TextEncoder();
    var arrayBuffer = encoder.encode(csvString).buffer;

    self.postMessage({ result: arrayBuffer });
  } catch (err) {
    self.postMessage({ error: 'PDF to Excel failed: ' + err.message });
  }
};


