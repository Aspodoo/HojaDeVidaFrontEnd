import { useState, useEffect } from "react";
import { obtenerHojasVida } from "../services/Api";

function PanelReclutador() {
  const [hojasVida, setHojasVida] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarListado = async () => {
      try {
        const data = await obtenerHojasVida();
        setHojasVida(data);
      } catch (err) {
        setError(err.message || "No se pudieron cargar las hojas de vida");
      } finally {
        setCargando(false);
      }
    };

    cargarListado();
  }, []);

  if (cargando) {
    return (
      <div className="pagina-formacion">
        <p>Cargando hojas de vida...</p>
      </div>
    );
  }

  return (
    <div className="pagina-formacion">
      <h1>Hojas de Vida Registradas ({hojasVida.length})</h1>

      {error && <div className="alerta-error">{error}</div>}

      {hojasVida.length === 0 ? (
        <div className="tarjeta-formulario">
          <p>No hay hojas de vida registradas en el sistema todavía.</p>
        </div>
      ) : (
        hojasVida.map((item) => (
          <div
            key={item.datos_personales.id}
            className="tarjeta-formulario"
            style={{ marginBottom: "24px" }}
          >
            <h2>{item.datos_personales.nombre}</h2>

            <section className="seccion-resumen">
              <h3>Datos Personales</h3>
              <p>
                <strong>Edad:</strong> {item.datos_personales.edad} |{" "}
                <strong>Ciudad:</strong> {item.datos_personales.ciudad}
              </p>
              <p><strong>Correo:</strong> {item.datos_personales.correo}</p>
              <p>
                <strong>Programa:</strong> {item.datos_personales.programa} |{" "}
                <strong>Ficha:</strong> {item.datos_personales.ficha} (
                {item.datos_personales.jornada})
              </p>
            </section>

            <section className="seccion-resumen">
              <h3>Estudios</h3>
              {item.estudios?.length > 0 ? (
                item.estudios.map((est) => (
                  <div key={est.id} className="detalle">
                    <p>
                      <strong>{est.nivel}:</strong> {est.titulo} -{" "}
                      {est.institucion} ({est.anio_graduacion})
                    </p>
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
                    <p>
                      <strong>{exp.cargo}</strong> en {exp.empresa} ({exp.tiempo})
                    </p>
                    <p><strong>Funciones:</strong> {exp.funciones}</p>
                    {exp.habilidades?.length > 0 && (
                      <p>
                        <strong>Habilidades:</strong>{" "}
                        {exp.habilidades.map((h) => h.nombre).join(", ")}
                      </p>
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
  );
}

export default PanelReclutador;