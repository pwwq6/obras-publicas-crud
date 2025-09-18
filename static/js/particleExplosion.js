// C:\Users\ANALISTA\Desktop\IA\static\js\particleExplosion.js
const particleExplosion = (() => {
    let canvas;
    let ctx;
    let particles = [];
    let animationFrameId;

    // Colores base para la explosión
    const colors = [


        '#FF4081', // Rosa Vibrante (similar a hot pink)
        '#FFEA00', // Amarillo Neón
        '#2979FF', // Azul Eléctrico
        '#69F0AE', // Verde Menta Brillante
        '#EA80FC', // Morado Vibrante
        '#00E5FF', // Cian Brillante
        '#FF9100', // Naranja Brillante
        '#CCFF00'  // Lima Neón

    ];

    // Clase para representar cada partícula
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = Math.random() * 35 + 5; // Tamaño grande para que sea visible
            this.velocity = {
                x: (Math.random() - 0.5) * (Math.random() * 15 + 5), // Velocidad alta
                y: (Math.random() - 0.5) * (Math.random() * 15 + 5)
            };
            this.alpha = 1; // Opacidad inicial
            this.friction = 0.99; // Muy poca fricción
            this.gravity = 0.005; // Casi sin gravedad
            
            this.life = 600; // Vida útil muy larga (10 segundos a 60 FPS)
            this.maxLife = this.life;
           // console.log('Particle: Partícula creada en', x, y, 'con radio', this.radius); // LOG
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
            // No loguear por cada frame, solo para depuración inicial si no se ve nada
            // console.log('Particle: Dibujando en', this.x, this.y, 'alpha', this.alpha);
        }

        update() {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;

            this.x += this.velocity.x;
            this.y += this.velocity.y;

            this.life--;
            this.alpha = Math.max(0, this.life / this.maxLife);
            this.radius *= 0.997;

            this.draw();
        }
    }

    // Función principal de animación
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia todo el canvas

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update();

            if (particle.alpha <= 0.001 || particle.radius <= 0.1 || particle.life <= 0) {
                particles.splice(i, 1);
            }
        }

        if (particles.length === 0) {
            cancelAnimationFrame(animationFrameId);
            canvas.style.display = 'none';
           // console.log('Explosión de partículas terminada y canvas oculto.'); // LOG
        }
    };

    // Función para iniciar la explosión
    const startExplosion = (originElementSelector = '#player-container', numParticles = 1000) => { // Más partículas
       // console.log('ParticleExplosion: Intentando iniciar explosión...'); // LOG

        if (!canvas) {
          //  console.log('ParticleExplosion: Canvas no existe, creándolo...'); // LOG
            canvas = document.createElement('canvas');
            canvas.id = 'particle-explosion-canvas';
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
          //  console.log('ParticleExplosion: Canvas creado e inicializado.'); // LOG
        }

        // --- CAMBIO CLAVE: CANVAS A PANTALLA COMPLETA ---
        canvas.style.position = 'fixed';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.width = window.innerWidth; // Ancho de la ventana
        canvas.height = window.innerHeight; // Alto de la ventana
        canvas.style.pointerEvents = 'none'; // Permite clics a través del canvas
        canvas.style.zIndex = 999; // Z-index extremadamente alto
        canvas.style.display = 'block'; // Asegura que el canvas esté visible
       // console.log('ParticleExplosion: Canvas configurado a pantalla completa. Dimensiones:', canvas.width, 'x', canvas.height); // LOG

        // Obtener el punto de origen de la explosión (ahora relativo a la ventana, no al reproductor)
        // Usaremos el centro del reproductor en pantalla para el origen,
        // incluso si el canvas es más grande.
        const originElement = document.querySelector(originElementSelector);
        let originX = window.innerWidth / 1; // Default: centro de la pantalla
        let originY = window.innerHeight / 1; // Default: centro de la pantalla

        if (originElement) {
            const rect = originElement.getBoundingClientRect();
            // Calcular el centro del elemento en coordenadas de la ventana
            originX = rect.left + rect.width / 1;
            originY = rect.top + rect.height / 1;
          //  console.log('ParticleExplosion: Origen de la explosión calculado desde elemento:', originElementSelector, 'en X:', originX, 'Y:', originY); // LOG
        } else {
           / console.warn(`ParticleExplosion: Elemento de origen "${originElementSelector}" no encontrado, usando centro de pantalla como origen.`); // LOG
        }

        // Crear partículas
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(originX, originY, randomColor));
        }
      // console.log(`ParticleExplosion: Creadas ${numParticles} partículas.`); // LOG

        // Iniciar la animación
        if (!animationFrameId) {
         //   console.log('ParticleExplosion: Iniciando bucle de animación.'); // LOG
            animate();
        } else {
            cancelAnimationFrame(animationFrameId);
           // console.log('ParticleExplosion: Reiniciando bucle de animación.'); // LOG
            animate();
        }
    };

    return {
        startExplosion: startExplosion
    };
})();