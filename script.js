const squares = document.getElementsByClassName("square");
const board = document.getElementById("chessboard");

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
squares[33].classList.add("highlighted")