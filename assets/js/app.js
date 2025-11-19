// ===========================================
// VARIABLES GLOBALES PARA EL ESTADO DEL SIMULACRO
// ===========================================
let preguntasSeleccionadas = []; // Almacena las 20 preguntas del simulacro
let indicePreguntaActual = 0;    // Índice de la pregunta que se está mostrando (0 a 19)
const NUM_PREGUNTAS = 20;       // Total de preguntas a mostrar
let respuestasUsuario = [];     // Array para guardar las respuestas del usuario y su estado
let cronometroIntervalo;        // Variable para el control del cronómetro
let tiempoInicio;               // Marca de tiempo al iniciar

// ===========================================
// INICIALIZACIÓN DE EVENTOS (DOM CONTENT LOADED)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarMenu(); 

    const btnSimulacro = document.getElementById("btnSimulacro");
    if (btnSimulacro) {
        btnSimulacro.addEventListener("click", iniciarSimulacro);
        btnSimulacro.disabled = false;
        btnSimulacro.style.backgroundColor = '#28a745';
        btnSimulacro.textContent = 'Empezar Simulacro';
    }

    const btnSiguiente = document.getElementById("btnSiguiente");
    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", avanzarPregunta);
    }

    const btnVolverMenu = document.getElementById("btnVolverMenu");
    if (btnVolverMenu) {
        btnVolverMenu.addEventListener("click", function() {
            location.href = '../index.html'; 
        });
    }
});



// ===========================================
// LÓGICA DEL CRONÓMETRO
// ===========================================

/**
 * Inicia el cronómetro.
 */
