
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

function parseMD(md) {
  var lines = md.split('\n');
  var result = [];
  lines.forEach(function(line) {
    line = line.trimEnd();
    if (/^### /.test(line)) result.push({ type:'h3', text:line.slice(4) });
    else if (/^## /.test(line)) result.push({ type:'h2', text:line.slice(3) });
    else if (/^# /.test(line)) result.push({ type:'h1', text:line.slice(2) });
    else if (/^- /.test(line)||/^\* /.test(line)) result.push({ type:'li', text:'• '+line.slice(2) });
    else if (line==='') result.push({ type:'blank' });
    else result.push({ type:'p', text:line.replace(/\*\*(.*?)\*\*/g,'$1') });
  });
  return result;
}
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  try {
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    self.postMessage({ progress: 10, label: 'Parsing Markdown...' });
    var decoder = new TextDecoder();
    var md = decoder.decode(new Uint8Array(files[0]));
    var blocks = parseMD(md);
    var pdf = await PDFDocument.create();
    var fontN = await pdf.embedFont(StandardFonts.Helvetica);
    var fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
    var W=595, H=842, margin=55, lineH=18, y=H-margin;
    var page = pdf.addPage([W,H]);
    var sizes = { h1:22, h2:17, h3:14, p:11, li:11 };
    var pageNum = 1;
    self.postMessage({ progress: 30, label: 'Rendering PDF...' });
    blocks.forEach(function(b) {
      if (b.type==='blank') { y-=8; return; }
      var fs = sizes[b.type]||11;
      var font = (b.type.startsWith('h')) ? fontB : fontN;
      var maxW = W-margin*2;

      var words = (b.text||'').split(' ');
      var line = '';
      words.forEach(function(w) {
        var test = line ? line+' '+w : w;
        if (font.widthOfTextAtSize(test,fs) > maxW && line) {
          if (y < margin+10) { page = pdf.addPage([W,H]); y=H-margin; }
          page.drawText(line, { x:margin+(b.type==='li'?10:0), y:y, size:fs, font:font, color:rgb(0.05,0.05,0.05) });
          y -= lineH; line = w;
        } else line = test;
      });
      if (line) {
        if (y < margin+10) { page = pdf.addPage([W,H]); y=H-margin; }
        page.drawText(line, { x:margin+(b.type==='li'?10:0), y:y, size:fs, font:font, color:rgb(0.05,0.05,0.05) });
      }
      y -= lineH + (b.type.startsWith('h') ? 6 : 2);
    });
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


