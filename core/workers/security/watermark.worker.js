importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var text = opts.wmText||'WATERMARK', opacity = parseFloat(opts.wmOpacity||30)/100;
  try {
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb, degrees = PDFLib.degrees;
    var pdf = await PDFDocument.load(files[0]);
    var font = await pdf.embedFont(StandardFonts.HelveticaBold);
    var pages = pdf.getPages();
    pages.forEach(function(page, i) {
      var w = page.getWidth(), h = page.getHeight();
      var fs = Math.min(w,h)*0.1;
      page.drawText(text, { x:(w-font.widthOfTextAtSize(text,fs))/2, y:(h-fs)/2, size:fs, font:font, color:rgb(0.5,0.5,0.5), opacity:opacity, rotate:degrees(45) });
      self.postMessage({ progress: 20 + Math.round((i/pages.length)*70), label:'Page '+(i+1)+'/'+pages.length });
    });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


