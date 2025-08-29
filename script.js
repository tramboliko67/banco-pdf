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
  const imgWidth = 250;
  const imgHeight = 400;
  
  for (let i = 0; i < images.length; i++) {
    if (i > 0 && i % 8 === 0) {
      pdf.addPage();
    }
    const pageIndex = Math.floor(i / 8);
    const x = margin + (i % 2) * (imgWidth + margin);
    const y = margin + Math.floor((i % 8) / 2) * (imgHeight + margin);

    const file = images[i];
    const reader = await readFileAsync(file);

    pdf.addImage(reader, "JPEG", x, y, imgWidth, imgHeight);
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