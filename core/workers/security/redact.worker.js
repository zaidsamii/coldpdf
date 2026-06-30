
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument, rgb = PDFLib.rgb;
    self.postMessage({ progress: 20, label: 'Loading PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var pages = pdf.getPages();

    var areas = (opts.redactAreas||'').split(';').map(function(s){
      var p = s.split(',').map(Number);
      return p.length===4 && !p.some(isNaN) ? { x:p[0],y:p[1],w:p[2],h:p[3] } : null;
    }).filter(Boolean);
    self.postMessage({ progress: 50, label: 'Applying redaction...' });
    pages.forEach(function(page) {
      var w = page.getWidth(), h = page.getHeight();

      var rects = areas.length ? areas : [{ x:w*0.1, y:h*0.45, w:w*0.8, h:h*0.1 }];
      rects.forEach(function(r) {
        page.drawRectangle({ x:r.x, y:r.y, width:r.w, height:r.h, color:rgb(0,0,0), opacity:1 });
      });
    });
    self.postMessage({ progress: 90, label: 'Saving...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


