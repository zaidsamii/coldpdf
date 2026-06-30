
importScripts('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async function(e) {
  var files = e.data.files, opts = e.data.options;
  var fieldName = opts.formFieldName || '';
  var fieldValue = opts.formFieldValue || '';

  try {
    var PDFDocument = PDFLib.PDFDocument;
    self.postMessage({ progress: 20, label: 'Loading PDF Form...' });
    var pdf = await PDFDocument.load(files[0]);
    var form = pdf.getForm();

    if (fieldName.trim()) {
      self.postMessage({ progress: 60, label: 'Filling field: ' + fieldName });
      try {
        var field = form.getField(fieldName);
        if (field.constructor.name === 'PDFTextField') {
          field.setText(fieldValue);
        } else if (field.constructor.name === 'PDFCheckBox') {
          if (fieldValue === 'true' || fieldValue === 'checked' || fieldValue === '1') {
            field.check();
          } else {
            field.uncheck();
          }
        }
      } catch (fErr) {

        var fields = form.getFields().map(function(f) { return f.getName(); });
        self.postMessage({ error: 'Field "' + fieldName + '" not found. Available fields: ' + fields.join(', ') });
        return;
      }
    }

    self.postMessage({ progress: 85, label: 'Saving interactive PDF form...' });
    var result = await pdf.save();
    self.postMessage({ result: result.buffer });
  } catch(err) {
    self.postMessage({ error: 'PDF Forms failed: ' + err.message });
  }
};