function iniciarCronometro() {
    tiempoInicio = Date.now();
    const cronometroElement = document.getElementById('cronometro');
    cronometroElement.style.display = 'block';

    cronometroIntervalo = setInterval(() => {
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        const segundosTotales = Math.floor(tiempoTranscurrido / 1000);
        
        const horas = Math.floor(segundosTotales / 3600);
        const minutos = Math.floor((segundosTotales % 3600) / 60);
        const segundos = segundosTotales % 60;

        const formatoTiempo = 
            `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        
        cronometroElement.textContent = `Tiempo: ${formatoTiempo}`;
    }, 1000);
}

/**
 * Detiene el cronómetro y devuelve el tiempo final transcurrido.
 * @returns {number} Tiempo transcurrido en milisegundos.
 */
function detenerCronometro() {
    clearInterval(cronometroIntervalo);
    return Date.now() - tiempoInicio;
}

/**
 * Convierte milisegundos a formato HH:MM:SS.
 * @param {number} ms - Tiempo en milisegundos.
 * @returns {string} Tiempo formateado.
 */
function formatearTiempo(ms) {
    const segundosTotales = Math.floor(ms / 1000);
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// ===========================================
// FUNCIÓN PARA OBTENER N PREGUNTAS ALEATORIAS
// ===========================================
function obtenerPreguntasAleatorias(preguntas, num) {
    const preguntasAleatorias = [];
    const indices = [];
    const maxPreguntas = Math.min(num, preguntas.length);

    while (preguntasAleatorias.length < maxPreguntas) {
        const indiceAleatorio = Math.floor(Math.random() * preguntas.length);
        if (!indices.includes(indiceAleatorio)) {
            indices.push(indiceAleatorio);
            preguntasAleatorias.push(preguntas[indiceAleatorio]);
        }
    }
    return preguntasAleatorias;
}
// ===========================================
// LÓGICA DE FLUJO DEL SIMULACRO (MODIFICADO PARA SER DINÁMICO)
// ===========================================

/**
 * Inicia el proceso del simulacro: oculta el botón de inicio y carga las preguntas.
 */

function iniciarSimulacro() {
    // 1. Ocultar la interfaz de inicio
    const interfazInicio = document.getElementById('interfaz-inicio');
    if (interfazInicio) interfazInicio.style.display = 'none';
    
    // 2. Mostrar contenedor del simulacro
    const simulacroContainer = document.getElementById("simulacroContainer");
    if (simulacroContainer) simulacroContainer.style.display = "block";
    
    const reporteFinal = document.getElementById("reporteFinal");
    if (reporteFinal) reporteFinal.style.display = 'none';

    // 3. DETECTAR EL JSON SEGÚN LA PÁGINA ACTUAL (Lógica Dinámica)
    const rutaActual = window.location.pathname;
    let archivoJSON = '';

    if (rutaActual.includes('gestion-publica.html')) {
        archivoJSON = '../data/gestion-publica-territorial.json';
    } else if (rutaActual.includes('normatividad.html')) {
        archivoJSON = '../data/normatividad.json';
    } else if (rutaActual.includes('razonamiento-analitico.html')) {
        archivoJSON = '../data/razonamiento-analitico.json'; // <--- ¡Aquí conectamos el nuevo tema!
    } else {
        // Por defecto o para pruebas
        archivoJSON = '../data/gestion-publica-territorial.json';
    }

    // 4. Cargar las preguntas
    fetch(archivoJSON)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo: ${archivoJSON}`);
            }
            return response.json();
        })
        .then(data => {
            const todasLasPreguntas = Array.isArray(data) ? data : data.preguntas;

            if (!todasLasPreguntas || todasLasPreguntas.length < NUM_PREGUNTAS) {
                alert(`⚠️ El archivo ${archivoJSON} tiene pocas preguntas (${todasLasPreguntas ? todasLasPreguntas.length : 0}). Se mostrarán las disponibles.`);
            }

            // Usar todas si son menos de 20, o elegir 20 al azar
            const cantidad = Math.min(NUM_PREGUNTAS, todasLasPreguntas.length);
            preguntasSeleccionadas = obtenerPreguntasAleatorias(todasLasPreguntas, cantidad);
            
            indicePreguntaActual = 0;
            respuestasUsuario = new Array(cantidad).fill(null);
            
            iniciarCronometro();
            mostrarPreguntaActual();
        })
        .catch(error => {
            console.error('Error:', error);
            if (simulacroContainer) {
                simulacroContainer.innerHTML = `<div style="text-align:center; color: red; padding: 20px;">
                    <h3>🚨 Error al cargar el simulacro</h3>
                    <p>No se encontró el archivo de preguntas: <strong>${archivoJSON.split('/').pop()}</strong></p>
                    <p>Asegúrate de haber creado este archivo en la carpeta <em>data</em>.</p>
                    <button class="boton-simulacro" onclick="location.reload()">Volver a intentar</button>
                </div>`;
            }
        });
}


/**
 * Muestra la pregunta actual en la interfaz y establece sus listeners.
 */
