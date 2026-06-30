
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
              'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 10, label: 'Reading PPTX...' });
    var zip = await JSZip.loadAsync(files[0]);
    var slides = [];

    var slideKeys = Object.keys(zip.files).filter(function(k){ return /ppt\/slides\/slide\d+\.xml/.test(k); });
    slideKeys.sort();
    for (var i = 0; i < slideKeys.length; i++) {
      self.postMessage({ progress: 10+Math.round((i/slideKeys.length)*60), label: 'Parsing slide '+(i+1)+'/'+slideKeys.length });
      var xml = await zip.files[slideKeys[i]].async('text');

      var texts = [];
      var re = /<a:t>([^<]*)<\/a:t>/g, m;
      while ((m=re.exec(xml))!==null) { if(m[1].trim()) texts.push(m[1].trim()); }
      slides.push({ num: i+1, text: texts });
    }
    self.postMessage({ progress: 75, label: 'Building PDF...' });
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    var pdf = await PDFDocument.create();
    var fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
    var fontN = await pdf.embedFont(StandardFonts.Helvetica);
    slides.forEach(function(slide) {
      var page = pdf.addPage([792, 612]);
      var W = page.getWidth(), H = page.getHeight();

      page.drawRectangle({ x:0,y:H-50,width:W,height:50,color:rgb(0.15,0.15,0.15) });
      page.drawText('Slide ' + slide.num, { x:20,y:H-35,size:16,font:fontB,color:rgb(1,1,1) });
      var y = H-80;
      slide.text.forEach(function(t, ti) {
        if (y < 30) return;
        var fs = ti===0 ? 14 : 11;
        var fn = ti===0 ? fontB : fontN;
        page.drawText(t.slice(0,100), { x:30,y:y,size:fs,font:fn,color:rgb(0.1,0.1,0.1) });
        y -= fs+6;
      });
    });
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: 'PPT to PDF: ' + err.message }); }
};


