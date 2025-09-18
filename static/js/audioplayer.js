// C:\Users\ANALISTA\Desktop\IA\static\js\audioPlayer.js

const audioPlayer = (() => {
    
    let audio; // Cambiado de 'const' a 'let' y sin inicializar aquí
    let playlist = [];
    let currentTrackIndex = 0;
    let isPlaying = false; // Estado para saber si está reproduciendo o pausado

    // --- Variables para Web Audio API ---
    // Se inicializarán cuando el usuario interactúe por primera vez
    let audioContext = null;
    let sourceNode;
    let gainNode; // Para control de volumen (reemplaza audio.volume directo)
    let compressorNode; // Para compresión de rango dinámico
    let lowShelfFilter; // Para realzar/atenuar bajos
    let midFilter;      // Para realzar/atenuar medios
    let highShelfFilter; // Para realzar/atenuar agudos


    // Referencias a elementos de la UI
    let playBtn;
    let prevBtn;
    let nextBtn;
    let shuffleBtn;
    let playlistToggleBtn;
    let playlistContainer;
    let songTitleText;
    let currentTimeSpan;
    let totalTimeSpan;
    let progressRange;
    let progressFill;
    let playlistUl;
    let volumeRange; // Elemento para el control de volumen principal


    // --- Funciones Internas del Reproductor ---

    // Formatea el tiempo a MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Carga una canción de la playlist por su índice
    const loadTrack = (index) => {
        if (playlist.length === 0) {
            console.warn('AudioPlayer: No hay canciones en la playlist para cargar.');
            if (songTitleText) songTitleText.textContent = 'No hay canciones disponibles';
            audio.src = ''; // Limpiar la fuente
            return;
        }

        currentTrackIndex = index;
        const track = playlist[currentTrackIndex];

        if (track && track.src) {
            audio.src = track.src; // Establece la URL de la canción
            audio.load(); // Carga la canción (pero no la reproduce aún)

            if (songTitleText) songTitleText.textContent = track.title; // Actualiza el título en la UI

            if (progressRange) progressRange.value = 0; // Reinicia la barra de progreso
            if (progressFill) progressFill.style.width = '0%'; // Reinicia el relleno
            if (currentTimeSpan) currentTimeSpan.textContent = '00:00';
            if (totalTimeSpan) totalTimeSpan.textContent = '00:00';
           // console.log(`AudioPlayer: Cargando track: ${track.title} con src: ${audio.src}`);
            renderPlaylist(); // Actualiza la lista para marcar la canción activa
        } else {
           // console.error('AudioPlayer: Track inválido o sin src en el índice:', index, track);
            if (songTitleText) songTitleText.textContent = 'Error al cargar canción';
        }
    };

    // Reproducir la canción actual
    const playTrack = () => {
        if (!audio.src) {; // No reproducir si no hay fuente
           // console.warn('AudioPlayer: No hay fuente de audio para reproducir.');
            return; // No reproducir si no hay fuente
        }   
        // *** Importante: Inicializar o reanudar AudioContext en la primera interacción del usuario ***
        if (!audioContext) {
            initAudioContext(); // Crea el contexto y la cadena de nodos la primera vez
        } else if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
            //    console.log('AudioContext resumed successfully');
                attemptAudioPlay(); // Intentar reproducir después de reanudar

            }).catch(e => {
              //  console.error('Error al reanudar AudioContext:', e);
                isPlaying = false;
                if (playBtn) playBtn.classList.replace('fa-pause', 'fa-play');
            });
            return;
        }
        attemptAudioPlay();
    };
    
    // Nueva función para encapsular el intento de reproducción
    const attemptAudioPlay = () => {
        audio.play().then(() => {
            isPlaying = true;
            if (playBtn) playBtn.classList.replace('fa-play', 'fa-pause'); // Cambiar icono a pausa
               // console.log('AudioPlayer: Reproduciendo.');
                setupMarquee(); // Asegurar que el marquee se inicie/ajuste al reproducir
            }).catch(error => {
                isPlaying = false;
                if (playBtn) playBtn.classList.replace('fa-pause', 'fa-play'); // Volver a play
                //    console.error('AudioPlayer: Error al intentar reproducir:', error);
                if (error.name === "NotAllowedError" || error.name === "AbortError") {
                //    console.warn("AudioPlayer: La reproducción automática fue bloqueada por el navegador o interrumpida. Haz clic en 'Play' para iniciar.");
            // Considerar una UI visible para esto.
                } else {
                    console.error('Error desconocido al intentar reproducir:', error);
                }
            });
    };
    // Pausar la canción actual
    const pauseTrack = () => {
        audio.pause();
        isPlaying = false;
        if (playBtn) playBtn.classList.replace('fa-pause', 'fa-play'); // Cambiar icono a play
//        console.log('AudioPlayer: Pausado.');
    };

    // Pasar a la siguiente canción
    const nextTrack = () => {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) playTrack();
    };

    // Pasar a la canción anterior
    const prevTrack = () => {
        if (playlist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) playTrack();
    };

    // Barajar la playlist (Algoritmo de Fisher-Yates)
    const shufflePlaylist = () => {
        if (playlist.length <= 1) return;

        for (let i = playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playlist[i], playlist[j]] = [playlist[j], playlist[i]]; // Intercambia elementos
        }
       // console.log('AudioPlayer: Playlist barajada:', playlist);
        currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
    };

    // Actualiza la barra de progreso y los tiempos
    const updateProgress = () => {
        const duration = audio.duration;
        const currentTime = audio.currentTime;

        if (isNaN(duration) || !isFinite(duration)) {
            if (progressRange) progressRange.value = 0;
            if (currentTimeSpan) currentTimeSpan.textContent = '00:00';
            if (totalTimeSpan) totalTimeSpan.textContent = '00:00';
            if (progressFill) progressFill.style.width = '0%';
            return;
        }

        const progressPercent = (currentTime / duration) * 100;

        if (progressRange) progressRange.value = progressPercent;
        if (progressFill) progressFill.style.width = `${progressPercent}%`;

        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(currentTime);
        if (totalTimeSpan) totalTimeSpan.textContent = formatTime(duration);
    };

    const updateVolumeSliderFill = () => {
        if (volumeRange) {
            const volumePercent = parseFloat(volumeRange.value) * 100;
            volumeRange.style.setProperty('--volume-fill', `${volumePercent}%`);
        }
    };

    // Salto en la canción al arrastrar la barra de progreso
    const setProgress = () => {
        if (audio.duration) {
            const seekTime = (parseFloat(progressRange.value) / 100) * audio.duration;
            audio.currentTime = seekTime;
        }
    };

    // Renderiza la lista de canciones en la UI
    const renderPlaylist = () => {
        if (!playlistUl) return;

        playlistUl.innerHTML = '';
        if (playlist.length === 0) {
            playlistUl.innerHTML = '<li>No hay canciones en la playlist.</li>';
            return;
        }

        playlist.forEach((track, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${track.title}`;
            listItem.dataset.index = index;
            listItem.classList.add('playlist-item');
            if (index === currentTrackIndex) {
                listItem.classList.add('active');
            } else {
                listItem.classList.remove('active');
            }
            listItem.addEventListener('click', () => {
                loadTrack(index);
                playTrack();
            });
            playlistUl.appendChild(listItem);
        });
    };

    // Función para manejar el marquee del título
    const setupMarquee = () => {
        if (!songTitleText) {
            //console.warn("AudioPlayer: Elemento songTitleText no encontrado para el marquee.");
            return;
        }

        const titleContainer = songTitleText.parentElement;
        if (!titleContainer) {
           // console.warn("AudioPlayer: Contenedor del título (p.title) no encontrado para el marquee.");
            return;
        }

        songTitleText.style.animationPlayState = 'paused';
        songTitleText.style.transform = 'translateX(0)';
        songTitleText.style.setProperty('--marquee-duration', '0s');

        setTimeout(() => {
            const containerWidth = titleContainer.offsetWidth;
            const textWidth = songTitleText.scrollWidth;

            if (textWidth > containerWidth) {
                const duration = textWidth / 40;
                songTitleText.style.setProperty('--marquee-duration', `${duration}s`);
                songTitleText.style.animationPlayState = 'running';
               // console.log(`Marquee activado: textWidth=${textWidth}px, containerWidth=${containerWidth}px, duration=${duration}s`);
            } else {
                songTitleText.style.animationPlayState = 'paused';
                songTitleText.style.transform = 'translateX(0)';
              //  console.log(`Marquee pausado: texto cabe. textWidth=${textWidth}px, containerWidth=${containerWidth}px`);
            }
        }, 50);
    };

    // Toggle para mostrar/ocultar la playlist
    const togglePlaylistVisibility = () => {
        if (!playlistContainer) return;

        const isHidden = playlistContainer.style.display === 'none' || playlistContainer.style.display === '';
        playlistContainer.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            renderPlaylist();
        }
    };

    // Función para cargar la playlist desde el backend
    const loadPlaylistFromBackend = async () => {
        try {
            const response = await fetch('/api/playlist');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }
            playlist = await response.json();
           // console.log('AudioPlayer: Playlist cargada desde el backend:', playlist);

            if (playlist.length > 0) {
                currentTrackIndex = 0;
                loadTrack(currentTrackIndex);
            } else {
           //     console.warn('AudioPlayer: La playlist está vacía después de la carga del backend.');
            }
            renderPlaylist();
        } catch (error) {
           // console.error('AudioPlayer: Error al cargar la playlist desde el backend:', error);
            if (songTitleText) songTitleText.textContent = 'Error al cargar la playlist';
        }
    };

    // --- Funciones para la Web Audio API y Nivelación Automática ---
    const initAudioContext = () => {
        // Solo crea el AudioContext una vez y cuando se necesite
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
           // console.log('AudioPlayer: AudioContext creado.');
        }

        // Si los nodos ya existen y están conectados, no los recrees
        if (sourceNode && sourceNode.context === audioContext) {
           // console.log('AudioPlayer: Nodos de Web Audio ya conectados. Reutilizando.');
            return;
        }

        // Conecta el elemento <audio> al grafo de Web Audio API
        sourceNode = audioContext.createMediaElementSource(audio);

        // 1. GainNode (Control de Volumen)
        gainNode = audioContext.createGain();
        // Sincroniza el GainNode con el volumen del slider al inicio
        if (volumeRange) {
            gainNode.gain.value = parseFloat(volumeRange.value);
        } else {
            gainNode.gain.value = 0.5; // Valor por defecto si el slider no existe al inicializar
        }
        //ACA SIM SE MODIFICA EL NIVEL DE AUDIO
        // 2. DynamicsCompressorNode (Compresión para nivelar el volumen general)
        compressorNode = audioContext.createDynamicsCompressor();
        // Valores preestablecidos para una nivelación "adecuada"
        // Estos valores son un buen punto de partida para una compresión general.
        compressorNode.threshold.setValueAtTime(-32, audioContext.currentTime); // Más bajo = más compresión de picos
        compressorNode.knee.setValueAtTime(30, audioContext.currentTime);     // Suavidad de la transición
        compressorNode.ratio.setValueAtTime(10, audioContext.currentTime);    // Relación de compresión (8:1 es bastante)
        compressorNode.attack.setValueAtTime(0.008, audioContext.currentTime); // Ataque rápido
        compressorNode.release.setValueAtTime(0.200, audioContext.currentTime); // Liberación media
       // console.log('AudioPlayer: DynamicsCompressorNode configurado.');


        // 3. BiquadFilterNodes (Ecualizador de 3 bandas para corrección tonal)
        // Estos valores buscan un sonido más "estándar" y agradable si no hay controles manuales.
        // Puedes ajustarlos si quieres un perfil de sonido diferente.

        // Bajos (LowShelf)
        lowShelfFilter = audioContext.createBiquadFilter();
        lowShelfFilter.type = "lowshelf";
        lowShelfFilter.frequency.setValueAtTime(150, audioContext.currentTime); // Frecuencia de corte para bajos
        lowShelfFilter.gain.setValueAtTime(3, audioContext.currentTime);     // Pequeño realce de bajos (+3dB)
        //console.log('AudioPlayer: LowShelfFilter configurado.');

        // Medios (Peaking)
        midFilter = audioContext.createBiquadFilter();
        midFilter.type = "peaking";
        midFilter.frequency.setValueAtTime(1000, audioContext.currentTime);   // Frecuencia central para medios
        midFilter.Q.setValueAtTime(1, audioContext.currentTime);              // Ancho de banda
        midFilter.gain.setValueAtTime(0, audioContext.currentTime);          // Sin cambio en medios por defecto
      //  console.log('AudioPlayer: MidFilter configurado.');


        // Agudos (HighShelf)
        highShelfFilter = audioContext.createBiquadFilter();
        highShelfFilter.type = "highshelf";
        highShelfFilter.frequency.setValueAtTime(3500, audioContext.currentTime); // Frecuencia de corte para agudos
        highShelfFilter.gain.setValueAtTime(2, audioContext.currentTime);    // Pequeño realce de agudos (+2dB)
      //  console.log('AudioPlayer: HighShelfFilter configurado.');


        // Conecta la cadena de nodos:
        // Source -> Gain -> Compressor -> Low EQ -> Mid EQ -> High EQ -> Destination
        sourceNode.connect(gainNode);
        gainNode.connect(compressorNode);
        compressorNode.connect(lowShelfFilter);
        lowShelfFilter.connect(midFilter);
        midFilter.connect(highShelfFilter);
        highShelfFilter.connect(audioContext.destination);

       // console.log('AudioPlayer: Cadena de nodos de Web Audio API conectada.');
    };

    const updateVolumeIcon = () => {
    // Asegúrate de que volumeRange y volumeIcon (la variable global) existan.
    // volumeIcon ya se asigna en init() como document.getElementById('volume-icon');
        if (!volumeRange || !volumeIcon) return; 
        const currentVolume = gainNode ? gainNode.gain.value : parseFloat(volumeRange.value);
        volumeIcon.classList.remove('fa-volume-off', 'fa-volume-down', 'fa-volume-up');
        if (currentVolume === 0) {
            volumeIcon.classList.add('fa-volume-off');
        } else if (currentVolume < 0.5) {
            volumeIcon.classList.add('fa-volume-down');
        } else {
            volumeIcon.classList.add('fa-volume-up');
        }
    };


    // Función de inicialización del módulo
    const init = () => {
       // console.log('AudioPlayer: Inicializando módulo de audioPlayer.');
        audio = document.getElementById('audio-player');
        if (!audio) {
        //    console.error('AudioPlayer: Elemento <audio id="audio-player"> no encontrado en el DOM. El reproductor no funcionará correctamente.');
            return; // Detener la inicialización si el elemento clave no se encuentra
        }
        // Asignar las referencias a los elementos del DOM después de que el DOM esté listo
        playBtn = document.getElementById('play-btn');
        prevBtn = document.getElementById('prev');
        nextBtn = document.getElementById('next');
        shuffleBtn = document.getElementById('shuffle-btn');
        playlistToggleBtn = document.querySelector('.playlist-toggle');
        playlistContainer = document.querySelector('.playlist-container');
        songTitleText = document.getElementById('song-title-text');
        currentTimeSpan = document.getElementById('current-time');
        totalTimeSpan = document.getElementById('total-time');
        progressRange = document.getElementById('dur');
        progressFill = document.querySelector('.progress-fill');
        playlistUl = document.querySelector('.playlist');
        volumeRange = document.getElementById('volume-range');
        volumeFill = document.querySelector('.volume-slider-container .volume-fill');
        volumeIcon = document.getElementById('volume-icon'); // Asignación

        // Event listener para el redimensionamiento de la ventana (con debounce para rendimiento)
        let resizeTimer;
        // CAMBIO: Usar jQuery para window resize
        $(window).on('resize', () => { 
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setupMarquee, 250);
        });

        // Asegurarse de que los elementos existen antes de añadir listeners
        if (playBtn) {
            $(playBtn).on('click', () => { 
                if (isPlaying) {
                    pauseTrack();
                } else {
                    if (!audio.src && playlist.length > 0) {
                        loadTrack(currentTrackIndex);
                    }
                    playTrack();
                }
            });
        }

        if (prevBtn) {
            $(prevBtn).on('click', () => {
            prevTrack();
            if (isPlaying) playTrack(); // Solo reproduce si ya estaba reproduciendo
            });
        }
        if (nextBtn) {
            $(nextBtn).on('click', () => {
            nextTrack();
            if (isPlaying) playTrack(); // Solo reproduce si ya estaba reproduciendo
            });
        }
        if (shuffleBtn) {
            $(shuffleBtn).on('click', () => {
                shufflePlaylist();
                loadTrack(currentTrackIndex);
                if (isPlaying) playTrack(); // Solo reproduce si ya estaba reproduciendo
            });
        }
        if (playlistToggleBtn) {
            $(playlistToggleBtn).on('click', togglePlaylistVisibility); // <--- CAMBIO AQUÍ
        }
        if (progressRange) {
            $(progressRange).on('input', setProgress); // <--- CAMBIO AQUÍ
        }

        // --- Event listeners para el control de volumen principal ---
        if (volumeRange) {
            // Inicializa el volumen del elemento <audio> con el valor del slider
            // NOTA: Una vez que el AudioContext esté conectado, el volumen del 'audio'
            // ya no controlará directamente la salida; será el 'gainNode'.
            // Sin embargo, mantendremos esta línea para el comportamiento inicial.
            audio.volume = parseFloat(volumeRange.value);
            updateVolumeSliderFill();
            updateVolumeIcon();

            $(volumeRange).on('input', () => { // <--- CAMBIO AQUÍ
                // Ahora, el slider controla el gainNode, no directamente audio.volume
                const newVolume = parseFloat(volumeRange.value);
                if (gainNode) { // Asegúrate de que gainNode exista
                    gainNode.gain.value = newVolume;
                } else { // Fallback si gainNode aún no se ha inicializado
                    audio.volume = parseFloat(volumeRange.value);
                }
                updateVolumeSliderFill();
                updateVolumeIcon();
            });
        }

        // Eventos del propio elemento <audio> (siguen funcionando igual)
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', nextTrack);
        audio.addEventListener('loadedmetadata', () => {
            if (!isNaN(audio.duration) && isFinite(audio.duration)) {
                totalTimeSpan.textContent = formatTime(audio.duration);
            } else {
                totalTimeSpan.textContent = '00:00';
            }
         //   console.log('AudioPlayer: Metadata cargada para:', audio.src);
            setupMarquee(); 
            // ==============================================================
    // === AÑADIR ESTA LÍNEA para activar la explosión de partículas ===
    // ==============================================================
    if (typeof particleExplosion !== 'undefined' && particleExplosion.startExplosion) {
        particleExplosion.startExplosion('#player-container', 40); // '#player-container' es el ID de tu reproductor, 40 es la cantidad de partículas
    } else {
      //  console.warn('particleExplosion no está definido o no tiene el método startExplosion.');
    }
    // ==============================================================
    // ==============================================================

    // Si estaba reproduciendo antes de cargar la nueva pista, intentar reanudar
            if (isPlaying) { 
            playTrack(); // <--- DESCOMENTAR ESTA LÍNEA
            }
            });
        audio.addEventListener('canplay', () => {
       //     console.log('AudioPlayer: Puede reproducir la canción actual.');
            if (isPlaying && audio.paused) {
                attemptAudioPlay(); // Usa la función auxiliar para reintentar play
            }
        });

        // Cargar la playlist al inicio
        loadPlaylistFromBackend().then(() => {
            setupMarquee();
        });
    };

    // Devuelve las funciones que queremos que sean accesibles desde fuera del módulo
    return {
        init: init,
        play: playTrack,
        pause: pauseTrack
    };
})();