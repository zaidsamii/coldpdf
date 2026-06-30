<div align="center">
  <h1>🧊 ColdPDF</h1>
  <p><strong>A zero-server, privacy-first PDF toolkit that runs entirely in your browser.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0-blue.svg" alt="Version 1.0" />
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT" />
    <img src="https://img.shields.io/badge/platform-Web-lightgrey.svg" alt="Platform Web" />
  </p>
</div>

---

## 📌 Overview

**ColdPDF** is a lightweight toolkit designed for editing, organizing, and converting PDF files directly on the client side. I built this tool to solve a common problem: most free online PDF editors force you to upload your sensitive documents to their servers. 

With ColdPDF, **your files never leave your machine**. Everything is processed locally in your browser's memory using Web Workers, ensuring absolute data privacy and blazing-fast performance.

## 🚀 Key Features

### 📂 Organize & Manipulate
- **Merge & Split:** Combine multiple PDFs into one, or extract specific pages.
- **Visual Reorder:** Drag-and-drop interface to rearrange or delete pages instantly.
- **Rotate:** Adjust page orientations individually.

### ✏️ Edit & Annotate
- **Interactive Marking:** Draw directly on pages using various brush types (Pen, Marker, Highlighter).
- **Watermarking:** Stamp text across pages for copyright protection.
- **Redaction:** Black out sensitive information permanently.

### 🖼️ Convert & Optimize
- **Images:** Convert PDF pages to JPG/PNG, or compile images into a single PDF.
- **Compression:** Reduce file size for easier sharing without heavy quality loss.
- **Text Extraction:** Pull plain text or use OCR for scanned documents.
- **Format Conversion:** Convert to Markdown, HTML, and other office formats.

### 🔒 Security
- **Protect/Unlock:** Add password encryption or decrypt locked files.
- **Signatures:** Add digital signature stamps to documents.

## 🛠️ Technical Architecture

This project was built from scratch using vanilla web technologies to maintain maximum control over performance and dependencies.

- **Core PDF Engine:** [pdf-lib](https://pdf-lib.js.org/) for heavy document manipulation.
- **Rendering Layer:** [PDF.js](https://mozilla.github.io/pdf.js/) for generating visual page previews.
- **Concurrency:** Extensive use of **Web Workers** ensures that heavy PDF processing (like OCR or compression) runs on background threads, keeping the main UI completely responsive.
- **UI & Interactions:** Vanilla JavaScript and CSS. [SortableJS](https://sortablejs.github.io/Sortable/) is used for smooth drag-and-drop mechanics.

## 💻 Getting Started

Since ColdPDF relies entirely on client-side processing, there are no complex backends to configure.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zaidsamii/coldpdf.git
   ```

2. **Serve locally:**
   Because Web Workers require a local server to bypass CORS restrictions, you can serve the directory using any basic HTTP server:
   ```bash
   # If you have Python installed:
   python -m http.server 8000
   
   # Or using Node.js:
   npx serve .
   ```

3. **Open:** Navigate to `http://localhost:8000` in your browser.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). 
Copyright (c) 2026 Zaid Sami.
