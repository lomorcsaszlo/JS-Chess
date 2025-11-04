const squares = document.getElementsByClassName("square");
const board = document.getElementById("chessboard");
let isWhiteMoves = true;

function GenerateBoard() {
    for (let i = 0; i < 64; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('square');
        board.appendChild(pixel);
    }
    for (let i = 0; i < 64; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;

        if ((row + col) % 2 === 0) {
            squares[i].classList.add("dark-square")

        } else {
            squares[i].classList.add("light-square")

        }
    }
}
function generateBoardFEN(FEN) {
    const rows = FEN.split("/");
    let index = 0;

    for (let row of rows) {
        for (let char of row) {
            if (isNaN(char)) {
                // It's a piece
                const pieceClass = getPieceClass(char);
                squares[index].classList.add("piece", pieceClass);
                index++;
            } else {
                index += parseInt(char);
            }
        }
    }
}

function getPieceClass(char) {
    const isWhite = char === char.toUpperCase();
    const piece = char.toLowerCase();
    const color = isWhite ? "w" : "b";
    switch (piece) {
        case "p": return `pawn-${color}`;
        case "r": return `rook-${color}`;
        case "n": return `knight-${color}`;
        case "b": return `bishop-${color}`;
        case "q": return `queen-${color}`;
        case "k": return `king-${color}`;
    }
}


GenerateBoard()
generateBoardFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")


let selectedSquare = null;

let legals = [];

for (let i = 0; i < squares.length; i++) {
    squares[i].addEventListener("click", function () {
        const square = squares[i];

        // --- SELECT PIECE ---
        if (!selectedSquare && square.classList.contains("piece")) {
            selectedSquare = square;
            square.classList.add("highlighted");

            const pieceClass = Array.from(square.classList).find(c =>
                /pawn-|rook-|knight-|bishop-|queen-|king-/.test(c)
            );

            if (pieceClass) {
                console.log(pieceClass, i);
            } else {
                console.log("Selected a square with no piece.");
            }

            legals = getLegels(pieceClass, i); // store it globally
            return;
        }

        // --- MOVE PIECE ---
        const targetIndex = Array.from(squares).indexOf(square);
        if (selectedSquare && selectedSquare !== square && legals.includes(targetIndex)) {
            const pieceClasses = Array.from(selectedSquare.classList).filter(
                c =>
                    !["square", "highlighted", "light-square", "dark-square"].includes(c)
            );

            selectedSquare.classList.remove("highlighted");

            const oldPieceClasses = Array.from(square.classList).filter(
                c =>
                    !["square", "light-square", "dark-square", "highlighted"].includes(c)
            );
            square.classList.remove(...oldPieceClasses);
            square.classList.add(...pieceClasses);
            selectedSquare.classList.remove(...pieceClasses);
            selectedSquare = null;
            legals = [];
            return;
        }

        // --- DESELECT PIECE ---
        if (selectedSquare === square) {
            selectedSquare.classList.remove("highlighted");
            selectedSquare = null;
            legals = [];
        }
    });
}

function getLegels(name, index) {
    const legalIndexes = [];
    if (name === "pawn-w") {
        const forward = index - 8; // move up one square
        if (forward >= 0) {
            legalIndexes.push(forward);
        }
    }
    return legalIndexes;
}


