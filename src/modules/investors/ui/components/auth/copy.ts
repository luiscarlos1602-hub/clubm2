/** Textos visibles del acceso (maqueta, ADR-012). Los avisos fijos se importan de legal-copy. */
export const AUTH_COPY = {
  brandPanel: {
    eyebrow: "Club de inversión inmobiliaria",
    points: [
      "La empresa compra el inmueble con capital propio.",
      "Las participaciones económicas financian solo la reforma.",
      "Las cifras futuras son proyecciones, nunca promesas.",
    ],
  },
  demoNotice: "Acceso de demostración: no se valida ni guarda ninguna contraseña.",
  fields: {
    email: "Correo electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    password: "Contraseña",
    passwordPlaceholder: "Cualquier valor sirve",
  },
  login: {
    eyebrow: "Ingresar",
    title: "Ingresar al club",
    lead: "Entra con tu correo para ver tu panel, tus participaciones y los proyectos abiertos.",
    submit: "Entrar",
    teamLink: "Acceso del equipo",
    registerPrompt: "¿Aún no tienes cuenta?",
    registerLink: "Crear mi cuenta",
  },
  register: {
    eyebrow: "Registro",
    title: "Crea tu cuenta",
    lead: "Una vista previa en tres pasos. No se envía ni se guarda nada.",
    stepLabel: (current: number, total: number) => `Paso ${current} de ${total}`,
    back: "Atrás",
    next: "Continuar",
    finish: "Crear cuenta de ejemplo",
    loginPrompt: "¿Ya tienes cuenta?",
    loginLink: "Ingresar",
    steps: [
      { id: "datos", title: "Tus datos" },
      { id: "experiencia", title: "Tu experiencia" },
      { id: "riesgos", title: "Lectura de riesgos" },
    ],
    data: {
      fullName: "Nombre y apellido",
      fullNamePlaceholder: "Nombre Apellido",
      phone: "Teléfono",
      phonePlaceholder: "+58 000 0000000",
      city: "Ciudad",
      cityPlaceholder: "Caracas",
    },
    experience: {
      legend: "¿Has participado antes en proyectos inmobiliarios?",
      options: [
        { value: "none", label: "No, sería la primera vez" },
        { value: "some", label: "Sí, en una o dos ocasiones" },
        { value: "frequent", label: "Sí, con frecuencia" },
      ],
      horizon: "¿Cuánto tiempo podrías mantener tu aporte sin necesitarlo?",
      horizonOptions: [
        { value: "short", label: "Menos de 6 meses" },
        { value: "mid", label: "Entre 6 y 12 meses" },
        { value: "long", label: "Más de 12 meses" },
      ],
    },
    risks: {
      intro: "Estos son los puntos clave. El detalle está en los términos y condiciones, que también debes aceptar.",
      items: [
        { id: "perdida", label: "Entiendo que puedo perder parte o la totalidad de mi aporte." },
        { id: "proyeccion", label: "Entiendo que las cifras futuras son proyecciones y no están garantizadas." },
        { id: "plazo", label: "Entiendo que los plazos son estimados y pueden cambiar." },
        { id: "participacion", label: "Entiendo que una participación económica no me hace dueño del inmueble." },
      ],
      terms: { id: "terminos", before: "He leído y acepto los", link: "términos y condiciones", after: "completos, con los riesgos y las condiciones." },
      pending: "Marca todos los puntos para continuar.",
    },
  },
} as const;