function mostrarPreguntaActual() {
    if (indicePreguntaActual >= NUM_PREGUNTAS) {
        // Si ya superamos el límite, finalizamos
        finalizarSimulacro();
        return;
    }

    const pregunta = preguntasSeleccionadas[indicePreguntaActual];
    const container = document.getElementById("preguntaContainer");
    const btnSiguiente = document.getElementById("btnSiguiente");
    const retroalimentacion = document.getElementById("retroalimentacion");

    // Limpiar y mostrar el encabezado de la pregunta
    container.innerHTML = `<h2 style="color: #4A90E2;">Pregunta ${indicePreguntaActual + 1} de ${NUM_PREGUNTAS}</h2>`;
    retroalimentacion.style.display = 'none';
    retroalimentacion.innerHTML = '';
    
    // Actualizar texto del botón siguiente
    if (indicePreguntaActual === NUM_PREGUNTAS - 1) {
        btnSiguiente.textContent = 'Finalizar Simulacro';
    } else {
        btnSiguiente.textContent = `Siguiente Pregunta (${indicePreguntaActual + 2}/${NUM_PREGUNTAS}) →`;
    }
    btnSiguiente.style.display = 'none';
    
    // Crear la estructura de la pregunta
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    
    const questionTitle = document.createElement("h3");
    questionTitle.textContent = `${pregunta.pregunta}`;
    questionDiv.appendChild(questionTitle);

    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add("options-group");

    pregunta.opciones.forEach((opcionTexto, i) => {
        const match = opcionTexto.match(/^([a-z]\))/i); 
        const opcionValor = match ? match[1].charAt(0).toLowerCase() : String.fromCharCode(97 + i); 

        const optionLabel = document.createElement("label");
        const optionInput = document.createElement("input");
        optionInput.type = "radio";
        optionInput.name = `currentQuestion`;  // Nombre genérico ya que solo hay una visible
        optionInput.value = opcionValor;
        
        // Asignar el evento de validación INMEDIATA
        optionInput.addEventListener('change', validarRespuestaActual);

        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(document.createTextNode(opcionTexto));
        // No añadir <br> aquí para que el CSS maneje el layout
        // optionLabel.appendChild(document.createElement("br")); 

        optionsContainer.appendChild(optionLabel);
    });

    questionDiv.appendChild(optionsContainer);
    container.appendChild(questionDiv);
}

/**
 * Valida la respuesta seleccionada, muestra retroalimentación y habilita el botón Siguiente.
 */
function validarRespuestaActual(event) {
    const seleccionada = event.target;
    const opcionElegida = seleccionada.value;
    const pregunta = preguntasSeleccionadas[indicePreguntaActual];
    const correcta = pregunta.respuesta_correcta.toLowerCase().trim();
    const retroalimentacionDiv = document.getElementById("retroalimentacion");
    const btnSiguiente = document.getElementById("btnSiguiente");
    
    // Deshabilitar todas las opciones para evitar cambiar la respuesta
    document.querySelectorAll('input[name="currentQuestion"]').forEach(input => {
        input.disabled = true;
    });

    // Construir la retroalimentación
    let htmlRetro = '';
    if (opcionElegida === correcta) {
        htmlRetro = `<p style="color: green; font-weight: bold;">✅ ¡Respuesta Correcta!</p>`;
        // Guardar respuesta correcta
        respuestasUsuario[indicePreguntaActual] = true; 
    } else {
        htmlRetro = `<p style="color: red; font-weight: bold;">❌ Respuesta Incorrecta.</p>`;
        // Guardar respuesta incorrecta
        respuestasUsuario[indicePreguntaActual] = false; 
    }

    // Resaltar opciones y mostrar explicación
    htmlRetro += `<p>La respuesta correcta era: <strong>${correcta.toUpperCase()}</strong></p>`;
    htmlRetro += `<p><strong>Explicación:</strong> ${pregunta.explicacion}</p>`;
    
    // Resaltar la respuesta correcta en la interfaz
    const opcionCorrectaInput = document.querySelector(`input[name="currentQuestion"][value="${correcta}"]`);
    if (opcionCorrectaInput) {
        // Encontrar el label contenedor
        const labelCorrecto = opcionCorrectaInput.closest('label');
        if(labelCorrecto) {
            labelCorrecto.style.fontWeight = 'bold';
            labelCorrecto.style.backgroundColor = '#e6ffe6'; // Fondo verde claro
        }
    }


    retroalimentacionDiv.innerHTML = htmlRetro;
    retroalimentacionDiv.style.display = 'block';
    retroalimentacionDiv.style.backgroundColor = (opcionElegida === correcta) ? '#d4edda' : '#f8d7da'; // Colores basados en el resultado
    retroalimentacionDiv.style.borderColor = (opcionElegida === correcta) ? '#c3e6cb' : '#f5c6cb';

    // Habilitar botón de siguiente pregunta
    btnSiguiente.style.display = 'block';
}

/**
 * Avanza al siguiente índice de pregunta o finaliza el simulacro.
 */
