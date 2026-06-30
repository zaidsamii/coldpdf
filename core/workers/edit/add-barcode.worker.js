
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

function code128(text) {
  var patterns = {
    ' ':11011001100,'!':11001101100,'"':11001100110,'#':10010011000,'$':10010001100,'%':10001001100,
    '&':10011001000,"'":10011000100,'(':10001100100,')':11001001000,'*':11001000100,'+':11000100100,
    ',':10110011100,'-':10011011100,'.':10011001110,'/':10111001100,'0':10011101100,'1':11101011000,
    '2':11101000110,'3':11100010110,'4':11101101000,'5':11100011010,'6':11101001100,'7':11100101100,
    '8':11100100110,'9':11101100100,
    'A':11000010100,'B':10001011000,'C':10001000110,'D':10011000010,'E':10000110100,
    'F':10000110010,'G':11000010010,'H':11001010000,'I':10110001000,'J':10001101000,
    'K':10001100010,'L':11010001000,'M':11000101000,'N':11000100010,'O':10110111000,
    'P':10110001110,'Q':10001101110,'R':10111011000,'S':10111000110,'T':10001110110,
    'U':11101110100,'V':11100110100,'W':11100100110,'X':11101101110,'Y':11101001110,
    'Z':11100101110
  };

  return text.split('').map(function(c){ return (patterns[c]||patterns[' ']).toString(); }).join('');
}

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var barcodeText = opts.barcodeText || '123456789';
  var barcodeH = parseInt(opts.barcodeHeight || 30);
  var position = opts.barcodePosition || 'bottom-center';
  try {
    var PDFDocument = PDFLib.PDFDocument, rgb = PDFLib.rgb;
    self.postMessage({ progress: 20, label: 'Generating barcode...' });

    var bars = code128(barcodeText.toUpperCase());
    var barW = 2, canW = bars.length * barW + 40, canH = barcodeH + 20;
    var canvas = new OffscreenCanvas(canW, canH);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canW,canH);
    ctx.fillStyle = '#000';
    for (var i = 0; i < bars.length; i++) {
      if (bars[i]==='1') ctx.fillRect(20+i*barW, 5, barW, barcodeH);
    }
    var blob = await canvas.convertToBlob({ type: 'image/png' });
    var barBuf = await blob.arrayBuffer();
    self.postMessage({ progress: 40, label: 'Stamping PDF...' });
    var pdf = await PDFDocument.load(files[0]);
    var barImg = await pdf.embedPng(barBuf);
    var pages = pdf.getPages();
    var margin = 10;
    pages.forEach(function(page) {
      var w = page.getWidth(), h = page.getHeight();
      var imgW = Math.min(canW, w*0.5), imgH = (canH/canW)*imgW;
      var x = position.includes('center') ? (w-imgW)/2 : position.includes('right') ? w-imgW-margin : margin;
      var y = position.includes('top') ? h-imgH-margin : margin;
      page.drawImage(barImg, { x:x, y:y, width:imgW, height:imgH });
    });
    self.postMessage({ result: (await pdf.save()).buffer });
  } catch(err) { self.postMessage({ error: err.message }); }
};


