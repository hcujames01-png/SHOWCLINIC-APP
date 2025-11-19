import React from "react";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";

export default function PacientesMenu() {
  const colorPrincipal = "#a36920ff";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/images/background-showclinic.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.65), rgba(247,234,193,0.55))",
          zIndex: 0,
        },
        "& > *": { position: "relative", zIndex: 1 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.9)",
          textAlign: "center",
          width: "400px",
          boxShadow: "0 8px 20px rgba(163,105,32,0.3)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: colorPrincipal,
            mb: 3,
          }}
        >
          PACIENTES
        </Typography>

        <Grid container spacing={3}>
          {/* Buscar Paciente */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: colorPrincipal,
                "&:hover": { backgroundColor: "#8a541a" },
                color: "white",
                py: 1.5,
                borderRadius: 3,
                fontWeight: "bold",
              }}
              onClick={() => (window.location.href = "/pacientes/buscar")}
            >
              Buscar Paciente
            </Button>
          </Grid>

          {/* Registrar Paciente */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: colorPrincipal,
                "&:hover": { backgroundColor: "#8a541a" },
                color: "white",
                py: 1.5,
                borderRadius: 3,
                fontWeight: "bold",
              }}
              onClick={() => (window.location.href = "/pacientes/registrar")}
            >
              Registrar Paciente
            </Button>
          </Grid>

          {/* Historial Clínico */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: colorPrincipal,
                "&:hover": { backgroundColor: "#8a541a" },
                color: "white",
                py: 1.5,
                borderRadius: 3,
                fontWeight: "bold",
              }}
              onClick={() => (window.location.href = "/historial-clinico")}
            >
              Historial Clínico
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
