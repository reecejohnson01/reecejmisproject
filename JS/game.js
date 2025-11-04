class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.suit = this.suit;
        card.dataset.rank = this.rank;
        this.updateCardFace(card);
        return card;
    }

    updateCardFace(element = this.element) {
        if (this.faceUp) {
            element.classList.remove('face-down');
            element.style.backgroundColor = this.suit === '♥' || this.suit === '♦' ? '#ffcdd2' : 'white';
            element.innerHTML = `
                <div style="position: absolute; top: 5px; left: 5px;">
                    ${this.rank}<br>${this.suit}
                </div>
                <div style="position: absolute; bottom: 5px; right: 5px;">
                    ${this.rank}<br>${this.suit}
                </div>
            `;
        } else {
            element.classList.add('face-down');
            element.style.backgroundColor = '#7a0019';
            element.innerHTML = '';
        }
    }

    flip() {
        this.faceUp = !this.faceUp;
        this.updateCardFace();
    }
}

class Solitaire {
    constructor() {
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createDeck();
        this.setupPiles();
        this.dealCards();
        this.moveCount = 0;
        this.startTime = Date.now();
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    createDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];

        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push(new Card(suit, rank));
            }
        }

        this.shuffle(this.deck);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    setupPiles() {
        this.stock = [];
        this.waste = [];
        this.foundation = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
    }

    dealCards() {
        // Deal to tableau
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.deck.pop();
                if (i === j) card.faceUp = true;
                this.tableau[j].push(card);
                this.updateCardPosition(card, 'tableau', j);
            }
        }

        // Remaining cards go to stock
        this.stock = this.deck;
        this.stock.forEach(card => {
            card.faceUp = false;
            this.updateCardPosition(card, 'stock');
        });
    }

    updateCardPosition(card, pileType, index = 0) {
        const pile = document.getElementById(`${pileType}-${index}`);
        pile.appendChild(card.element);
        
        if (pileType === 'tableau') {
            const offset = this.getPileCards(pileType, index).indexOf(card) * 20;
            card.element.style.top = `${offset}px`;
        }
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('stock').addEventListener('click', () => this.drawCard());

        // Set up drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        document.addEventListener('mousedown', (e) => {
            const card = e.target.closest('.card');
            if (!card || !card.classList.contains('face-up')) return;

            const pile = card.closest('.pile');
            if (!pile) return;

            this.startDrag(card, e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.draggedCard) {
                this.updateDragPosition(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.draggedCard) {
                this.endDrag();
            }
        });
    }

    startDrag(card, e) {
        this.draggedCard = card;
        this.dragOffset = {
            x: e.clientX - card.offsetLeft,
            y: e.clientY - card.offsetTop
        };
        card.classList.add('dragging');
    }

    updateDragPosition(e) {
        const card = this.draggedCard;
        card.style.position = 'fixed';
        card.style.left = `${e.clientX - this.dragOffset.x}px`;
        card.style.top = `${e.clientY - this.dragOffset.y}px`;
    }

    endDrag() {
        const card = this.draggedCard;
        card.classList.remove('dragging');
        
        // Find the closest pile
        const piles = document.querySelectorAll('.pile');
        let closestPile = null;
        let minDistance = Infinity;

        piles.forEach(pile => {
            const rect = pile.getBoundingClientRect();
            const distance = Math.hypot(
                rect.left + rect.width/2 - card.offsetLeft,
                rect.top + rect.height/2 - card.offsetTop
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestPile = pile;
            }
        });

        if (closestPile && this.isValidMove(card, closestPile)) {
            this.moveCard(card, closestPile);
        } else {
            // Return card to original position
            this.updateCardPosition(card, card.dataset.pile, card.dataset.pileIndex);
        }

        this.draggedCard = null;
    }

    isValidMove(card, targetPile) {
        const sourceCard = this.getCardObject(card);
        const targetCard = this.getTopCard(targetPile.id);
        const [pileType, index] = targetPile.id.split('-');

        if (pileType === 'foundation') {
            if (!targetCard && sourceCard.rank === 'A') return true;
            if (targetCard) {
                return sourceCard.suit === targetCard.suit &&
                       this.getRankValue(sourceCard.rank) === this.getRankValue(targetCard.rank) + 1;
            }
            return false;
        }

        if (pileType === 'tableau') {
            if (!targetCard) return sourceCard.rank === 'K';
            return this.isAlternatingColor(sourceCard, targetCard) &&
                   this.getRankValue(sourceCard.rank) === this.getRankValue(targetCard.rank) - 1;
        }

        return false;
    }

    getCardObject(element) {
        return {
            suit: element.dataset.suit,
            rank: element.dataset.rank
        };
    }

    getTopCard(pileId) {
        const pile = document.getElementById(pileId);
        const cards = pile.querySelectorAll('.card');
        return cards.length ? this.getCardObject(cards[cards.length - 1]) : null;
    }

    getRankValue(rank) {
        const values = { 'A': 1, 'J': 11, 'Q': 12, 'K': 13 };
        return values[rank] || parseInt(rank);
    }

    isAlternatingColor(card1, card2) {
        const isRed = suit => suit === '♥' || suit === '♦';
        return isRed(card1.suit) !== isRed(card2.suit);
    }

    moveCard(card, targetPile) {
        const sourceCards = Array.from(card.parentElement.querySelectorAll('.card'));
        const startIndex = sourceCards.indexOf(card);
        const cardsToMove = sourceCards.slice(startIndex);

        cardsToMove.forEach((card, i) => {
            targetPile.appendChild(card);
            if (targetPile.classList.contains('tableau-pile')) {
                const offset = (targetPile.querySelectorAll('.card').length - cardsToMove.length + i) * 20;
                card.style.top = `${offset}px`;
            }
        });

        this.moveCount++;
        document.getElementById('move-count').textContent = this.moveCount;
        this.checkWinCondition();
    }

    drawCard() {
        if (this.stock.length === 0) {
            // Reset stock from waste
            this.stock = this.waste.reverse();
            this.waste = [];
            this.stock.forEach(card => {
                card.faceUp = false;
                this.updateCardPosition(card, 'stock');
            });
        } else {
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            this.updateCardPosition(card, 'waste');
        }
    }

    getPileCards(pileType, index) {
        switch (pileType) {
            case 'stock': return this.stock;
            case 'waste': return this.waste;
            case 'foundation': return this.foundation[index];
            case 'tableau': return this.tableau[index];
            default: return [];
        }
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('game-timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    checkWinCondition() {
        const isWon = this.foundation.every(pile => pile.length === 13);
        if (isWon) {
            clearInterval(this.timerInterval);
            this.showWinMessage();
        }
    }

    showWinMessage() {
        document.getElementById('final-moves').textContent = this.moveCount;
        document.getElementById('final-time').textContent = 
            document.getElementById('game-timer').textContent;
        document.getElementById('win-message').classList.add('visible');
    }

    newGame() {
        clearInterval(this.timerInterval);
        document.querySelectorAll('.pile').forEach(pile => pile.innerHTML = '');
        document.getElementById('win-message').classList.remove('visible');
        this.initializeGame();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Solitaire();
});
