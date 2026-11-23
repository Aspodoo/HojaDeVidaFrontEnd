import { useState, useEffect } from 'react';

import Header from './components/Header';
import Login from './components/Login';
import FormularioDatos from './components/FormularioDatos';
import FormacionAcademica from './components/FormularioAcademico';
import ExperienciaLaboral from './components/FormularioExperiencia';
import VistaPrevia from './components/VistaPrevia';
import Footer from './components/Footer';

import './App.css';

const API_URL = "http://127.0.0.1:5001/api";

const ESTADO_INICIAL_PERSONA = {
  foto: null,
  nombre: "",
  edad: "",
  ciudad: "",
  correo: "",
  programa: "",
  ficha: "",
  jornada: "Mañana",
  nivel: "",
  institucion: "",
  titulo: "",
  anio: "",
  cursos: [],
  experiencias: []
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const [paso, setPaso] = useState(1);
  const [persona, setPersona] = useState(ESTADO_INICIAL_PERSONA);

  // Estados para datos consultados desde Flask
  const [miHv, setMiHv] = useState(null);
  const [listaReclutador, setListaReclutador] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken("");
    setUsuario(null);
    setMiHv(null);
    setListaReclutador([]);
    setPersona(ESTADO_INICIAL_PERSONA);
    setPaso(1);
  };

  // Cargar información automáticamente según el rol al iniciar sesión
  useEffect(() => {
    if (!token || !usuario) return;

    if (usuario.rol === "aprendiz") {
      cargarMiHojaVida(token);
    } else if (usuario.rol === "reclutador") {
      cargarTodasLasHojasVida(token);
    }
  }, [token, usuario]);

  const cargarMiHojaVida = async (tk) => {
    setCargandoDatos(true);
    try {
      const res = await fetch(`${API_URL}/mi-hoja-vida`, {
        headers: { Authorization: `Bearer ${tk}` }
      });

      if (res.ok) {
        const data = await res.json();
        setMiHv(data);
      } else {
        setMiHv(null);
      }
    } catch (error) {
      console.error("Error consultando mi hoja de vida:", error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const cargarTodasLasHojasVida = async (tk) => {
    setCargandoDatos(true);
    try {
      const res = await fetch(`${API_URL}/hojas-vida`, {
        headers: { Authorization: `Bearer ${tk}` }
      });

      if (res.ok) {
        const data = await res.json();
        setListaReclutador(data);
      } else {
        setListaReclutador([]);
      }
    } catch (error) {
      console.error("Error consultando hojas de vida:", error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const manejarLoginExitoso = (data) => {
    setToken(data.token);
    setUsuario(data.usuario);
  };

  // Guardar Hoja de Vida completa en cascada (HV -> Estudios -> Cursos -> Experiencias -> Habilidades)
  const guardarhojavida = async () => {
    try {
      // 1. Registrar datos personales de la HV
      const resHv = await fetch(`${API_URL}/registrohv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: persona.nombre,
          edad: persona.edad,
          ciudad: persona.ciudad,
          correo: persona.correo,
          fotografia: persona.foto ? persona.foto.name || "" : "",
          programa: persona.programa,
          ficha: persona.ficha,
          jornada: persona.jornada
        })
      });

      const dataHv = await resHv.json();
      if (!resHv.ok) {
        alert(dataHv.mensaje || "Error al registrar la hoja de vida");
        return false;
      }

      const hojaVidaId = dataHv.id;

      // 2. Registrar estudio si se llenó
      if (persona.nivel || persona.institucion || persona.titulo) {
        await fetch(`${API_URL}/hojasvida/${hojaVidaId}/estudios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nivel: persona.nivel,
            institucion: persona.institucion,
            titulo: persona.titulo,
            anio_graduacion: persona.anio || 2026
          })
        });
      }

      // 3. Registrar cursos
      if (Array.isArray(persona.cursos)) {
        for (const curso of persona.cursos) {
          const nombreCurso = typeof curso === "string" ? curso : curso.nombre;
          if (nombreCurso) {
            await fetch(`${API_URL}/hojasvida/${hojaVidaId}/cursos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nombre: nombreCurso })
            });
          }
        }
      }

      // 4. Registrar experiencias y sus habilidades
      if (Array.isArray(persona.experiencias)) {
        for (const exp of persona.experiencias) {
          const funcionesTexto = Array.isArray(exp.funciones)
            ? exp.funciones.join(", ")
            : exp.funciones || "";

          const resExp = await fetch(`${API_URL}/hojasvida/${hojaVidaId}/experiencias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              empresa: exp.empresa,
              cargo: exp.cargo,
              tiempo: exp.tiempo,
              funciones: funcionesTexto
            })
          });

          const dataExp = await resExp.json();

          if (resExp.ok && dataExp.id && exp.habilidades) {
            const listaHabilidades = Array.isArray(exp.habilidades)
              ? exp.habilidades
              : [exp.habilidades];

            for (const hab of listaHabilidades) {
              if (hab) {
                await fetch(`${API_URL}/experiencias/${dataExp.id}/habilidades`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ nombre: hab })
                });
              }
            }
          }
        }
      }

      alert("¡Hoja de vida registrada con éxito!");
      await cargarMiHojaVida(token);
      return true;
    } catch (error) {
      console.error("Error al conectar con Flask:", error);
      alert("No se pudo conectar con el servidor Flask en el puerto 5001.");
      return false;
    }
  };

  // Eliminar Hoja de Vida del aprendiz logueado
  const eliminarMiHojaVida = async () => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar tu hoja de vida? Esta acción borrará todos tus estudios, cursos y experiencias.");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/mi-hoja-vida`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.mensaje || "No se pudo eliminar la hoja de vida");
        return;
      }

      alert("Hoja de vida eliminada correctamente.");
      setMiHv(null);
      setPersona(ESTADO_INICIAL_PERSONA);
      setPaso(1);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  // Si no ha iniciado sesión, mostrar pantalla de Login
  if (!token || !usuario) {
    return (
      <div className="contenedor">
        <Header />
        <Login onLoginSuccess={manejarLoginExitoso} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="contenedor">
      <Header />

      {/* Barra superior de sesión activa */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "860px",
        margin: "16px auto 0",
        padding: "12px 20px",
        background: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #cbd5e1"
      }}>
        <span>
          Sesión activa: <strong>{usuario.nombre}</strong> ({usuario.rol})
        </span>
        <button type="button" className="btn-eliminar" style={{ marginTop: 0 }} onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      {cargandoDatos && (
        <div className="pagina-formacion">
          <p>Cargando información...</p>
        </div>
      )}

      {/* VISTA DEL APRENDIZ */}
      {!cargandoDatos && usuario.rol === "aprendiz" && (
        miHv ? (
          <div className="pagina-formacion">
            <h1>Mi Hoja de Vida Registrada</h1>
            <div className="tarjeta-formulario">
              <section className="seccion-resumen">
                <h3>Datos Personales</h3>
                <p><strong>Nombre:</strong> {miHv.datos_personales.nombre}</p>
                <p><strong>Edad:</strong> {miHv.datos_personales.edad}</p>
                <p><strong>Ciudad:</strong> {miHv.datos_personales.ciudad}</p>
                <p><strong>Correo:</strong> {miHv.datos_personales.correo}</p>
                <p><strong>Programa:</strong> {miHv.datos_personales.programa}</p>
                <p><strong>Ficha:</strong> {miHv.datos_personales.ficha}</p>
                <p><strong>Jornada:</strong> {miHv.datos_personales.jornada}</p>
              </section>

              <section className="seccion-resumen">
                <h3>Estudios</h3>
                {miHv.estudios?.length > 0 ? (
                  miHv.estudios.map((est) => (
                    <div key={est.id} className="detalle">
                      <p><strong>Nivel:</strong> {est.nivel}</p>
                      <p><strong>Institución:</strong> {est.institucion}</p>
                      <p><strong>Título:</strong> {est.titulo}</p>
                      <p><strong>Año de graduación:</strong> {est.anio_graduacion}</p>
                    </div>
                  ))
                ) : (
                  <p>Sin estudios registrados.</p>
                )}
              </section>

              <section className="seccion-resumen">
                <h3>Cursos</h3>
                {miHv.cursos?.length > 0 ? (
                  <ul>
                    {miHv.cursos.map((c) => (
                      <li key={c.id}>{c.nombre}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Sin cursos registrados.</p>
                )}
              </section>

              <section className="seccion-resumen">
                <h3>Experiencia Laboral</h3>
                {miHv.experiencias?.length > 0 ? (
                  miHv.experiencias.map((exp) => (
                    <div key={exp.id} className="detalle">
                      <p><strong>Empresa:</strong> {exp.empresa}</p>
                      <p><strong>Cargo:</strong> {exp.cargo}</p>
                      <p><strong>Tiempo:</strong> {exp.tiempo}</p>
                      <p><strong>Funciones:</strong> {exp.funciones}</p>
                      {exp.habilidades?.length > 0 && (
                        <>
                          <p><strong>Habilidades:</strong></p>
                          <ul>
                            {exp.habilidades.map((h) => (
                              <li key={h.id}>{h.nombre}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Sin experiencias registradas.</p>
                )}
              </section>

              <div className="botones">
                <button
                  type="button"
                  className="btn-eliminar"
                  onClick={eliminarMiHojaVida}
                >
                  Eliminar mi Hoja de Vida
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {paso === 1 && (
              <FormularioDatos
                persona={persona}
                setPersona={setPersona}
                siguiente={() => setPaso(2)}
              />
            )}

            {paso === 2 && (
              <FormacionAcademica
                persona={persona}
                setPersona={setPersona}
                anterior={() => setPaso(1)}
                siguiente={() => setPaso(3)}
              />
            )}

            {paso === 3 && (
              <ExperienciaLaboral
                persona={persona}
                setPersona={setPersona}
                anterior={() => setPaso(2)}
                siguiente={() => setPaso(4)}
              />
            )}

            {paso === 4 && (
              <VistaPrevia
                persona={persona}
                anterior={() => setPaso(3)}
                enviar={guardarhojavida}
              />
            )}
          </>
        )
      )}

      {/* VISTA DEL RECLUTADOR */}
      {!cargandoDatos && usuario.rol === "reclutador" && (
        <div className="pagina-formacion">
          <h1>Hojas de Vida Registradas ({listaReclutador.length})</h1>

          {listaReclutador.length === 0 ? (
            <div className="tarjeta-formulario">
              <p>No hay hojas de vida registradas en el sistema todavía.</p>
            </div>
          ) : (
            listaReclutador.map((item) => (
              <div
                key={item.datos_personales.id}
                className="tarjeta-formulario"
                style={{ marginBottom: "24px" }}
              >
                <h2>{item.datos_personales.nombre}</h2>

                <section className="seccion-resumen">
                  <h3>Datos Personales</h3>
                  <p><strong>Edad:</strong> {item.datos_personales.edad} | <strong>Ciudad:</strong> {item.datos_personales.ciudad}</p>
                  <p><strong>Correo:</strong> {item.datos_personales.correo}</p>
                  <p><strong>Programa:</strong> {item.datos_personales.programa} | <strong>Ficha:</strong> {item.datos_personales.ficha} ({item.datos_personales.jornada})</p>
                </section>

                <section className="seccion-resumen">
                  <h3>Estudios</h3>
                  {item.estudios?.length > 0 ? (
                    item.estudios.map((est) => (
                      <div key={est.id} className="detalle">
                        <p><strong>{est.nivel}:</strong> {est.titulo} - {est.institucion} ({est.anio_graduacion})</p>
                      </div>
                    ))
                  ) : (
                    <p>Sin estudios registrados.</p>
                  )}
                </section>

                <section className="seccion-resumen">
                  <h3>Cursos</h3>
                  {item.cursos?.length > 0 ? (
                    <ul>
                      {item.cursos.map((c) => (
                        <li key={c.id}>{c.nombre}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sin cursos registrados.</p>
                  )}
                </section>

                <section className="seccion-resumen">
                  <h3>Experiencia y Habilidades</h3>
                  {item.experiencias?.length > 0 ? (
                    item.experiencias.map((exp) => (
                      <div key={exp.id} className="detalle">
                        <p><strong>{exp.cargo}</strong> en {exp.empresa} ({exp.tiempo})</p>
                        <p><strong>Funciones:</strong> {exp.funciones}</p>
                        {exp.habilidades?.length > 0 && (
                          <p><strong>Habilidades:</strong> {exp.habilidades.map((h) => h.nombre).join(", ")}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Sin experiencias registradas.</p>
                  )}
                </section>
              </div>
            ))
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;