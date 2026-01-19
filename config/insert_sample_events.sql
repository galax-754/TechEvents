-- Script para insertar eventos de prueba en Supabase
-- Ejecuta este script en el SQL Editor de Supabase si no tienes eventos

-- IMPORTANTE: Asegúrate de que las tablas estén creadas primero (ejecuta schema.sql)

-- Insertar eventos de ejemplo con status 'approved'
INSERT INTO events (
    title,
    description,
    organizer,
    provider,
    audience,
    mode,
    date_type,
    status,
    image,
    location,
    info_link
) VALUES 
(
    'DSC DATATHON 2026',
    'Competencia de ciencia de datos organizada por el Data Science Club at Tec. Una oportunidad única para demostrar tus habilidades en análisis de datos y machine learning.',
    'Data Science Club at Tec',
    'Alicia Josefina de la Garza Montelongo',
    'estudiantes',
    'hibrido',
    'pending',
    'approved',
    '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
    NULL,
    NULL
),
(
    'Datathon',
    'Evento intensivo de análisis de datos donde equipos compiten resolviendo problemas reales con datasets proporcionados. Ideal para estudiantes interesados en ciencia de datos.',
    'Laurie Hernández',
    'Mariana Garza Cedillo',
    'estudiantes',
    'presencial',
    'pending',
    'approved',
    '/public/DataThon_imagenPortada.jpg',
    'Monterrey',
    'https://www.instagram.com/datascience.mty/?hl=fr'
),
(
    'NASA Space Apps Challenge Monterrey',
    'Hackathon internacional de la NASA donde equipos trabajan en desafíos relacionados con la exploración espacial y ciencias de la Tierra. Primer año en Monterrey - algunos participantes llegaron a la competencia global.',
    'NASA Space Apps MTY',
    'Mariana Garza Cedillo',
    'todos',
    'presencial',
    'pending',
    'approved',
    '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
    'Monterrey',
    'https://www.instagram.com/nasa_spaceappsmty'
),
(
    'Global Game Jam',
    'El evento de desarrollo de videojuegos más grande del mundo. Equipos tienen 48 horas para crear un juego desde cero. Perfecto para estudiantes de LMAD y LCC interesados en desarrollo de videojuegos.',
    'Global Game Jam',
    'Arturo Rodriguez',
    'estudiantes',
    'presencial',
    'pending',
    'approved',
    '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
    'Monterrey',
    'https://www.instagram.com/reel/DSfeMb9kfGj/?igsh=Y3JmbnRiZDJzNndk'
),
(
    'Hack4Her',
    'Hackathon enfocado en empoderar mujeres en tecnología. Un espacio inclusivo para desarrollar proyectos innovadores y crear networking con otras mujeres en tech.',
    'Women in Technology',
    'Mia Nicole Arambula Barraza',
    'estudiantes',
    'presencial',
    'pending',
    'approved',
    '/public/Hack4her_imagenPortada.png',
    'Monterrey',
    'https://www.instagram.com/hack4her.mty?igsh=MTE3eWIweTliNm42eQ=='
),
(
    'Hackathon UANL/FCFM',
    'Hackathon organizado para estudiantes de la FCFM de la UANL. Un evento diseñado para fomentar la innovación y colaboración entre estudiantes de ciencias computacionales.',
    'FCFM - UANL',
    'Leonardo Elizondo Núñez y Mariana Garza Cedillo',
    'estudiantes',
    'presencial',
    'pending',
    'approved',
    '/public/fondo_por_defecto_en_eventos_sin_imagen.jpg',
    'FCFM, UANL',
    NULL
)
ON CONFLICT DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 
    id,
    title,
    status,
    created_at
FROM events 
WHERE status = 'approved'
ORDER BY created_at DESC;

-- Si ves los eventos listados arriba, ¡están listos para mostrarse en la aplicación!
