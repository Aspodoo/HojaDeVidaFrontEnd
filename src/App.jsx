import { useState } from "react";

import Header from "./components/Header";
import Login from "./components/Login";
import RegistrarUsuario from "./components/RegistrarUsuario";
import PanelAprendiz from "./components/PanelAprendiz";
import PanelReclutador from "./components/PanelReclutador";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });
  const [vistaAuth, setVistaAuth] = useState("login");

  const manejarLoginExitoso = (data) => {
    setToken(data.token);
    setUsuario(data.usuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken("");
    setUsuario(null);
    setVistaAuth("login");
  };

  if (!token || !usuario) {
    return (
      <div className="contenedor">
        <Header />
        {vistaAuth === "login" ? (
          <Login
            onLoginSuccess={manejarLoginExitoso}
            irARegistro={() => setVistaAuth("registro")}
          />
        ) : (
          <RegistrarUsuario irALogin={() => setVistaAuth("login")} />
        )}
        <Footer />
      </div>
    );
  }

  return (
    <div className="contenedor">
      <Header />

      <div className="barra-sesion">
        <span>
          Sesión activa: <strong>{usuario.nombre}</strong> ({usuario.rol})
        </span>
        <button
          type="button"
          className="btn-eliminar"
          style={{ marginTop: 0 }}
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>

      {usuario.rol === "aprendiz" && <PanelAprendiz />}
      {usuario.rol === "reclutador" && <PanelReclutador />}

      <Footer />
    </div>
  );
}

export default App;