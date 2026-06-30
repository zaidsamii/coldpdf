
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function strToBytes(str) {
  var bytes = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xFF;
  return bytes;
}

function concatBytes(arrays) {
  var total = arrays.reduce(function(s, a) { return s + a.length; }, 0);
  var out = new Uint8Array(total);
  var pos = 0;
  arrays.forEach(function(a) { out.set(a, pos); pos += a.length; });
  return out;
}

function writeUint16LE(n) { return new Uint8Array([n & 0xFF, (n >> 8) & 0xFF]); }
function writeUint32LE(n) { return new Uint8Array([n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]); }

function crc32(data) {
  var table = crc32Table();
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < data.length; i++) crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

var _crc32Table = null;
function crc32Table() {
  if (_crc32Table) return _crc32Table;
  _crc32Table = new Uint32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    _crc32Table[i] = c;
  }
  return _crc32Table;
}

function zipLocalHeader(nameBytes, dataBytes, crc) {
  return concatBytes([
    new Uint8Array([0x50,0x4B,0x03,0x04]), writeUint16LE(20), writeUint16LE(0),
    writeUint16LE(0), writeUint16LE(0), writeUint16LE(0),
    writeUint32LE(crc), writeUint32LE(dataBytes.length), writeUint32LE(dataBytes.length),
    writeUint16LE(nameBytes.length), writeUint16LE(0), nameBytes
  ]);
}

function zipCentralDirEntry(nameBytes, dataBytes, crc, localOffset) {
  return concatBytes([
    new Uint8Array([0x50,0x4B,0x01,0x02]), writeUint16LE(20), writeUint16LE(20),
    writeUint16LE(0), writeUint16LE(0), writeUint16LE(0), writeUint16LE(0),
    writeUint32LE(crc), writeUint32LE(dataBytes.length), writeUint32LE(dataBytes.length),
    writeUint16LE(nameBytes.length), writeUint16LE(0), writeUint16LE(0),
    writeUint16LE(0), writeUint16LE(0), writeUint32LE(0), writeUint32LE(localOffset), nameBytes
  ]);
}

function zipEOCD(numFiles, centralDirSize, centralDirOffset) {
  return concatBytes([
    new Uint8Array([0x50,0x4B,0x05,0x06]), writeUint16LE(0), writeUint16LE(0),
    writeUint16LE(numFiles), writeUint16LE(numFiles),
    writeUint32LE(centralDirSize), writeUint32LE(centralDirOffset), writeUint16LE(0)
  ]);
}

function buildZip(files) {
  var parts = [];
  var centralDir = [];
  var offset = 0;

  files.forEach(function(f) {
    var nameBytes = strToBytes(f.name);
    var dataBytes = strToBytes(f.data);
    var crc = crc32(dataBytes);
    var localHeader = zipLocalHeader(nameBytes, dataBytes, crc);
    var entry = concatBytes([localHeader, dataBytes]);
    centralDir.push({ nameBytes: nameBytes, dataBytes: dataBytes, crc: crc, offset: offset });
    parts.push(entry);
    offset += entry.length;
  });

  var centralDirBytes = [];
  var centralOffset = offset;
  centralDir.forEach(function(d) {
    centralDirBytes.push(zipCentralDirEntry(d.nameBytes, d.dataBytes, d.crc, d.offset));
  });

  var centralDirAll = concatBytes(centralDirBytes);
  var eocd = zipEOCD(centralDir.length, centralDirAll.length, centralOffset);
  return concatBytes(parts.concat([centralDirAll, eocd])).buffer;
}

function generateDocx(paragraphs) {
  var relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  var contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';

  var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' +
    paragraphs.map(function(p) {
      var escaped = p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<w:p><w:r><w:t>' + escaped + '</w:t></w:r></w:p>';
    }).join('') +
    '</w:body></w:document>';

  return buildZip([
    { name: '_rels/.rels', data: relsXml },
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: 'word/document.xml', data: documentXml }
  ]);
}

self.onmessage = async function(e) {
  var files = e.data.files;
  try {
    self.postMessage({ progress: 10, label: 'Reading PDF...' });
    var loadingTask = pdfjsLib.getDocument({ data: files[0] });
    var pdf = await loadingTask.promise;
    var allLines = [];

    for (var i = 1; i <= pdf.numPages; i++) {
      self.postMessage({ progress: 10 + Math.round((i / pdf.numPages) * 75), label: 'Processing page ' + i + '/' + pdf.numPages });
      var page = await pdf.getPage(i);
      var textContent = await page.getTextContent();
      textContent.items.forEach(function(item) {
        if (item.str.trim()) allLines.push(item.str);
      });
      allLines.push('');
    }

    self.postMessage({ progress: 90, label: 'Building DOCX file...' });
    var docxBuffer = generateDocx(allLines);
    self.postMessage({ result: docxBuffer });
  } catch (err) {
    self.postMessage({ error: 'PDF to Word failed: ' + err.message });
  }
};


