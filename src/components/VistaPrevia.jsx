import { useState } from 'react';

function VistaPrevia({ persona, anterior, enviar }) {
  const [enviando, setEnviando] = useState(false);

  const confirmarEnvio = async () => {
    if (!enviar || enviando) return;
    setEnviando(true);
    try {
      await enviar();
    } finally {
      setEnviando(false);
    }
  };

  const urlFoto =
    persona.foto instanceof File
      ? URL.createObjectURL(persona.foto)
      : typeof persona.foto === 'string' && persona.foto
      ? persona.foto
      : null;

  return (
    <div className="pagina-formacion">
      <h1>Resumen de la Hoja de Vida</h1>

      <div className="tarjeta-formulario">
        <h2>Vista Previa de Información</h2>

        {urlFoto && (
          <div className="contenedor-foto" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={urlFoto} alt="Fotografía del aprendiz" />
          </div>
        )}

        <section className="seccion-resumen">
          <h3>Datos Personales</h3>
          <p><strong>Nombre:</strong> {persona.nombre || "No especificado"}</p>
          <p><strong>Edad:</strong> {persona.edad}</p>
          <p><strong>Ciudad:</strong> {persona.ciudad}</p>
          <p><strong>Programa:</strong> {persona.programa}</p>
          <p><strong>Correo:</strong> {persona.correo}</p>
          <p><strong>Ficha:</strong> {persona.ficha}</p>
          <p><strong>Jornada:</strong> {persona.jornada}</p>
        </section>

        <section className="seccion-resumen">
          <h3>Formación Académica</h3>
          <p><strong>Nivel:</strong> {persona.nivel}</p>
          <p><strong>Institución:</strong> {persona.institucion}</p>
          <p><strong>Título:</strong> {persona.titulo}</p>
          <p><strong>Año:</strong> {persona.anio}</p>
          <p><strong>Cursos realizados:</strong></p>

          {persona.cursos && persona.cursos.length > 0 ? (
            <ul>
              {persona.cursos.map((curso, indice) => (
                <li key={indice}>
                  {typeof curso === 'string' ? curso : curso.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p>No se registraron cursos.</p>
          )}
        </section>

        <section className="seccion-resumen">
          <h3>Experiencia Laboral</h3>

          {persona.experiencias && persona.experiencias.length > 0 ? (
            persona.experiencias.map((exp, indice) => (
              <div key={indice} className="detalle">
                <p><strong>Empresa:</strong> {exp.empresa}</p>
                <p><strong>Cargo:</strong> {exp.cargo}</p>
                <p><strong>Tiempo:</strong> {exp.tiempo}</p>

                <p><strong>Funciones:</strong></p>
                <ul>
                  {Array.isArray(exp.funciones) ? (
                    exp.funciones.map((f, i) => <li key={i}>{f}</li>)
                  ) : (
                    <li>{exp.funciones}</li>
                  )}
                </ul>

                <p><strong>Habilidades:</strong></p>
                <ul>
                  {Array.isArray(exp.habilidades) ? (
                    exp.habilidades.map((h, i) => (
                      <li key={i}>{typeof h === 'string' ? h : h.nombre}</li>
                    ))
                  ) : (
                    <li>{exp.habilidades}</li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <p>No se registraron experiencias laborales.</p>
          )}
        </section>

        <div className="botones">
          <button
            type="button"
            className="btn"
            onClick={anterior}
            disabled={enviando}
          >
            ← Editar datos
          </button>

          <button
            type="button"
            className="btn"
            onClick={confirmarEnvio}
            disabled={enviando}
            style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
          >
            {enviando ? 'Guardando hoja de vida...' : 'Confirmar y Enviar →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VistaPrevia;