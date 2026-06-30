
function runWorker(workerFile, files, options, onProgress) {
  return new Promise(function(resolve, reject) {
    var fullPath = (workerFile.indexOf('.') === 0 || workerFile.indexOf('/') === 0) ? workerFile : '../core/workers/' + workerFile;
    var worker = new Worker(fullPath);

    worker.onmessage = function(e) {
      if (e.data.progress !== undefined) {
        if (onProgress) onProgress(e.data.progress, e.data.label || '');
        return;
      }
      worker.terminate();
      if (e.data.error) reject(new Error(e.data.error));
      else resolve(e.data.result);
    };

    worker.onerror = function(err) {
      worker.terminate();
      reject(new Error(err.message || 'Worker failed'));
    };

    var transfers = files.filter(function(f){ return f instanceof ArrayBuffer; });
    worker.postMessage({ files: files, options: options || {} }, transfers);
  });
}


