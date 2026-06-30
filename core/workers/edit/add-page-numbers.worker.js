
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var position = opts.numPosition||'bottom-center';
  var startNum = parseInt(opts.startNum||1);
  try {
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    var pdf = await PDFDocument.load(files[0]);
    var font = await pdf.embedFont(StandardFonts.Helvetica);
    var pages = pdf.getPages();
    pages.forEach(function(page, i) {
      var w = page.getWidth(), h = page.getHeight();
      var num = String(startNum + i);
      var fs = 10, tw = font.widthOfTextAtSize(num, fs);
      var x = position.includes('center') ? (w-tw)/2 : position.includes('right') ? w-tw-20 : 20;
      var y = position.includes('top') ? h-25 : 15;
      page.drawText(num, { x:x, y:y, size:fs, font:font, color:rgb(0.3,0.3,0.3) });
      self.postMessage({ progress: 10 + Math.round((i/pages.length)*80), label: 'Page '+(i+1)+'/'+pages.length });
    });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


