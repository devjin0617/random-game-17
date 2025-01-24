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
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.canvas.width = 500; // 크기 증가
        this.canvas.height = 500;
        this.drawWheel();
        this.displayParticipantList();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const segments = this.participants.length;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.currentRotation * Math.PI / 180); // 각도를 라디안으로 변환

        // 각 세그먼트의 시작 위치를 조정 (첫 번째 세그먼트가 화살표 위치에 정확히 오도록)
        const startAngle = -90 * Math.PI / 180; // 시작 각도를 -90도로 설정

        for (let i = 0; i < segments; i++) {
            const angle = (2 * Math.PI) / segments;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle + (i * angle), startAngle + ((i + 1) * angle));
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
            
            // 텍스트 그리기
            this.ctx.save();
            this.ctx.rotate(startAngle + (i * angle) + (angle / 2));
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(this.participants[i], radius - 30, 5);
            this.ctx.restore();
        }

        // 중앙 원 그리기
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = '#2c3e50';
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
        const spinDuration = 5000;
        const startRotation = this.currentRotation;
        const totalRotation = 360 * 8 + Math.random() * 360; // 8바퀴 + 랜덤
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            const easeOut = (t) => 1 - Math.pow(1 - t, 4); // 부드러운 감속
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
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { 
            startVelocity: 30, 
            spread: 360, 
            ticks: 60, 
            zIndex: 0,
            shapes: ['star', 'circle'],
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        };

        // 폭죽 효과를 위한 캔버스 생성
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        document.body.appendChild(container);

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                document.body.removeChild(container);
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // 랜덤 위치에서 폭죽 발사
            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            // 여러 방향에서 폭죽 발사
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });

            // 중앙에서도 폭죽 발사
            confetti({
                ...defaults,
                particleCount: particleCount * 0.5,
                origin: { x: 0.5, y: 0.3 }
            });
        }, 250);
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
}
window.addEventListener('load', () => {
    new RouletteWheel();
});
