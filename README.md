# ColdPDF

ColdPDF is a lightweight, fully client-side toolkit for working with PDF files directly in the browser. 
There is no backend server involved, meaning your documents never leave your local machine, ensuring complete privacy.

All heavy lifting is done locally using Web Workers to prevent UI freezing.

## Features

- **Organize**: Merge multiple PDFs, split ranges, reorder/delete pages via drag-and-drop, and rotate pages.
- **Images**: Convert PDF pages to JPG/PNG, create PDFs from images, or extract all embedded images.
- **Edit**: Interactive drawing on PDFs (pen, marker, highlighter), OCR for text extraction, and form filling.
- **Optimize**: Compress files for smaller sizes and repair corrupted PDFs.
- **Security**: Add/remove passwords, apply text watermarks, redact sensitive areas, and sign documents.
- **Conversions**: Convert to/from Markdown, HTML, DOCX, and PPTX natively in the browser.

## Getting Started

Because ColdPDF has no build tools or server dependencies, you can start running it instantly:

1. Clone the repository:
   ```bash
   git clone https://github.com/zaidsamii/coldpdf.git
   cd coldpdf
   ```

2. Start a local HTTP server (needed to load Web Workers properly due to CORS):
   ```bash
   python -m http.server 8000
   # or with Node.js
   npx serve .
   ```

3. Open `http://localhost:8000` in your web browser.

## Tech Stack

ColdPDF is built with a focus on simplicity and zero dependencies:
- **Core Engine:** [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation
- **Rendering:** [PDF.js](https://mozilla.github.io/pdf.js/) for visualizing pages
- **Drag & Drop:** [SortableJS](https://sortablejs.github.io/Sortable/) for organizing pages
- **Architecture:** Pure Vanilla JavaScript, HTML5, and CSS3 with Web Workers for background processing.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
