import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PacientesMenu from "./pages/PacientesMenu";
import RegistrarPaciente from "./pages/RegistrarPaciente";
import BuscarPaciente from "./pages/BuscarPaciente";
import TratamientosMenu from "./pages/tratamientos/TratamientosMenu";
import CrearTratamiento from "./pages/tratamientos/CrearTratamiento";
import ComenzarTratamiento from "./pages/tratamientos/ComenzarTratamiento";
import Inventario from "./pages/inventario/Inventario";
import HistorialClinico from "./pages/HistorialClinico";
import Finanzas from "./pages/Finanzas";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<PacientesMenu />} />
        <Route path="/pacientes/registrar" element={<RegistrarPaciente />} />
        <Route path="/pacientes/buscar" element={<BuscarPaciente />} />
        <Route path="/tratamientos" element={<TratamientosMenu />} />
        <Route path="/tratamientos/crear" element={<CrearTratamiento />} /> 
        <Route path="/tratamientos/comenzar" element={<ComenzarTratamiento />} />
        <Route path="/inventario" element={<Inventario />} />
        
        <Route path="/historial-clinico" element={<HistorialClinico />} />
         <Route path="/finanzas" element={<Finanzas />} /> {/* ✅ Nueva ruta */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;


