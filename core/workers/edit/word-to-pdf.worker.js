
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 20, label: 'Reading DOCX...' });

    var zip = new JSZip();
    var zipContent = await zip.loadAsync(files[0]);

    var xmlFile = zipContent.file('word/document.xml');
    if (!xmlFile) {
      throw new Error('Not a valid DOCX file format (missing word/document.xml).');
    }

    var xmlString = await xmlFile.async('string');

    self.postMessage({ progress: 50, label: 'Extracting paragraphs...' });

    var paragraphs = [];
    var pRegex = /<w:p(?: [^>]*)?>([\s\S]*?)<\/w:p>/g;
    var tRegex = /<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g;

    var pMatch;
    while ((pMatch = pRegex.exec(xmlString)) !== null) {
      var pXml = pMatch[1];
      var pText = '';
      var tMatch;
      while ((tMatch = tRegex.exec(pXml)) !== null) {

        var text = tMatch[1].replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&');
        pText += text;
      }
      if (pText.trim()) {
        paragraphs.push(pText.trim());
      } else {
        paragraphs.push('');
      }
    }

    self.postMessage({ progress: 75, label: 'Rendering PDF layout...' });
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    var pdf = await PDFDocument.create();
    var fontN = await pdf.embedFont(StandardFonts.Helvetica);

    var page = pdf.addPage();
    var margin = 50;
    var y = page.getHeight() - margin;
    var maxWidth = page.getWidth() - (margin * 2);

    function checkPageBreak(requiredH) {
      if (y - requiredH < margin) {
        page = pdf.addPage();
        y = page.getHeight() - margin;
      }
    }

    paragraphs.forEach(function(pText) {
      if (!pText) {
        y -= 12;
        checkPageBreak(12);
        return;
      }

      var words = pText.split(' ');
      var line = '';
      for (var i = 0; i < words.length; i++) {
        var testLine = line + words[i] + ' ';
        var width = fontN.widthOfTextAtSize(testLine, 11);
        if (width > maxWidth && line !== '') {
          checkPageBreak(16);
          page.drawText(line, { x: margin, y: y, size: 11, font: fontN, color: rgb(0,0,0) });
          y -= 16;
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      checkPageBreak(16);
      page.drawText(line, { x: margin, y: y, size: 11, font: fontN, color: rgb(0,0,0) });
      y -= 16;
    });

    self.postMessage({ progress: 95, label: 'Saving PDF...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'Word to PDF failed: ' + err.message });
  }
};