function avanzarPregunta() {
    indicePreguntaActual++;
    
    if (indicePreguntaActual < NUM_PREGUNTAS) {
        // Mostrar la siguiente pregunta
        mostrarPreguntaActual();
    } else {
        // Finalizar el simulacro
        finalizarSimulacro();
    }
}

/**
 * Procesa los resultados finales, guarda el intento y muestra el reporte.
 */
function finalizarSimulacro() {
    const tiempoTotal = detenerCronometro();
    const tiempoFormateado = formatearTiempo(tiempoTotal);

    // Calcular el puntaje
    const correctas = respuestasUsuario.filter(res => res === true).length;
    const puntajeCien = (correctas / NUM_PREGUNTAS) * 100;
    const notaMinima = 65; // Nota de aprobación

    // --- LÓGICA DE GUARDADO EN LOCAL STORAGE (AHORA ES DINÁMICA) ---
    // OBTIENE LA CLAVE DINÁMICAMENTE (ej. 'gestion-publica.html' o 'normatividad.html')
    const temaIdentificador = window.location.pathname.split('/').pop(); 
    
    // 1. Obtener el historial actual o un array vacío
    let historial = JSON.parse(localStorage.getItem(temaIdentificador)) || [];
    
    // 2. Crear el nuevo registro del intento
    const nuevoIntento = {
        fecha: new Date().toLocaleDateString('es-CO'),
        hora: new Date().toLocaleTimeString('es-CO'),
        puntaje: puntajeCien.toFixed(2),
        correctas: correctas,
        tiempo: tiempoFormateado
    };
    
    // 3. Añadir el nuevo intento al historial y guardar en localStorage
    historial.push(nuevoIntento);
    localStorage.setItem(temaIdentificador, JSON.stringify(historial));
    // ---------------------------------------------
    
    let resultadoTexto = '';
    let colorResultado = '';

    if (puntajeCien >= notaMinima) {
        resultadoTexto = '¡Felicidades! Has superado la prueba.';
        colorResultado = '#28a745'; // Verde
    } else {
        resultadoTexto = 'No lograste superar la nota mínima requerida.';
        colorResultado = '#dc3545'; // Rojo
    }

    // Ocultar la pregunta y retroalimentación
    document.getElementById("preguntaContainer").innerHTML = '';
    document.getElementById("retroalimentacion").style.display = 'none';
    document.getElementById("btnSiguiente").style.display = 'none';

    // Mostrar el reporte
    const reporteFinalDiv = document.getElementById("reporteFinal");
    reporteFinalDiv.style.display = 'block';
    
    reporteFinalDiv.innerHTML = `
        <h2 style="color: ${colorResultado}; text-align: center;">✅ SIMULACRO FINALIZADO</h2>
        <hr/>
        <div style="padding: 20px; border: 2px solid ${colorResultado}; border-radius: 8px;">
            <p style="font-size: 1.2rem; margin-bottom: 15px; text-align: center;">
                <strong>${resultadoTexto}</strong>
            </p>
            <ul>
                <li><strong>Tiempo Total Invertido:</strong> <span style="font-weight: bold; color: #4A90E2;">${tiempoFormateado}</span></li>
                <li><strong>Preguntas Totales:</strong> 20</li>
                <li><strong>Respuestas Correctas:</strong> <span style="font-weight: bold; color: green;">${correctas}</span></li>
                <li><strong>Respuestas Incorrectas:</strong> <span style="font-weight: bold; color: red;">${NUM_PREGUNTAS - correctas}</span></li>
                <li><strong>Calificación (Escala 0-100):</strong> <span style="font-weight: bold; font-size: 1.3rem; color: ${colorResultado};">${puntajeCien.toFixed(2)}</span></li>
                <li><strong>Nota Mínima de Aprobación:</strong> 65.00 puntos</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="boton-simulacro" onclick="window.location.reload();">Volver a Estudiar / Repetir Simulacro</button>
        </div>
    `;
}

