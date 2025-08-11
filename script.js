// script.js - Simplified Red Light Green Light Game
class RedLightGreenLightGame {
    constructor() {
        this.gameState = 'instructions';
        this.currentLight = 'red';
        this.isMoving = false;
        this.gameTime = 0;
        this.playerPosition = 8;
        this.finishLine = 85;
        this.finishers = [];
        this.survivors = 6;
        
        // Bots data
        this.bots = Array.from({length: 5}, (_, i) => ({
            id: `bot${i+1}`,
            position: 8,
            eliminated: false,
            finished: false,
            speed: 0.5 + Math.random() * 1.2,
            risk: Math.random() * 0.3,
            name: `Bot ${i+1}`,
            isMoving: false
        }));
        
        this.initElements();
        this.bindEvents();
        this.showInstructions();
    }
    
    initElements() {
        // Get all DOM elements
        this.redLight = document.getElementById('red-light');
        this.yellowLight = document.getElementById('yellow-light');
        this.greenLight = document.getElementById('green-light');
        this.player = document.getElementById('player');
        this.doll = document.getElementById('doll');
        this.gameStatus = document.getElementById('game-status');
        this.timerDisplay = document.getElementById('timer-display');
        this.survivorsCount = document.getElementById('survivors-count');
        this.playerRank = document.getElementById('player-rank');
        this.deathEffects = document.getElementById('death-effects');
        
        // Progress bars
        this.playerProgress = document.getElementById('player-progress');
        this.playerPercent = document.getElementById('player-percent');
        this.botProgresses = Array.from({length: 5}, (_, i) => 
            document.getElementById(`bot${i+1}-progress`)
        );
        this.botPercents = Array.from({length: 5}, (_, i) => 
            document.getElementById(`bot${i+1}-percent`)
        );
        
        // Controls and screens
        this.moveBtn = document.getElementById('move-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.instructions = document.getElementById('instructions');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameResult = document.getElementById('game-result');
        this.resultMessage = document.getElementById('result-message');
        this.finalTime = document.getElementById('final-time');
        this.finalPosition = document.getElementById('final-position');
        this.finalDistance = document.getElementById('final-distance');
        this.topFinishers = document.getElementById('top-finishers');
        
        // Bot elements
        this.botElements = this.bots.map(bot => document.getElementById(bot.id));
    }
    
    bindEvents() {
        // Mobile touch events
        this.moveBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startMoving();
        });
        this.moveBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopMoving();
        });
        
        // Desktop mouse events
        this.moveBtn.addEventListener('mousedown', () => this.startMoving());
        this.moveBtn.addEventListener('mouseup', () => this.stopMoving());
        this.stopBtn.addEventListener('click', () => this.stopMoving());
        
        // Game controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});
    }
    
    showInstructions() {
        this.instructions.style.display = 'flex';
        this.gameOverScreen.style.display = 'none';
    }
    
    startGame() {
        this.gameState = 'playing';
        this.instructions.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        
        // Reset everything
        this.resetGame();
        
        // Start timers
        this.gameTimer = setInterval(() => {
            this.gameTime++;
            this.updateTimer();
            this.updateProgress();
            this.updateRankings();
        }, 100);
        
        this.botTimer = setInterval(() => this.moveBots(), 100);
        
        // Start light cycle
        this.startLightCycle();
        
        this.moveBtn.disabled = false;
        this.stopBtn.disabled = false;
    }
    
    resetGame() {
        this.gameTime = 0;
        this.playerPosition = 8;
        this.isMoving = false;
        this.finishers = [];
        this.survivors = 6;
        
        // Reset player
        this.player.classList.remove('moving', 'eliminated', 'finished');
        this.player.style.bottom = '8%';
        
        // Reset bots
        this.bots.forEach((bot, i) => {
            bot.position = 8;
            bot.eliminated = false;
            bot.finished = false;
            bot.speed = 0.5 + Math.random() * 1.2;
            bot.risk = Math.random() * 0.3;
            bot.isMoving = false;
            this.botElements[i].classList.remove('moving', 'eliminated', 'finished');
            this.botElements[i].style.bottom = '8%';
        });
        
        // Reset progress bars
        this.playerProgress.classList.remove('eliminated');
        this.botProgresses.forEach(p => p.classList.remove('eliminated'));
        
        // Clear effects
        this.deathEffects.innerHTML = '';
        this.updateStatus();
    }
    
    startLightCycle() {
        if (this.gameState !== 'playing') return;
        
        // Red light
        this.setLight('red');
        this.gameStatus.textContent = '🔴 BERHENTI!';
        
        setTimeout(() => {
            if (this.gameState !== 'playing') return;
            
            // Yellow light
            this.setLight('yellow');
            this.gameStatus.textContent = '🟡 Bersiap...';
            
            setTimeout(() => {
                if (this.gameState !== 'playing') return;
                
                // Green light
                this.setLight('green');
                this.gameStatus.textContent = '🟢 MAJU!';
                
                setTimeout(() => {
                    this.startLightCycle(); // Repeat
                }, 1500 + Math.random() * 2000);
                
            }, 800);
        }, 2000 + Math.random() * 3000);
    }
    
    setLight(color) {
        this.currentLight = color;
        
        // Reset lights
        this.redLight.classList.remove('active');
        this.yellowLight.classList.remove('active');
        this.greenLight.classList.remove('active');
        this.doll.classList.remove('watching');
        
        // Set active light
        document.getElementById(`${color}-light`).classList.add('active');
        
        if (color === 'red') {
            this.doll.classList.add('watching');
            setTimeout(() => this.checkViolations(), 200);
        }
    }
    
    checkViolations() {
        if (this.currentLight === 'red') {
            // Check player
            if (this.isMoving) {
                this.eliminatePlayer();
            }
            
            // Check bots
            this.bots.forEach((bot, i) => {
                if (bot.isMoving && !bot.eliminated) {
                    this.eliminateBot(i);
                }
            });
        }
    }
    
    startMoving() {
        if (this.gameState !== 'playing') return;
        
        this.isMoving = true;
        this.player.classList.add('moving');
        
        if (this.currentLight === 'red') {
            setTimeout(() => {
                if (this.isMoving) this.eliminatePlayer();
            }, 100);
        } else {
            this.movePlayer();
        }
    }
    
    stopMoving() {
        this.isMoving = false;
        this.player.classList.remove('moving');
    }
    
    movePlayer() {
        if (!this.isMoving || this.gameState !== 'playing') return;
        
        if (this.currentLight === 'green') {
            this.playerPosition += 1.2;
        } else if (this.currentLight === 'yellow') {
            this.playerPosition += 0.6;
        }
        
        this.player.style.bottom = `${this.playerPosition}%`;
        
        if (this.playerPosition >= this.finishLine) {
            this.playerFinished();
            return;
        }
        
        setTimeout(() => this.movePlayer(), 50);
    }
    
    moveBots() {
        if (this.gameState !== 'playing') return;
        
        this.bots.forEach((bot, i) => {
            if (bot.eliminated || bot.finished) return;
            
            const element = this.botElements[i];
            
            // Bot AI decision
            if (this.currentLight === 'green') {
                bot.isMoving = Math.random() > 0.1;
            } else if (this.currentLight === 'yellow') {
                bot.isMoving = Math.random() < bot.risk * 0.5;
            } else { // red
                bot.isMoving = false;
                // Chance to make mistake
                if (Math.random() < bot.risk * 0.15) {
                    bot.isMoving = true;
                    setTimeout(() => this.eliminateBot(i), 300);
                }
            }
            
            // Visual feedback
            if (bot.isMoving) {
                element.classList.add('moving');
                bot.position += bot.speed;
                element.style.bottom = `${bot.position}%`;
                
                if (bot.position >= this.finishLine) {
                    this.botFinished(i);
                }
            } else {
                element.classList.remove('moving');
            }
        });
    }
    
    playerFinished() {
        this.isMoving = false;
        this.player.classList.remove('moving');
        this.player.classList.add('finished');
        
        this.finishers.push({name: 'YOU', time: this.gameTime, isPlayer: true});
        
        const pos = this.finishers.length;
        this.gameStatus.textContent = `🎉 KAMU FINISH POSISI ${pos}!`;
        
        setTimeout(() => this.checkGameEnd(), 1000);
    }
    
    botFinished(index) {
        const bot = this.bots[index];
        bot.finished = true;
        bot.isMoving = false;
        
        this.botElements[index].classList.remove('moving');
        this.botElements[index].classList.add('finished');
        
        this.finishers.push({name: bot.name, time: this.gameTime, isPlayer: false});
        
        const pos = this.finishers.length;
        this.gameStatus.textContent = `🏃 ${bot.name} FINISH POSISI ${pos}!`;
        
        setTimeout(() => this.checkGameEnd(), 1000);
    }
    
    eliminatePlayer() {
        this.isMoving = false;
        this.survivors--;
        
        this.player.classList.remove('moving');
        this.player.classList.add('eliminated');
        
        this.createExplosion(this.player);
        this.gameStatus.textContent = '💀 KAMU MATI!';
        
        setTimeout(() => this.endGame(), 2000);
    }
    
    eliminateBot(index) {
        const bot = this.bots[index];
        if (bot.eliminated) return;
        
        bot.eliminated = true;
        bot.isMoving = false;
        this.survivors--;
        
        this.botElements[index].classList.add('eliminated');
        this.botElements[index].classList.remove('moving');
        
        this.createExplosion(this.botElements[index]);
        this.gameStatus.textContent = `💀 ${bot.name} MATI!`;
        
        // Check if player wins by survival
        const aliveBots = this.bots.filter(b => !b.eliminated && !b.finished).length;
        if (aliveBots === 0 && this.finishers.length === 0) {
            setTimeout(() => {
                this.finishers.push({name: 'YOU', time: this.gameTime, isPlayer: true});
                this.endGame();
            }, 2000);
        }
    }
    
    createExplosion(element) {
        const rect = element.getBoundingClientRect();
        const gameRect = this.deathEffects.getBoundingClientRect();
        
        const explosion = document.createElement('div');
        explosion.className = 'death-explosion';
        explosion.style.left = `${rect.left - gameRect.left + rect.width/2 - 30}px`;
        explosion.style.top = `${rect.top - gameRect.top + rect.height/2 - 30}px`;
        
        this.deathEffects.appendChild(explosion);
        setTimeout(() => explosion.remove(), 600);
    }
    
    checkGameEnd() {
        if (this.finishers.length >= 3) {
            setTimeout(() => this.endGame(), 2000);
        }
    }
    
    endGame() {
        this.gameState = 'gameOver';
        
        // Stop timers
        clearInterval(this.gameTimer);
        clearInterval(this.botTimer);
        
        // Determine result
        const playerFinishPos = this.finishers.findIndex(f => f.isPlayer) + 1;
        
        if (playerFinishPos > 0 && playerFinishPos <= 3) {
            this.showResult(true, `🏆 Selamat! Kamu finish posisi ${playerFinishPos}!`, playerFinishPos);
        } else {
            const reason = this.player.classList.contains('eliminated') ? 
                'Kamu bergerak saat lampu merah!' : 
                'Kamu tidak masuk 3 besar!';
            this.showResult(false, reason, playerFinishPos || 6);
        }
    }
    
    showResult(won, message, position) {
        this.gameResult.textContent = won ? '🏆 MENANG!' : '💀 KALAH!';
        this.gameResult.style.color = won ? '#00ff00' : '#ff4444';
        this.resultMessage.textContent = message;
        
        const mins = Math.floor(this.gameTime / 600);
        const secs = Math.floor((this.gameTime % 600) / 10);
        this.finalTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        this.finalPosition.textContent = `#${position}`;
        
        const distance = Math.min((this.playerPosition / this.finishLine) * 100, 100);
        this.finalDistance.textContent = `${Math.round(distance)}%`;
        
        // Update leaderboard
        const items = this.topFinishers.querySelectorAll('.finisher-item');
        for (let i = 0; i < 3; i++) {
            const finisher = this.finishers[i];
            if (finisher) {
                const mins = Math.floor(finisher.time / 600);
                const secs = Math.floor((finisher.time % 600) / 10);
                items[i].querySelector('.name').textContent = finisher.name;
                items[i].querySelector('.time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                items[i].querySelector('.name').style.color = finisher.isPlayer ? '#00ff00' : '#ffffff';
            }
        }
        
        this.gameOverScreen.style.display = 'flex';
        this.moveBtn.disabled = true;
        this.stopBtn.disabled = true;
    }
    
    updateProgress() {
        // Player progress
        const playerProg = Math.min((this.playerPosition / this.finishLine) * 100, 100);
        this.playerProgress.style.width = `${playerProg}%`;
        this.playerPercent.textContent = `${Math.round(playerProg)}%`;
        
        // Bot progress
        this.bots.forEach((bot, i) => {
            const prog = Math.min((bot.position / this.finishLine) * 100, 100);
            this.botProgresses[i].style.width = `${prog}%`;
            this.botPercents[i].textContent = `${Math.round(prog)}%`;
        });
    }
    
    updateRankings() {
        // Simple ranking by position
        const allPlayers = [
            {name: 'YOU', pos: this.playerPosition, eliminated: this.player.classList.contains('eliminated')},
            ...this.bots.map(bot => ({name: bot.name, pos: bot.position, eliminated: bot.eliminated}))
        ];
        
        const alive = allPlayers.filter(p => !p.eliminated).sort((a, b) => b.pos - a.pos);
        const playerRank = alive.findIndex(p => p.name === 'YOU') + 1 + this.finishers.length;
        
        this.playerRank.textContent = `#${Math.min(playerRank, 6)}`;
    }
    
    updateStatus() {
        this.survivorsCount.textContent = this.survivors;
        const mins = Math.floor(this.gameTime / 600);
        const secs = Math.floor((this.gameTime % 600) / 10);
        this.timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateTimer() {
        this.updateStatus();
    }
    
    restartGame() {
        this.gameState = 'instructions';
        this.currentLight = 'red';
        
        // Clear timers
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.botTimer) clearInterval(this.botTimer);
        
        // Reset lights
        this.redLight.classList.remove('active');
        this.yellowLight.classList.remove('active');
        this.greenLight.classList.remove('active');
        this.doll.classList.remove('watching');
        
        this.showInstructions();
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    new RedLightGreenLightGame();
});

// Prevent zoom and scroll on mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, false);