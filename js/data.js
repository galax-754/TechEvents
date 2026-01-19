// Initial Events Data
let events = [
    {
        id: 1,
        title: "DSC DATATHON 2026",
        description: "Competencia de ciencia de datos organizada por el Data Science Club at Tec. Una oportunidad única para demostrar tus habilidades en análisis de datos y machine learning.",
        organizer: "Data Science Club at Tec",
        provider: "Alicia Josefina de la Garza Montelongo",
        audience: "estudiantes",
        mode: "hibrido",
        date: null,
        dateStatus: "proximamente",
        time: null,
        location: null,
        infoLink: "Ver perfil del Data Science Club at Tec",
        registerLink: null,
        status: "approved",
        image: "public/fondo_por_defecto_en_eventos_sin_imagen.jpg"
    },
    {
        id: 2,
        title: "Datathon",
        description: "Evento intensivo de análisis de datos donde equipos compiten resolviendo problemas reales con datasets proporcionados. Ideal para estudiantes interesados en ciencia de datos.",
        organizer: "Laurie Hernández",
        provider: "Mariana Garza Cedillo",
        audience: "estudiantes",
        mode: "presencial",
        date: null,
        dateStatus: "proximamente",
        time: null,
        location: "Monterrey",
        infoLink: "https://www.instagram.com/datascience.mty/?hl=fr",
        registerLink: null,
        status: "approved",
        image: "public/DataThon_imagenPortada.jpg"
    },
    {
        id: 3,
        title: "NASA Space Apps Challenge Monterrey",
        description: "Hackathon internacional de la NASA donde equipos trabajan en desafíos relacionados con la exploración espacial y ciencias de la Tierra. Primer año en Monterrey - algunos participantes llegaron a la competencia global.",
        organizer: "NASA Space Apps MTY",
        provider: "Mariana Garza Cedillo",
        audience: "todos",
        mode: "presencial",
        date: null,
        dateStatus: "proximamente",
        time: null,
        location: "Monterrey",
        infoLink: "https://www.instagram.com/nasa_spaceappsmty",
        registerLink: null,
        status: "approved",
        image: "public/fondo_por_defecto_en_eventos_sin_imagen.jpg"
    },
    {
        id: 4,
        title: "Global Game Jam",
        description: "El evento de desarrollo de videojuegos más grande del mundo. Equipos tienen 48 horas para crear un juego desde cero. Perfecto para estudiantes de LMAD y LCC interesados en desarrollo de videojuegos.",
        organizer: "Global Game Jam",
        provider: "Arturo Rodriguez",
        audience: "estudiantes",
        mode: "presencial",
        date: null,
        dateStatus: "proximamente",
        time: null,
        location: "Monterrey",
        infoLink: "https://www.instagram.com/reel/DSfeMb9kfGj/?igsh=Y3JmbnRiZDJzNndk",
        registerLink: null,
        status: "approved",
        image: "public/fondo_por_defecto_en_eventos_sin_imagen.jpg"
    },
    {
        id: 5,
        title: "Hack4Her",
        description: "Hackathon enfocado en empoderar mujeres en tecnología. Un espacio inclusivo para desarrollar proyectos innovadores y crear networking con otras mujeres en tech.",
        organizer: "Women in Technology",
        provider: "Mia Nicole Arambula Barraza",
        audience: "estudiantes",
        mode: "presencial",
        date: null,
        dateStatus: "proximamente",
        time: null,
        location: "Monterrey",
        infoLink: "https://www.instagram.com/hack4her.mty?igsh=MTE3eWIweTliNm42eQ==",
        registerLink: null,
        status: "approved",
        image: "public/Hack4her_imagenPortada.png"
    },
    {
        id: 6,
        title: "Hackathon UANL/FCFM",
        description: "Hackathon organizado para estudiantes de la FCFM de la UANL. Un evento diseñado para fomentar la innovación y colaboración entre estudiantes de ciencias computacionales.",
        organizer: "FCFM - UANL",
        provider: "Leonardo Elizondo Núñez y Mariana Garza Cedillo",
        audience: "estudiantes",
        mode: "presencial",
        date: null,
        dateStatus: "por-confirmar",
        time: null,
        location: "FCFM, UANL",
        infoLink: null,
        registerLink: null,
        status: "approved",
        image: "public/fondo_por_defecto_en_eventos_sin_imagen.jpg"
    }
];

// Pending submissions (for admin panel)
let pendingEvents = [];

// Save to localStorage
function saveData() {
    localStorage.setItem('techevents_events', JSON.stringify(events));
    localStorage.setItem('techevents_pending', JSON.stringify(pendingEvents));
}

// Load from localStorage
function loadData() {
    const savedEvents = localStorage.getItem('techevents_events');
    const savedPending = localStorage.getItem('techevents_pending');
    
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }
    
    if (savedPending) {
        pendingEvents = JSON.parse(savedPending);
    }
}

// Initialize data
loadData();