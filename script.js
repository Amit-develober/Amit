class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.vsAI = false;
        this.aiDifficulty = 'medium'; // Add default difficulty
        this.scores = { X: 0, O: 0 };
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('player-turn');
        this.restartButton = document.getElementById('restart');
        this.modal = document.getElementById('win-modal');
        this.playAgainButton = document.getElementById('play-again');
        this.vsPlayerButton = document.getElementById('vs-player');
        this.vsAIButton = document.getElementById('vs-ai');
        this.darkModeToggle = document.getElementById('dark-mode');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.difficultySelector = document.querySelector('.difficulty-selector');

        this.setupEventListeners();
        this.updateScoreDisplay();
    }

    setupEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.restartButton.addEventListener('click', () => this.restartGame());
        this.playAgainButton.addEventListener('click', () => this.hideModal());
        
        this.vsPlayerButton.addEventListener('click', () => this.setGameMode(false));
        this.vsAIButton.addEventListener('click', () => this.setGameMode(true));
        
        this.darkModeToggle.addEventListener('change', () => this.toggleDarkMode());

        // Add difficulty buttons event listeners
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => this.setDifficulty(button.dataset.difficulty));
        });
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;
        
        if (this.board[index] || !this.gameActive) return;

        this.makeMove(index);
    }

    setDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
        this.difficultyButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.difficulty === difficulty);
        });
        if (this.vsAI && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;

        let move;
        
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.makeEasyMove();
                break;
            case 'medium':
                move = this.makeMediumMove();
                break;
            case 'hard':
                move = this.makeHardMove();
                break;
            default:
                move = this.makeMediumMove();
        }

        if (move !== null) {
            this.makeMove(move);
        }
    }

    makeEasyMove() {
        // Random move strategy
        const emptySpots = this.board.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
        
        if (emptySpots.length === 0) return null;
        return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }

    makeMediumMove() {
        // 70% chance of making a smart move, 30% chance of making a random move
        if (Math.random() < 0.7) {
            const smartMove = this.makeHardMove();
            if (smartMove !== null) return smartMove;
        }
        return this.makeEasyMove();
    }

    makeHardMove() {
        // First check if AI can win
        const winningMove = this.findBestMove('O');
        if (winningMove !== null) return winningMove;

        // Then check if player can win and block
        const blockingMove = this.findBestMove('X');
        if (blockingMove !== null) return blockingMove;

        // If center is empty, take it
        if (this.board[4] === '') return 4;

        // Take any corner
        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(corner => this.board[corner] === '');
        if (emptyCorners.length > 0) {
            return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        }

        // Take any empty side
        const sides = [1, 3, 5, 7];
        const emptySides = sides.filter(side => this.board[side] === '');
        if (emptySides.length > 0) {
            return emptySides[Math.floor(Math.random() * emptySides.length)];
        }

        return null;
    }

    findBestMove(player) {
        // Check each winning combination
        for (const combo of this.winningCombos) {
            const [a, b, c] = combo;
            const line = [this.board[a], this.board[b], this.board[c]];
            
            // Count player's marks and empty spaces
            const playerCount = line.filter(cell => cell === player).length;
            const emptyCount = line.filter(cell => cell === '').length;

            // If there are two player marks and one empty space
            if (playerCount === 2 && emptyCount === 1) {
                // Find and return the empty position
                const emptyIndex = combo[line.indexOf('')];
                return emptyIndex;
            }
        }
        return null;
    }

    checkWinningCondition(board, player) {
        return this.winningCombos.some(combo => {
            return combo.every(index => board[index] === player);
        });
    }

    makeMove(index) {
        if (this.board[index] || !this.gameActive) return;

        this.board[index] = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());

        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
            
            if (this.vsAI && this.currentPlayer === 'O' && this.gameActive) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    checkWin() {
        return this.winningCombos.some(combo => {
            if (
                this.board[combo[0]] &&
                this.board[combo[0]] === this.board[combo[1]] &&
                this.board[combo[0]] === this.board[combo[2]]
            ) {
                combo.forEach(index => {
                    this.cells[index].classList.add('winner');
                });
                return true;
            }
            return false;
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScoreDisplay();
        this.showModal(`Player ${this.currentPlayer} wins!`);
    }

    handleDraw() {
        this.gameActive = false;
        this.showModal("It's a draw!");
    }

    restartGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateStatus();
        this.hideModal();
    }

    updateStatus() {
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s Turn`;
    }

    updateScoreDisplay() {
        document.getElementById('score-x').textContent = this.scores.X;
        document.getElementById('score-o').textContent = this.scores.O;
    }

    showModal(message) {
        document.getElementById('win-message').textContent = message;
        this.modal.style.display = 'flex';
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.restartGame();
    }

    setGameMode(ai) {
        this.vsAI = ai;
        this.vsPlayerButton.classList.toggle('active', !ai);
        this.vsAIButton.classList.toggle('active', ai);
        this.difficultySelector.style.display = ai ? 'block' : 'none';
        this.restartGame();
        
        // If AI mode is enabled and it's O's turn, make AI move
        if (ai && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    toggleDarkMode() {
        document.body.setAttribute('data-theme', 
            this.darkModeToggle.checked ? 'dark' : 'light');
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 