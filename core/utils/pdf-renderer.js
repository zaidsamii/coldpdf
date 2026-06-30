
async function renderPageToCanvas(pdfBuffer, pageNum, scale) {
  scale = scale || 1.5;
  var loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  var pdf = await loadingTask.promise;
  var page = await pdf.getPage(pageNum);
  var viewport = page.getViewport({ scale: scale });

  var canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  var ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport: viewport }).promise;
  return canvas;
}

async function getPDFPageCount(pdfBuffer) {
  var loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  var pdf = await loadingTask.promise;
  return pdf.numPages;
}


