
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 10, label: 'Reading sheet data...' });
    var decoder = new TextDecoder();
    var csvText = decoder.decode(new Uint8Array(files[0]));

    var rows = [];
    var lines = csvText.split('\n');
    lines.forEach(function(line) {
      if (!line.trim()) return;
      var cols = [];
      var insideQuotes = false;
      var current = '';
      for (var i = 0; i < line.length; i++) {
        var char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim());
      rows.push(cols);
    });

    if (rows.length === 0) {
      self.postMessage({ error: 'No data found in spreadsheet/CSV file.' });
      return;
    }

    self.postMessage({ progress: 40, label: 'Drawing PDF table...' });
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    var pdf = await PDFDocument.create();
    var fontN = await pdf.embedFont(StandardFonts.Helvetica);
    var fontB = await pdf.embedFont(StandardFonts.HelveticaBold);

    var pageWidth = 842;
    var pageHeight = 595;
    var margin = 40;
    var y = pageHeight - margin;
    var page = pdf.addPage([pageWidth, pageHeight]);

    var headerRow = rows[0];
    var colWidth = (pageWidth - margin * 2) / Math.max(headerRow.length, 1);
    var rowHeight = 22;
    var fontSize = 9;

    function checkPageBreak(requiredH) {
      if (y - requiredH < margin) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
    }

    page.drawRectangle({
      x: margin,
      y: y - rowHeight,
      width: pageWidth - margin * 2,
      height: rowHeight,
      color: rgb(0.9, 0.9, 0.9)
    });

    headerRow.forEach(function(colText, i) {
      page.drawText(colText.slice(0, 30), {
        x: margin + i * colWidth + 5,
        y: y - rowHeight + 6,
        size: fontSize,
        font: fontB,
        color: rgb(0.1, 0.1, 0.1)
      });

      page.drawLine({
        start: { x: margin + i * colWidth, y: y },
        end: { x: margin + i * colWidth, y: y - rowHeight },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7)
      });
    });

    page.drawLine({
      start: { x: pageWidth - margin, y: y },
      end: { x: pageWidth - margin, y: y - rowHeight },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7)
    });

    page.drawLine({
      start: { x: margin, y: y },
      end: { x: pageWidth - margin, y: y },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.4)
    });
    page.drawLine({
      start: { x: margin, y: y - rowHeight },
      end: { x: pageWidth - margin, y: y - rowHeight },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.4)
    });
    y -= rowHeight;

    for (var r = 1; r < rows.length; r++) {
      checkPageBreak(rowHeight);
      var row = rows[r];
      row.forEach(function(colText, i) {
        if (i >= headerRow.length) return;
        page.drawText(colText.slice(0, 30), {
          x: margin + i * colWidth + 5,
          y: y - rowHeight + 7,
          size: fontSize,
          font: fontN,
          color: rgb(0.2, 0.2, 0.2)
        });

        page.drawLine({
          start: { x: margin + i * colWidth, y: y },
          end: { x: margin + i * colWidth, y: y - rowHeight },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8)
        });
      });

      page.drawLine({
        start: { x: pageWidth - margin, y: y },
        end: { x: pageWidth - margin, y: y - rowHeight },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8)
      });

      page.drawLine({
        start: { x: margin, y: y - rowHeight },
        end: { x: pageWidth - margin, y: y - rowHeight },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8)
      });
      y -= rowHeight;
      self.postMessage({ progress: 40 + Math.round((r / rows.length) * 50), label: 'Drawing row ' + r + '/' + (rows.length - 1) });
    }

    self.postMessage({ progress: 95, label: 'Saving PDF...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch (err) {
    self.postMessage({ error: 'Excel to PDF failed: ' + err.message });
  }
};


