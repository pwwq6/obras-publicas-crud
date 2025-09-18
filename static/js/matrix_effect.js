document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('matrixContainer');
            const canvas = document.getElementById('matrixCanvas');
            const ctx = canvas.getContext('2d');

            const setCanvasDimensions = () => {
                const rect = container.getBoundingClientRect();
                
                // Aquí se asignan los valores en píxeles al canvas.
                canvas.width = rect.width;
                canvas.height = rect.height;

                const cols = Math.floor(canvas.width / 20) + 1;
                const ypos = Array(cols).fill(0);
                return { cols, ypos };
            };

            let { cols, ypos } = setCanvasDimensions();
            const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]';

            function matrixEffect() {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#0F0';
                ctx.font = 'bold pt consolas';

                ypos.forEach((y, ind) => {
                    const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
                    const x = ind * 20;

                    ctx.fillText(text, x, y);

                    if (y > canvas.height + Math.random() * 10000) {
                        ypos[ind] = 0;
                    } else {
                        ypos[ind] = y + 20;
                    }
                });
            }

            window.addEventListener('resize', () => {
                ({ cols, ypos } = setCanvasDimensions());
            });

            setInterval(matrixEffect, 25);
        });