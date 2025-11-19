import React from "react";
import { Box, Paper, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TratamientosMenu() {
  const navigate = useNavigate();
  const colorPrincipal = "#a36920ff";
  const role = localStorage.getItem("role"); // 🔒 Obtiene el rol del usuario logueado

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/images/background-showclinic.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(247,234,193,0.55))",
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 5,
          backgroundColor: "rgba(255,255,255,0.95)",
          zIndex: 1,
          width: "90%",
          maxWidth: 600,
          textAlign: "center",
          boxShadow: "0 8px 25px rgba(163,105,32,0.3)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: colorPrincipal,
            fontWeight: "bold",
            mb: 4,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Módulo de Tratamientos
        </Typography>

        {/* ✅ Botón visible solo para DOCTOR */}
        {role === "doctor" && (
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: colorPrincipal,
              mb: 2,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#8a541a" },
            }}
            onClick={() => navigate("/tratamientos/crear")}
          >
            CREAR TRATAMIENTO
          </Button>
        )}

        {/* ✅ Botón visible para ambos (doctor y admin) */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: colorPrincipal,
            py: 1.5,
            borderRadius: 3,
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#8a541a" },
          }}
          onClick={() => navigate("/tratamientos/comenzar")}
        >
          COMENZAR TRATAMIENTO
        </Button>
      </Paper>
    </Box>
  );
}
