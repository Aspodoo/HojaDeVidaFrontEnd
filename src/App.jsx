import { useState } from 'react';

import Header from './components/Header';
import FormularioDatos from './components/FormularioDatos';
import FormacionAcademica from './components/FormularioAcademico';
import ExperienciaLaboral from './components/FormularioExperiencia';
import VistaPrevia from './components/VistaPrevia';
import Footer from './components/Footer';

import './App.css';

function App() {
  const [paso, setPaso] = useState(1);

  const [persona, setPersona] = useState({
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
  });

  const guardarhojavida = async () => {
    try {
      const datosapi = {
        nombre: persona.nombre,
        edad: persona.edad,
        ciudad: persona.ciudad,
        correo: persona.correo,
        fotografia: persona.foto ? persona.foto.name || "" : "",
        programa: persona.programa,
        ficha: persona.ficha,
        jornada: persona.jornada,

        // Formación académica
        nivel: persona.nivel,
        institucion: persona.institucion,
        titulo: persona.titulo,
        anio: persona.anio,
        cursos: persona.cursos,

        // Experiencias con funciones y habilidades
        experiencias: persona.experiencias
      };

      const respuesta = await fetch("http://127.0.0.1:5000/api/registrohv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosapi)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        console.error("Error del servidor:", resultado.mensaje);
        alert(resultado.mensaje || "Error al registrar la hoja de vida");
        return false;
      }

      console.log("Registro exitoso:", resultado);
      alert("¡Hoja de vida registrada con éxito!");
      return true;

    } catch (error) {
      console.error("Error al conectar con Flask:", error);
      alert("No se pudo conectar con el servidor Flask.");
      return false;
    }
  };

  return (
    <div className='contenedor'>
      <Header />

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

      <Footer />
    </div>
  );
}

export default App;