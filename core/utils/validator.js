
var ALLOWED_PDF_TYPES = ['application/pdf'];
var ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
var ALLOWED_DOCX_TYPES = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
var MAX_FILE_SIZE_MB = 100;

function isValidPDF(file) {
  return ALLOWED_PDF_TYPES.includes(file.type) || file.name.endsWith('.pdf');
}

function isValidImage(file) {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

function isValidDOCX(file) {
  return ALLOWED_DOCX_TYPES.includes(file.type) || file.name.endsWith('.docx');
}

function isWithinSizeLimit(file) {
  return file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length > 0;
}


