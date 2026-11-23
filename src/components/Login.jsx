import { useState } from "react";
import { iniciarSesion } from "../services/Api";

function Login({ onLoginSuccess, irARegistro }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await iniciarSesion({ correo, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-formacion">
      <div className="login-card">
        <h2 className="login-titulo">Iniciar Sesión</h2>
        <p className="login-subtitulo">Ingresa con tu correo y contraseña</p>

        {error && <div className="alerta-error">{error}</div>}

        <form onSubmit={manejarSubmit} className="login-form">
          <div className="campo-grupo">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="campo-grupo">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {irARegistro && (
          <p className="login-cambio">
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={irARegistro} className="btn-link">
              Regístrate aquí
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;