
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;

  var W = 242.5, H = 153;
  try {
    var PDFDocument = PDFLib.PDFDocument, StandardFonts = PDFLib.StandardFonts, rgb = PDFLib.rgb;
    var pdf = await PDFDocument.create();
    var fontB = await pdf.embedFont(StandardFonts.HelveticaBold);
    var fontN = await pdf.embedFont(StandardFonts.Helvetica);
    var page = pdf.addPage([W, H]);

    page.drawRectangle({ x:0,y:0,width:W,height:H, color:rgb(0.1,0.2,0.5) });

    page.drawRectangle({ x:0,y:H-30,width:W,height:30, color:rgb(0.05,0.1,0.35) });
    var orgName = opts.orgName||'Organization Name';
    page.drawText(orgName, { x:10,y:H-22,size:10,font:fontB,color:rgb(1,1,1) });

    page.drawRectangle({ x:10,y:H-120,width:65,height:80, color:rgb(0.8,0.8,0.8) });
    page.drawText('PHOTO', { x:22,y:H-85,size:9,font:fontN,color:rgb(0.5,0.5,0.5) });

    var name = opts.cardName||'Full Name';
    var id   = opts.cardId  ||'ID: 000001';
    var role = opts.cardRole||'Designation';
    page.drawText(name, { x:85,y:H-55,size:11,font:fontB,color:rgb(1,1,1) });
    page.drawText(role, { x:85,y:H-72,size:9, font:fontN,color:rgb(0.8,0.9,1) });
    page.drawText(id,   { x:85,y:H-88,size:8, font:fontN,color:rgb(0.7,0.8,0.9) });

    page.drawRectangle({ x:0,y:0,width:W,height:18, color:rgb(0.05,0.1,0.35) });
    page.drawText('VALID ID CARD', { x:W/2-35,y:5,size:7,font:fontN,color:rgb(0.6,0.7,0.9) });
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