// ===========================================
// FUNCIÓN PARA CARGAR EL MENÚ DE NAVEGACIÓN
// ===========================================
function cargarMenu() {
    const menuContainer = document.getElementById('menu');

    // Solo ejecuta si el contenedor del menú existe (es decir, estamos en la página del menú principal)
    if (!menuContainer) {
        return; 
    }

    fetch('data/ejes-tematicos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo JSON del menú.');
            }
            return response.json();
        })
        .then(data => {
            // Limpia el contenedor antes de añadir nuevos elementos
            menuContainer.innerHTML = '';
            
            // Recorremos los componentes para crear el menú dinámicamente
            data.componentes.forEach(componente => {
                const componentSection = document.createElement('section');
                
                const componentTitle = document.createElement('h2');
                componentTitle.textContent = componente.titulo;
                componentSection.appendChild(componentTitle); // Añade el título del Componente

                // Recorremos los temas dentro de cada componente
                componente.temas.forEach(tema => {
                    // 1. CREAR EL BOTÓN DEL TEMA
                    const button = document.createElement('button');
                    button.textContent = tema.nombre;
                    button.onclick = () => {
                        // Redirige al enlace de cada tema
                        location.href = tema.link;
                    };
                    
                    // 2. AÑADIR EL BOTÓN A LA SECCIÓN
                    componentSection.appendChild(button);

                    // --- LÓGICA PARA MOSTRAR HISTORIAL DEL TEMA INDIVIDUAL ---
                    // Usamos el nombre del archivo (ej. gestion-publica.html) como clave
                    const claveTema = tema.link.split('/').pop(); 
                    const historialTema = JSON.parse(localStorage.getItem(claveTema));

                    if (historialTema && historialTema.length > 0) {
                        // 3. CONSTRUIR EL HISTORIAL HTML
                        let historialHTML = '<ul style="list-style-type: none; padding-left: 0; margin-top: 5px;">';
                        historialTema.forEach((intento, index) => {
                            const colorPuntaje = parseFloat(intento.puntaje) >= 65 ? 'green' : 'red';
                            historialHTML += `
                                <li style="margin-bottom: 5px;">
                                    <span style="font-size: 0.9em; display: block; padding: 5px 0;">
                                        <strong>Intento ${index + 1}:</strong> 
                                        <span style="color: ${colorPuntaje}; font-weight: bold;">
                                            ${intento.puntaje} puntos
                                        </span> 
                                        (${intento.fecha}, ${intento.tiempo})
                                    </span>
                                </li>
                            `;
                        });
                        historialHTML += '</ul>';

                        // 4. CREAR EL CONTENEDOR DE HISTORIAL Y AÑADIRLO
                        const historialDiv = document.createElement('div');
                        historialDiv.innerHTML = historialHTML;
                        historialDiv.style.fontSize = '0.9rem';
                        historialDiv.style.marginTop = '5px';
                        historialDiv.style.marginBottom = '15px';
                        historialDiv.style.padding = '0 10px 10px 10px'; // Ajuste de padding
                        historialDiv.style.backgroundColor = '#eef7ff'; // Fondo suave para separar
                        historialDiv.style.borderRadius = '0 0 5px 5px';
                        historialDiv.style.borderTop = '1px dashed #4A90E2';

                        // Insertamos el div de historial INMEDIATAMENTE DESPUÉS DEL BOTÓN
                        componentSection.appendChild(historialDiv);
                    }
                    // -------------------------------------------------------------
                });

                // Añadimos la sección del componente (con el título, botones y sus historiales) al contenedor principal
                menuContainer.appendChild(componentSection);
            });
        })
        .catch(error => {
            console.error('Error al cargar el menú:', error);
            menuContainer.innerHTML = '<p style="color: red;">No se pudo cargar el menú. Revisa la ruta data/ejes-tematicos.json</p>';
        });
}