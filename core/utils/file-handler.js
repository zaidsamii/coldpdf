
function readFileAsBuffer(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) { resolve(e.target.result); };
    reader.onerror = function() { reject(new Error('Cannot read file: ' + file.name)); };
    reader.readAsArrayBuffer(file);
  });
}

function downloadBuffer(buffer, filename, mimeType) {
  var blob = new Blob([buffer], { type: mimeType || 'application/pdf' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 100);
}


