import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Box,
} from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CAMPOS_FOTOS_ANTES = ["foto_antes1", "foto_antes2", "foto_antes3"];
const CAMPOS_FOTOS_DESPUES = ["foto_despues1", "foto_despues2", "foto_despues3"];
const CAMPOS_FOTOS_LEGACY = [
  "foto_izquierda",
  "foto_frontal",
  "foto_derecha",
  "foto_extra1",
  "foto_extra2",
  "foto_extra3",
];

const HistorialClinico = () => {
  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [fotosAntes, setFotosAntes] = useState([]);
  const [fotosDespues, setFotosDespues] = useState([]);
  const [previewsAntes, setPreviewsAntes] = useState([]);
  const [previewsDespues, setPreviewsDespues] = useState([]);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/pacientes/listar")
      .then((res) => setPacientes(res.data))
      .catch((err) => console.error("❌ Error al obtener pacientes:", err));
  }, []);

  const cargarHistorial = async (id) => {
    try {
      const paciente = pacientes.find((p) => p.id === id) || null;
      setPacienteSeleccionado(paciente);
      const res = await axios.get(
        `http://localhost:4000/api/tratamientos/historial/${id}`
      );
      setTratamientos(res.data);
    } catch (error) {
      console.error("❌ Error al obtener historial clínico:", error);
    }
  };

  const manejarCambioFotos = (tipo) => (e) => {
    const archivos = Array.from(e.target.files || []);
    if (archivos.length > 3) {
      alert("Solo puedes subir hasta 3 fotos en esta sección");
    }
    const seleccionados = archivos.slice(0, 3);

    if (tipo === "antes") {
      setFotosAntes(seleccionados);
      setPreviewsAntes(seleccionados.map((f) => URL.createObjectURL(f)));
    } else {
      setFotosDespues(seleccionados);
      setPreviewsDespues(seleccionados.map((f) => URL.createObjectURL(f)));
    }
  };

  const subirFotos = async (tratamientoId) => {
    if (!fotosAntes.length && !fotosDespues.length)
      return alert("📸 Selecciona fotos de antes o después para subir");

    const data = new FormData();
    fotosAntes.forEach((f) => data.append("fotosAntes", f));
    fotosDespues.forEach((f) => data.append("fotosDespues", f));

    try {
      await axios.post(
        `http://localhost:4000/api/tratamientos/subir-fotos/${tratamientoId}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("✅ Fotos agregadas correctamente");
      setFotosAntes([]);
      setFotosDespues([]);
      setPreviewsAntes([]);
      setPreviewsDespues([]);
      setTratamientoSeleccionado(null);
      cargarHistorial(pacienteSeleccionado.id);
    } catch (err) {
      console.error("❌ Error al subir fotos:", err);
      alert("Error al subir fotos");
    }
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.apellido.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalGeneral = tratamientos.reduce(
    (acc, t) => acc + Number(t.precio_total || t.precioTotal || 0),
    0
  );

  const generarPDF = async () => {
    if (!pacienteSeleccionado) return;

    const doc = new jsPDF("p", "pt", "a4");
    const logo = "/images/logo-showclinic.png";
    const img = new Image();
    img.src = logo;
    await new Promise((resolve) => {
      img.onload = () => {
        doc.addImage(img, "PNG", 40, 30, 90, 60);
        resolve();
      };
    });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#a36920");
    doc.text("Historial Clínico - SHOWCLINIC", 160, 70);
    doc.setFontSize(11);
    doc.setTextColor("#000");
    doc.text(`Emitido: ${new Date().toLocaleDateString()}`, 420, 100);

    const p = pacienteSeleccionado;
    doc.setFontSize(13);
    doc.setTextColor("#a36920");
    doc.text("Datos del Paciente", 40, 140);

    doc.setFontSize(11);
    doc.setTextColor("#000");
    const datos = [
      ["DNI", p.dni],
      ["Nombre", `${p.nombre} ${p.apellido}`],
      ["Edad", p.edad],
      ["Sexo", p.sexo],
      ["Ocupación", p.ocupacion],
      ["Correo", p.correo],
      ["Celular", p.celular],
      ["Dirección", p.direccion],
      ["Ciudad Nacimiento", p.ciudadNacimiento],
      ["Ciudad Residencia", p.ciudadResidencia],
      ["Alergias", p.alergias || "Ninguna"],
      ["Enfermedades", p.enfermedad || "Ninguna"],
      ["Cirugía Estética", p.cirugiaEstetica || "No"],
      ["Tabaco", p.tabaco || "No"],
      ["Alcohol", p.alcohol || "No"],
      ["Drogas", p.drogas || "No"],
      ["Referencia", p.referencia || "No especificada"],
    ];

    let y = 160;
    datos.forEach(([k, v]) => {
      doc.text(`${k}:`, 40, y);
      doc.text(`${v}`, 200, y);
      y += 16;
    });

    doc.setFontSize(13);
    doc.setTextColor("#a36920");
    doc.text("Tratamientos Realizados", 40, y + 20);

    const tabla = tratamientos.map((t) => [
      t.fecha ? t.fecha.split(" ")[0] : "-",
      t.nombreTratamiento || "—",
      t.tipoAtencion || "-",
      t.especialista || "No especificado",
      `S/ ${(t.precio_total || 0).toFixed(2)}`,
      `${t.descuento || 0}%`,
      t.pagoMetodo,
      t.sesion,
    ]);

    autoTable(doc, {
      startY: y + 30,
      head: [
        [
          "Fecha",
          "Tratamiento",
          "Tipo Atención",
          "Especialista",
          "Total (S/)",
          "Descuento (%)",
          "Pago",
          "Sesión",
        ],
      ],
      body: tabla,
      headStyles: { fillColor: [163, 105, 32], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
    });

    doc.text(
      `Monto total general: S/ ${totalGeneral.toFixed(2)}`,
      350,
      doc.lastAutoTable.finalY + 30
    );
    doc.save(`Historial_${p.nombre}_${p.apellido}.pdf`);
  };

  const renderMiniaturas = (keys, tratamiento) => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
      {keys.map(
        (key, i) =>
          tratamiento[key] && (
            <a
              key={`${key}-${i}`}
              href={`http://localhost:4000/uploads/${tratamiento[key]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`http://localhost:4000/uploads/${tratamiento[key]}`}
                width={70}
                alt={key}
                style={{
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              />
            </a>
          )
      )}
    </Box>
  );

  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.85), rgba(232,211,57,0.85)), url('/images/background-showclinic.jpg')",
        backgroundSize: "cover",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <Container maxWidth="lg">
        <Paper sx={{ p: 5, borderRadius: "15px", backgroundColor: "#fff" }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ mb: 4, color: "#a36920", fontWeight: "bold" }}
          >
            🩺 Historial Clínico de Pacientes
          </Typography>

          {!pacienteSeleccionado ? (
            <>
              <TextField
                label="Buscar paciente por nombre o apellido"
                fullWidth
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Grid container spacing={2}>
                {pacientesFiltrados.map((pac) => (
                  <Grid item xs={12} md={6} key={pac.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #ddd",
                      }}
                    >
                      <div>
                        <Typography fontWeight="bold">
                          {pac.nombre} {pac.apellido}
                        </Typography>
                        <Typography variant="body2">DNI: {pac.dni}</Typography>
                      </div>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#a36920",
                          "&:hover": { backgroundColor: "#8b581b" },
                        }}
                        onClick={() => cargarHistorial(pac.id)}
                      >
                        Ver historial
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => setPacienteSeleccionado(null)}
                sx={{
                  mb: 3,
                  borderColor: "#a36920",
                  color: "#a36920",
                  "&:hover": { backgroundColor: "#f7f2ea" },
                }}
              >
                ← Volver
              </Button>

              <Button
                variant="contained"
                sx={{
                  mb: 3,
                  ml: 2,
                  backgroundColor: "#a36920",
                  "&:hover": { backgroundColor: "#8b581b" },
                }}
                onClick={generarPDF}
              >
                🧾 Exportar PDF
              </Button>

              {/* 🧍 Información completa del paciente */}
              <Typography
                variant="h6"
                sx={{ color: "#a36920", fontWeight: "bold", mb: 2 }}
              >
                👤 Información completa del paciente
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>DNI:</strong> {pacienteSeleccionado.dni}</Typography>
                  <Typography><strong>Nombre:</strong> {pacienteSeleccionado.nombre}</Typography>
                  <Typography><strong>Apellido:</strong> {pacienteSeleccionado.apellido}</Typography>
                  <Typography><strong>Edad:</strong> {pacienteSeleccionado.edad}</Typography>
                  <Typography><strong>Sexo:</strong> {pacienteSeleccionado.sexo}</Typography>
                  <Typography><strong>Ocupación:</strong> {pacienteSeleccionado.ocupacion}</Typography>
                  <Typography><strong>Fecha Nacimiento:</strong> {pacienteSeleccionado.fechaNacimiento}</Typography>
                  <Typography><strong>Ciudad Nacimiento:</strong> {pacienteSeleccionado.ciudadNacimiento}</Typography>
                  <Typography><strong>Ciudad Residencia:</strong> {pacienteSeleccionado.ciudadResidencia}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography><strong>Correo:</strong> {pacienteSeleccionado.correo}</Typography>
                  <Typography><strong>Celular:</strong> {pacienteSeleccionado.celular}</Typography>
                  <Typography><strong>Dirección:</strong> {pacienteSeleccionado.direccion}</Typography>
                  <Typography><strong>Alergias:</strong> {pacienteSeleccionado.alergias || "Ninguna"}</Typography>
                  <Typography><strong>Enfermedades:</strong> {pacienteSeleccionado.enfermedad || "Ninguna"}</Typography>
                  <Typography><strong>Cirugía Estética:</strong> {pacienteSeleccionado.cirugiaEstetica || "No"}</Typography>
                  <Typography><strong>Consume tabaco:</strong> {pacienteSeleccionado.tabaco || "No"}</Typography>
                  <Typography><strong>Consume alcohol:</strong> {pacienteSeleccionado.alcohol || "No"}</Typography>
                  <Typography><strong>Consume drogas:</strong> {pacienteSeleccionado.drogas || "No"}</Typography>
                  <Typography><strong>Referencia:</strong> {pacienteSeleccionado.referencia || "No especificada"}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* 💆 Tratamientos realizados */}
              <Typography
                variant="h6"
                sx={{ color: "#a36920", fontWeight: "bold", mb: 2 }}
              >
                💆‍♀️ Tratamientos realizados
              </Typography>

              {tratamientos.length === 0 ? (
                <Typography>No hay tratamientos registrados.</Typography>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tratamiento</TableCell>
                        <TableCell>Tipo Atención</TableCell>
                        <TableCell>Especialista</TableCell>
                        <TableCell>Total (S/)</TableCell>
                        <TableCell>Desc. (%)</TableCell>
                        <TableCell>Pago</TableCell>
                        <TableCell>Sesión</TableCell>
                        <TableCell>Fotos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tratamientos.map((t) => {
                        const tieneFotosAntes = CAMPOS_FOTOS_ANTES.some((key) => t[key]);
                        const tieneFotosDespues = CAMPOS_FOTOS_DESPUES.some((key) => t[key]);
                        const tieneFotosLegacy = CAMPOS_FOTOS_LEGACY.some((key) => t[key]);
                        const tieneFotos = tieneFotosAntes || tieneFotosDespues || tieneFotosLegacy;

                        return (
                          <TableRow key={t.id}>
                            <TableCell>{t.fecha?.split(" ")[0]}</TableCell>
                            <TableCell>{t.nombreTratamiento}</TableCell>
                            <TableCell>{t.tipoAtencion}</TableCell>
                            <TableCell>{t.especialista}</TableCell>
                            <TableCell>S/ {(t.precio_total || 0).toFixed(2)}</TableCell>
                            <TableCell>{t.descuento}</TableCell>
                            <TableCell>{t.pagoMetodo}</TableCell>
                            <TableCell>{t.sesion}</TableCell>

                            <TableCell>
                              {tieneFotos && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold" color="#a36920">
                                      ANTES
                                    </Typography>
                                    {tieneFotosAntes ? (
                                      renderMiniaturas(CAMPOS_FOTOS_ANTES, t)
                                    ) : (
                                      <Typography color="textSecondary" variant="caption">
                                        Sin fotos de antes
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold" color="#a36920">
                                      DESPUÉS
                                    </Typography>
                                    {tieneFotosDespues ? (
                                      renderMiniaturas(CAMPOS_FOTOS_DESPUES, t)
                                    ) : (
                                      <Typography color="textSecondary" variant="caption">
                                        Sin fotos del después
                                      </Typography>
                                    )}
                                  </Box>
                                  {tieneFotosLegacy && (
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold" color="#a36920">
                                        Galería previa
                                      </Typography>
                                      {renderMiniaturas(CAMPOS_FOTOS_LEGACY, t)}
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {tratamientoSeleccionado === t.id ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold" color="#a36920" sx={{ mb: 0.5 }}>
                                      Subir fotos de ANTES (máx. 3)
                                    </Typography>
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onClick={(e) => (e.target.value = null)}
                                      onChange={manejarCambioFotos("antes")}
                                    />
                                    {previewsAntes.length > 0 && (
                                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                                        {previewsAntes.map((src, idx) => (
                                          <img
                                            key={`antes-${idx}`}
                                            src={src}
                                            alt="preview antes"
                                            width={70}
                                            style={{ borderRadius: "6px", border: "1px solid #ccc" }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Box>

                                  <Box>
                                    <Typography variant="body2" fontWeight="bold" color="#a36920" sx={{ mb: 0.5 }}>
                                      Subir fotos de DESPUÉS (máx. 3)
                                    </Typography>
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onClick={(e) => (e.target.value = null)}
                                      onChange={manejarCambioFotos("despues")}
                                    />
                                    {previewsDespues.length > 0 && (
                                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                                        {previewsDespues.map((src, idx) => (
                                          <img
                                            key={`despues-${idx}`}
                                            src={src}
                                            alt="preview después"
                                            width={70}
                                            style={{ borderRadius: "6px", border: "1px solid #ccc" }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Box>

                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      mt: 0.5,
                                      color: "#a36920",
                                      borderColor: "#a36920",
                                      alignSelf: "flex-start",
                                    }}
                                    onClick={() => subirFotos(t.id)}
                                  >
                                    💾 Guardar Fotos
                                  </Button>
                                </Box>
                              ) : (
                                <Button
                                  variant="text"
                                  size="small"
                                  sx={{
                                    color: "#a36920",
                                    textTransform: "none",
                                  }}
                                  onClick={() => setTratamientoSeleccionado(t.id)}
                                >
                                  {tieneFotos ? "📸 Actualizar fotos" : "📸 Agregar fotos"}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <Typography
                    align="right"
                    sx={{ mt: 3, color: "#a36920", fontWeight: "bold" }}
                  >
                    💰 Total General: S/ {totalGeneral.toFixed(2)}
                  </Typography>
                </>
              )}
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default HistorialClinico;
