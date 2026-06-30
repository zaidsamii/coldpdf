
(function() {
  console.log(
    '%cColdPDF 🔒%c\nAll files are processed in your browser.\nNo data is sent to any server.\nFiles are cleared from memory after download.',
    'color:#7C3AED;font-size:16px;font-weight:bold',
    'color:#94A3B8;font-size:12px'
  );
})();

function initDropzone(dropzoneEl, inputEl, onFiles) {
  if (!dropzoneEl || !inputEl) return;

  dropzoneEl.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropzoneEl.classList.add('drag-over');
  });

  dropzoneEl.addEventListener('dragleave', function() {
    dropzoneEl.classList.remove('drag-over');
  });

  dropzoneEl.addEventListener('drop', function(e) {
    e.preventDefault();
    dropzoneEl.classList.remove('drag-over');
    var files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  });

  inputEl.addEventListener('change', function() {
    var files = Array.from(inputEl.files);
    if (files.length) onFiles(files);
  });
}

function updateProgress(percent, label) {
  var bar = document.getElementById('progressBar');
  var fill = document.getElementById('progressFill');
  var pct = document.getElementById('progressPercent');
  var lbl = document.getElementById('progressLabel');

  if (!bar) return;
  bar.hidden = false;
  if (fill) fill.style.width = percent + '%';
  if (pct) pct.textContent = percent + '%';
  if (lbl && label) lbl.textContent = label;
}

function hideProgress() {
  var bar = document.getElementById('progressBar');
  if (bar) bar.hidden = true;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

document.addEventListener('DOMContentLoaded', function() {
  var links = document.querySelectorAll('.cp-nav__link');
  links.forEach(function(link) {
    if (link.href === window.location.href) {
      link.style.color = '#9F67FF';
    }
  });
});


