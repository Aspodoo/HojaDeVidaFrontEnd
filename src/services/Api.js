// Dirección del backend
const API_URL = "http://127.0.0.1:5001";

export const obtenerToken = () => {
  return localStorage.getItem("token");
};

export const apiRequest = async (endpoint, opciones = {}) => {
  const token = obtenerToken();

  // Crear los encabezados para enviar la información al servidor
  const headers = {
    ...opciones.headers,
  };

  if (opciones.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error en la petición al servidor");
  }

  return data;
};

// Registro de usuario
export const registro_usuario = (datos) => {
  return apiRequest("/api/registro-usuario", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Inicio de sesión
export const iniciarSesion = async (datos) => {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Consultar hoja de vida del aprendiz logueado
export const obtenerMiHojaVida = () => {
  return apiRequest("/api/mi-hoja-vida");
};

// Eliminar hoja de vida del aprendiz logueado
export const eliminarMiHojaVida = () => {
  return apiRequest("/api/mi-hoja-vida", {
    method: "DELETE",
  });
};

// Listar todas las hojas de vida (Reclutador)
export const obtenerHojasVida = () => {
  return apiRequest("/api/hojas-vida");
};

// Registrar datos personales de hoja de vida
export const registrarHojaVida = (datos) => {
  return apiRequest("/api/registrohv", {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Registrar estudio
export const registrarEstudio = (hojaVidaId, datos) => {
  return apiRequest(`/api/hojasvida/${hojaVidaId}/estudios`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Registrar curso
export const registrarCurso = (hojaVidaId, datos) => {
  return apiRequest(`/api/hojasvida/${hojaVidaId}/cursos`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Registrar experiencia
export const registrarExperiencia = (hojaVidaId, datos) => {
  return apiRequest(`/api/hojasvida/${hojaVidaId}/experiencias`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};

// Registrar habilidad
export const registrarHabilidad = (experienciaId, datos) => {
  return apiRequest(`/api/experiencias/${experienciaId}/habilidades`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
};