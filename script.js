class RouletteWheel {
    constructor() {
        this.canvas = document.getElementById('rouletteWheel');
        this.ctx = this.canvas.getContext('2d');
        this.participants = [
            '참가자1', '참가자2', '참가자3', '참가자4', '참가자5',
            '참가자6', '참가자7', '참가자8', '참가자9', '참가자10',
            '참가자11', '참가자12', '참가자13', '참가자14', '참가자15',
            '참가자16', '참가자17'
        ];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71',
            '#F1C40F', '#1ABC9C', '#E67E22', '#9B59B6', '#34495E',
            '#16A085', '#D35400'
        ];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.fireworksContainer = null;
        
        this.init();
        this.setupEventListeners();
        this.initMouseTracking();
    }

    init() {
        this.canvas.width = 500;
        this.canvas.height = 500;
        
        // 3D 효과를 위한 컨테이너 설정
        const container = this.canvas.parentElement;
        container.style.perspective = '1000px';
        container.style.transformStyle = 'preserve-3d';
        
        this.drawWheel();
        this.displayParticipantList();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const thickness = 30; // 룰렛 두께 추가
        const segments = this.participants.length;
        
        // 3D 효과를 위한 그림자 및 입체감 추가
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        // 3D 회전 효과
        const rotationX = Math.sin(this.currentRotation * Math.PI / 180) * 10;
        const rotationY = Math.cos(this.currentRotation * Math.PI / 180) * 10;
        this.canvas.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        
        this.ctx.rotate(this.currentRotation * Math.PI / 180);

        // 룰렛 측면 그리기 (3D 두께 표현)
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 10;
        this.ctx.fill();

        // 각 세그먼트 그리기
        for (let i = 0; i < segments; i++) {
            const angle = (2 * Math.PI) / segments;
            const startAngle = -90 * Math.PI / 180 + (i * angle);
            const endAngle = startAngle + angle;

            // 세그먼트 측면 (3D 두께 표현)
            this.ctx.beginPath();
            this.ctx.moveTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
            this.ctx.lineTo(Math.cos(startAngle) * (radius - thickness), Math.sin(startAngle) * (radius - thickness));
            this.ctx.lineTo(Math.cos(endAngle) * (radius - thickness), Math.sin(endAngle) * (radius - thickness));
            this.ctx.lineTo(Math.cos(endAngle) * radius, Math.sin(endAngle) * radius);
            this.ctx.closePath();
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();

            // 세그먼트 상단
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle, endAngle);
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
            
            // 텍스트 그리기
            this.ctx.save();
            this.ctx.rotate(startAngle + (angle / 2));
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(this.participants[i], radius - 30, 5);
            this.ctx.restore();
        }

        // 중앙 원 그리기
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();

        this.ctx.restore();
        this.drawArrow(centerX, centerY - radius);
    }

    drawArrow(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y - 15);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + 15, y - 15);
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fill();
    }

    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.clearFireworks();
        const spinDuration = 5000;
        const startRotation = this.currentRotation;
        const totalRotation = 360 * 8 + Math.random() * 360;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            const easeOut = (t) => 1 - Math.pow(1 - t, 4);
            const currentProgress = easeOut(progress);
            
            this.currentRotation = startRotation + (totalRotation * currentProgress);
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.showResult();
            }
        };

        requestAnimationFrame(animate);
    }

    showResult() {
        const segmentAngle = 360 / this.participants.length;
        const normalizedRotation = ((this.currentRotation % 360) + 360) % 360;
        
        let segment = Math.floor(((360 - normalizedRotation + 90) % 360) / segmentAngle) - 4;
        
        if (segment < 0) {
            segment = this.participants.length + segment;
        }
        
        const winner = this.participants[segment];
        document.getElementById('result').textContent = `🎉 당첨자: ${winner} 🎉`;
        
        // 폭죽 효과 실행
        this.launchFireworks();
    }

    launchFireworks() {
        this.clearFireworks();
        
        this.fireworksContainer = document.createElement('div');
        this.fireworksContainer.className = 'fireworks-container';
        document.body.appendChild(this.fireworksContainer);
        
        const duration = 10 * 1000; // 지속 시간 증가
        const animationEnd = Date.now() + duration;
        
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const fireworkTypes = [
            {
                particleCount: 100,
                startVelocity: 55,
                spread: 360,
                shapes: ['circle', 'star'],
                colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
                gravity: 0.5
            },
            {
                particleCount: 200,
                angle: 60,
                spread: 55,
                startVelocity: 45,
                shapes: ['circle'],
                colors: ['#FF7F50', '#6495ED', '#DC143C', '#008B8B'],
                gravity: 1
            },
            {
                particleCount: 200,
                angle: 120,
                spread: 55,
                startVelocity: 45,
                shapes: ['star'],
                colors: ['#FFD700', '#FF69B4', '#00FA9A', '#8A2BE2'],
                gravity: 1
            }
        ];

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            // 랜덤한 폭죽 타입 선택
            const type = fireworkTypes[Math.floor(Math.random() * fireworkTypes.length)];

            // 여러 위치에서 동시에 폭죽 발사
            confetti({
                ...type,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });

            confetti({
                ...type,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });

            confetti({
                ...type,
                origin: { x: 0.5, y: 0.3 }
            });

            // 추가적인 폭죽 효과
            if (Math.random() > 0.5) {
                confetti({
                    particleCount: 300,
                    angle: 90,
                    spread: 100,
                    startVelocity: 65,
                    origin: { x: 0.5, y: 0.5 }
                });
            }

        }, 150); // 발사 간격 줄이기
    }

    displayParticipantList() {
        const prizeList = document.getElementById('prizeList');
        prizeList.innerHTML = ''; // 리스트 초기화
        this.participants.forEach((participant, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${participant}`;
            prizeList.appendChild(li);
        });
    }

    setupEventListeners() {
        document.getElementById('spinButton').addEventListener('click', () => this.spin());
    }

    initMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            if (this.isSpinning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            // 30% 범위 내에서만 값 계산
            this.mouseX = this.clampValue((x - 0.5) * 2, -0.3, 0.3);
            this.mouseY = this.clampValue((y - 0.5) * 2, -0.3, 0.3);
            
            this.updatePerspective();
        });
    }

    clampValue(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    updatePerspective() {
        const maxRotation = 30;
        const rotationX = -this.mouseY * maxRotation;
        const rotationY = this.mouseX * maxRotation;
        
        this.canvas.style.transform = `
            rotateX(${rotationX}deg)
            rotateY(${rotationY}deg)
            scale(1.1)
        `;
    }

    clearFireworks() {
        if (this.fireworksContainer) {
            document.body.removeChild(this.fireworksContainer);
            this.fireworksContainer = null;
        }
    }
}
window.addEventListener('load', () => {
    new RouletteWheel();
});
