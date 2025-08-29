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

  const pdf = new jsPDF("p", "pt", "letter"); // carta: 612x792 pt
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const cols = 2; // 2 columnas
  const rows = 2; // 2 filas -> 4 imágenes por página
  const cellWidth = (pageWidth - margin * (cols + 1)) / cols;
  const cellHeight = (pageHeight - margin * (rows + 1)) / rows;

  for (let i = 0; i < images.length; i++) {
    if (i > 0 && i % (cols * rows) === 0) {
      pdf.addPage();
    }

    const file = images[i];
    const reader = await readFileAsync(file);

    const img = new Image();
    img.src = reader;

    await new Promise((resolve) => {
      img.onload = () => {
        let imgW = img.width;
        let imgH = img.height;

        // Escalar manteniendo proporción dentro de la celda
        const ratio = Math.min(cellWidth / imgW, cellHeight / imgH);
        imgW *= ratio;
        imgH *= ratio;

        // Calcular posición en la celda
        const col = i % cols;
        const row = Math.floor((i % (cols * rows)) / cols);

        const x = margin + col * (cellWidth + margin) + (cellWidth - imgW) / 2;
        const y = margin + row * (cellHeight + margin) + (cellHeight - imgH) / 2;

        pdf.addImage(reader, "JPEG", x, y, imgW, imgH);
        resolve();
      };
    });
  }

  pdf.save("comprobantes.pdf");
});


function readFileAsync(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}