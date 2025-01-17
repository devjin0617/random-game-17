const participants = [
    "참가자 1", "참가자 2", "참가자 3", "참가자 4",
    "참가자 5", "참가자 6", "참가자 7", "참가자 8",
    "참가자 9", "참가자 10", "참가자 11", "참가자 12",
    "참가자 13", "참가자 14", "참가자 15", "참가자 16",
    "참가자 17"
];

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FF8C94', '#9B59B6', '#3498DB', '#F0A500',
    '#957DAD', '#D4A5A5', '#95E1D3', '#FFB6B9',
    '#9EECFF', '#A8E6CF', '#FFEEAD', '#D4A5A5',
    '#FF7171'
];

let isSelecting = false;
let particles = [];
const particleCanvas = document.getElementById('particleCanvas');
const ctx = particleCanvas.getContext('2d');

class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.onload = function() {
    createWheel();
};

function createWheel() {
    const wheelInner = document.getElementById('wheelInner');
    const angle = 360 / participants.length;

    participants.forEach((participant, index) => {
        const item = document.createElement('div');
        item.className = 'wheel-item';

        const textDiv = document.createElement('div');
        textDiv.className = 'wheel-text';
        textDiv.textContent = participant;
        textDiv.style.transform = `rotate(${-(angle * index + angle/2)}deg)`;

        item.appendChild(textDiv);
        item.style.backgroundColor = colors[index];
        item.style.transform = `rotate(${angle * index}deg)`;
        wheelInner.appendChild(item);
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        if (particle.size <= 0.2) {
            particles.splice(index, 1);
        }
    });

    if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
    } else {
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
}
function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createParticles() {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
    animateParticles();
}

function selectRandom() {
    if (isSelecting) return;

    const resultDiv = document.getElementById('result');
    const button = document.getElementById('spinButton');
    
    isSelecting = true;
    button.disabled = true;

    const winnerIndex = Math.floor(Math.random() * participants.length);
    let shuffleCount = 0;
    const maxShuffles = 20;
    const shuffleInterval = 50;

    const shuffleEffect = setInterval(() => {
        if (shuffleCount >= maxShuffles) {
            clearInterval(shuffleEffect);
            isSelecting = false;
            button.disabled = false;
            resultDiv.innerHTML = `
                <div style="animation: winner 0.5s ease-out">
                    <span style="font-size: 2.5em; color: #e74c3c">🎉 당첨자 🎉</span>
                    <br>
                    <span style="font-size: 3em; color: #2c3e50; text-shadow: 2px 2px 4px rgba(0,0,0,0.3)">
                        ${participants[winnerIndex]}
                    </span>
                </div>
            `;
            createParticles();
            return;
        }

        const randomIndex = Math.floor(Math.random() * participants.length);
        resultDiv.innerHTML = `
            <div style="animation: shuffle 0.1s ease-out">
                <span style="font-size: 2em; color: #3498db">
                    ${participants[randomIndex]}
                </span>
            </div>
        `;
        
        shuffleCount++;
        
        if (shuffleCount > maxShuffles - 5) {
            clearInterval(shuffleEffect);
            setTimeout(() => shuffleEffect, shuffleInterval * 2);
        }
    }, shuffleInterval);
}
