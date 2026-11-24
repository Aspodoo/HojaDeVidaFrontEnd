import { useState } from "react";
import { registro_usuario } from "../services/Api";

function RegistrarUsuario({ irALogin }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      await registro_usuario({ nombre, correo, password });
      setMensaje("Cuenta creada correctamente. Ya puedes iniciar sesión.");
      setNombre("");
      setCorreo("");
      setPassword("");
    } catch (err) {
      setError(err.message || "No se pudo registrar el usuario");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-formacion">
      <div className="login-card">
        <h2 className="login-titulo">Crear Cuenta</h2>
        <p className="login-subtitulo">Regístrate como aprendiz SENA</p>

        {error && <div className="alerta-error">{error}</div>}
        {mensaje && <div className="alerta-exito">{mensaje}</div>}

        <form onSubmit={manejarSubmit} className="login-form">
          <div className="campo-grupo">
            <label>Nombre completo</label>
            <input
              type="text"
              placeholder="Ej. Raúl Santiago Andrade"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

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
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        {irALogin && (
          <p className="login-cambio">
            ¿Ya tienes cuenta?{" "}
            <button type="button" onClick={irALogin} className="btn-link">
              Inicia sesión aquí
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default RegistrarUsuario;