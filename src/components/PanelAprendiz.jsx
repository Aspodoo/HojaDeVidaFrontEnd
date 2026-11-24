import { useState, useEffect } from "react";
import {
  obtenerMiHojaVida,
  eliminarMiHojaVida,
  registrarHojaVida,
  registrarEstudio,
  registrarCurso,
  registrarExperiencia,
  registrarHabilidad,
} from "../services/Api";

import FormularioDatos from "./FormularioDatos";
import FormacionAcademica from "./FormularioAcademico";
import ExperienciaLaboral from "./FormularioExperiencia";
import VistaPrevia from "./VistaPrevia";

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
  experiencias: [],
};

function PanelAprendiz() {
  const [paso, setPaso] = useState(1);
  const [persona, setPersona] = useState(ESTADO_INICIAL_PERSONA);
  const [miHv, setMiHv] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarHojaVida = async () => {
    setCargando(true);
    try {
      const data = await obtenerMiHojaVida();
      setMiHv(data);
    } catch {
      setMiHv(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHojaVida();
  }, []);

  const guardarHojaVida = async () => {
    try {
      const dataHv = await registrarHojaVida({
        nombre: persona.nombre,
        edad: persona.edad,
        ciudad: persona.ciudad,
        correo: persona.correo,
        fotografia: persona.foto ? persona.foto.name || "" : "",
        programa: persona.programa,
        ficha: persona.ficha,
        jornada: persona.jornada,
      });

      const hojaVidaId = dataHv.id;

      if (persona.nivel || persona.institucion || persona.titulo) {
        await registrarEstudio(hojaVidaId, {
          nivel: persona.nivel,
          institucion: persona.institucion,
          titulo: persona.titulo,
          anio_graduacion: persona.anio || 2026,
        });
      }

      if (Array.isArray(persona.cursos)) {
        for (const curso of persona.cursos) {
          const nombreCurso = typeof curso === "string" ? curso : curso.nombre;
          if (nombreCurso) {
            await registrarCurso(hojaVidaId, { nombre: nombreCurso });
          }
        }
      }

      if (Array.isArray(persona.experiencias)) {
        for (const exp of persona.experiencias) {
          const funcionesTexto = Array.isArray(exp.funciones)
            ? exp.funciones.join(", ")
            : exp.funciones || "";

          const dataExp = await registrarExperiencia(hojaVidaId, {
            empresa: exp.empresa,
            cargo: exp.cargo,
            tiempo: exp.tiempo,
            funciones: funcionesTexto,
          });

          if (dataExp.id && exp.habilidades) {
            const listaHabilidades = Array.isArray(exp.habilidades)
              ? exp.habilidades
              : [exp.habilidades];

            for (const hab of listaHabilidades) {
              if (hab) {
                await registrarHabilidad(dataExp.id, { nombre: hab });
              }
            }
          }
        }
      }

      alert("¡Hoja de vida registrada con éxito!");
      await cargarHojaVida();
      return true;
    } catch (error) {
      alert(error.message || "Error al registrar la hoja de vida");
      return false;
    }
  };

  const manejarEliminar = async () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar tu hoja de vida? Se borrarán también tus estudios, cursos y experiencias."
    );
    if (!confirmar) return;

    try {
      await eliminarMiHojaVida();
      alert("Hoja de vida eliminada correctamente.");
      setMiHv(null);
      setPersona(ESTADO_INICIAL_PERSONA);
      setPaso(1);
    } catch (error) {
      alert(error.message || "No se pudo eliminar la hoja de vida");
    }
  };

  if (cargando) {
    return (
      <div className="pagina-formacion">
        <p>Cargando información...</p>
      </div>
    );
  }

  if (miHv) {
    return (
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
              onClick={manejarEliminar}
            >
              Eliminar mi Hoja de Vida
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
          enviar={guardarHojaVida}
        />
      )}
    </>
  );
}

export default PanelAprendiz;