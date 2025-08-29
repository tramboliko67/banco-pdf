const { jsPDF } = window.jspdf;

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const generatePDF = document.getElementById("generatePDF");

let images = [];

fileInput.addEventListener("change", (e) => {
  images = Array.from(e.target.files).slice(0, 15); // máx 15 fotos
  preview.innerHTML = "";
  images.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

generatePDF.addEventListener("click", async () => {
  if (images.length === 0) {
    alert("Por favor, sube al menos una imagen.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });

  const margin = 20;
  const cols = 2;
  const rows = 2;
  const perPage = cols * rows;

  const pageWidth = pdf.internal.pageSize.getWidth();   // 612 pt
  const pageHeight = pdf.internal.pageSize.getHeight(); // 792 pt

  const cellWidth = (pageWidth - margin * (cols + 1)) / cols;
  const cellHeight = (pageHeight - margin * (rows + 1)) / rows;

  // Helper: convierte File -> dataURL
  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  for (let i = 0; i < images.length; i++) {
    // Añadir página nueva solo cuando corresponde (cada perPage elementos)
    if (i > 0 && i % perPage === 0) {
      pdf.addPage();
    }

    const idxInPage = i % perPage;
    const col = idxInPage % cols;
    const row = Math.floor(idxInPage / cols);

    const file = images[i];
    const dataUrl = await readFileAsync(file);

    // Cargar la imagen para conocer dimensiones reales
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        // Escalar manteniendo proporción dentro de la celda
        const ratio = Math.min(cellWidth / w, cellHeight / h);
        const drawW = w * ratio;
        const drawH = h * ratio;

        // Centrar dentro de la celda
        const x = margin + col * (cellWidth + margin) + (cellWidth - drawW) / 2;
        const y = margin + row * (cellHeight + margin) + (cellHeight - drawH) / 2;

        const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        pdf.addImage(dataUrl, format, x, y, drawW, drawH, undefined, "FAST");
        resolve();
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  // Nombre de archivo: toma de input #pdfName si existe, si no usa fecha
  const nameInput = document.getElementById("pdfName");
  let fileName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : `comprobantes_${new Date().toISOString().slice(0,10)}`;
  // Normalizar nombre (remueve caracteres raros)
  fileName = fileName.replace(/[^\w\-\.]/g, "_");
  pdf.save(`${fileName}.pdf`);
});

document.getElementById("sendWhatsApp").addEventListener("click", () => {
  // Tomar el número escrito
  const phoneNumber = document.getElementById("whatsappNumber").value.trim();

  if (!phoneNumber) {
    alert("Por favor, escribe un número de WhatsApp.");
    return;
  }

  // Mensaje automático
  const message = "Hola, aquí te envío el comprobante bancario en PDF.";

  // Crear URL de WhatsApp
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Abrir chat en nueva pestaña
  window.open(url, "_blank");
});



function readFileAsync(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}