
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    self.postMessage({ progress: 10, label: 'Parsing HTML...' });
    var decoder = new TextDecoder();
    var html = decoder.decode(new Uint8Array(files[0]));

    var text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li>/gi, '\n• ')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
      .replace(/\n{3,}/g, '\n\n').trim();
    var pdf = await PDFDocument.create();
    var font = await pdf.embedFont(StandardFonts.Helvetica);
    var W=595,H=842,margin=55,lineH=16,fs=11,maxW=W-margin*2;
    var page = pdf.addPage([W,H]);
    var y = H-margin;
    var rawLines = text.split('\n');
    self.postMessage({ progress: 50, label: 'Building PDF...' });
    rawLines.forEach(function(rawLine) {
      var words = rawLine.split(' ');
      var line = '';
      words.forEach(function(w) {
        var test = line ? line+' '+w : w;
        if (font.widthOfTextAtSize(test,fs)>maxW && line) {
          if (y<margin+10) { page=pdf.addPage([W,H]); y=H-margin; }
          page.drawText(line, { x:margin, y:y, size:fs, font:font, color:rgb(0.1,0.1,0.1) });
          y-=lineH; line=w;
        } else line=test;
      });
      if (line) {
        if (y<margin+10) { page=pdf.addPage([W,H]); y=H-margin; }
        page.drawText(line, { x:margin, y:y, size:fs, font:font, color:rgb(0.1,0.1,0.1) });
      }
      y -= lineH;
    });
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


