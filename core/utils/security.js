
function wipeBuffer(buffer) {
  if (buffer && buffer.byteLength > 0) {
    var view = new Uint8Array(buffer);
    view.fill(0);
  }
}

function auditStorage() {
  var ls = Object.keys(localStorage).length;
  var ss = Object.keys(sessionStorage).length;
  if (ls > 0 || ss > 0) {
    console.warn('[ColdPDF Security] Unexpected storage usage detected!', { localStorage: ls, sessionStorage: ss });
  } else {
    console.info('[ColdPDF Security] Storage clean. No user data persisted.');
  }
}

function logSecurityPromise() {
  console.log(
    '%cColdPDF Security%c\nAll files are processed in your browser.\nNo data is sent to any server.\nFiles are cleared from memory after download.',
    'color:#7C3AED;font-size:14px;font-weight:bold',
    'color:#aaa;font-size:12px'
  );
}


