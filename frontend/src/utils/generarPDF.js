import jsPDF from "jspdf";
import "jspdf-autotable";

export const generarPDFPaciente = (paciente, historial) => {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.text("SHOWCLINIC - Historial Clínico del Paciente", 14, 15);

  doc.setFontSize(11);
  doc.text(`Nombre: ${paciente.nombre} ${paciente.apellido}`, 14, 25);
  doc.text(`DNI: ${paciente.dni}`, 14, 32);
  doc.text(`Edad: ${paciente.edad}`, 14, 39);
  doc.text(`Sexo: ${paciente.sexo}`, 14, 46);
  doc.text(`Teléfono: ${paciente.celular}`, 14, 53);
  doc.text(`Correo: ${paciente.correo}`, 14, 60);

  const columnas = [
    "Fecha",
    "Tratamiento",
    "Sesión",
    "Descuento",
    "Método de Pago",
    "Total (S/)",
  ];
  const filas = historial.map((h) => [
    h.fecha,
    h.tratamiento,
    h.sesion,
    h.descuento + "%",
    h.pagoMetodo,
    h.precio_total.toFixed(2),
  ]);

  doc.autoTable({
    head: [columnas],
    body: filas,
    startY: 70,
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [163, 105, 32] },
  });

  doc.text("Generado por ShowClinic CRM", 14, doc.lastAutoTable.finalY + 10);
  doc.save(`Historial_${paciente.nombre}_${paciente.apellido}.pdf`);
};
