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

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage();

    const file = images[i];
    const reader = await readFileAsync(file);

    // Crear imagen en memoria para leer sus dimensiones originales
    const img = new Image();
    img.src = reader;

    await new Promise((resolve) => {
      img.onload = () => {
        let imgW = img.width;
        let imgH = img.height;

        // Escalar manteniendo proporción dentro de la hoja
        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2;
        const ratio = Math.min(maxW / imgW, maxH / imgH);

        imgW *= ratio;
        imgH *= ratio;

        const x = (pageWidth - imgW) / 2; // centrar
        const y = (pageHeight - imgH) / 2;

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