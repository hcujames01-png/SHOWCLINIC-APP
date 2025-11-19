import React from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  // 🔒 Menú según rol
  const menuItemsByRole = {
    doctor: [
      { title: "Pacientes", image: "/images/patients.png", path: "/pacientes" },
      { title: "Tratamientos", image: "/images/treatments.png", path: "/tratamientos" },
      { title: "Inventario", image: "/images/inventory.png", path: "/inventario" },
      { title: "Finanzas", image: "/images/finances.png", path: "/finanzas" },
    ],
    admin: [
      { title: "Pacientes", image: "/images/patients.png", path: "/pacientes" },
      { title: "Tratamientos", image: "/images/treatments.png", path: "/tratamientos" },
      { title: "Inventario", image: "/images/inventory.png", path: "/inventario" },
      { title: "Finanzas", image: "/images/finances.png", path: "/finanzas" },
    ],
  };

  const menuItems = menuItemsByRole[role] || [];

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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(250,240,210,0.5))",
          zIndex: 0,
        },
        "& > *": { position: "relative", zIndex: 1 },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontWeight: "bold",
          color: "#a36920ff",
          mb: 0.3,
          textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        SHOWCLINIC
      </Typography>

      <Typography variant="body2" align="center" sx={{ color: "#2E2E2E", mb: 2 }}>
        Bienvenido, rol: <strong>{role}</strong>
      </Typography>

      <Grid container spacing={1.5} justifyContent="center" alignItems="center" sx={{ maxWidth: "600px" }}>
        {menuItems.map((item, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                transition: "0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 10px rgba(163,105,32,0.6)",
                },
                backdropFilter: "blur(3px)",
                backgroundColor: "rgba(255,255,255,0.85)",
              }}
            >
              <CardActionArea onClick={() => (window.location.href = item.path)} sx={{ textAlign: "center", py: 0.5 }}>
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.title}
                  sx={{
                    width: "35%",
                    height: "auto",
                    mx: "auto",
                    borderRadius: "6px",
                    boxShadow: "0 0 6px rgba(163,105,32,0.3)",
                  }}
                />
                <CardContent sx={{ p: 0.3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "#2E2E2E",
                      mt: 0.3,
                      display: "block",
                    }}
                  >
                    {item.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

