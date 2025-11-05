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
//Kezdőpozicio FEN
generateBoardFEN("rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR") //(QUEEN GAMBIT))


let selectedSquare = null;

let legals = [];
0
for (let i = 0; i < squares.length; i++) {
    squares[i].addEventListener("click", function () {
        const square = squares[i];

        // --- BABU KIJELOLÉS ---
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
            console.log(legals[0])
            for (let i = 0; i < squares.length; i++) {
                if (legals.includes(i)) {
                    squares[i].classList.add("legalMove")
                }

            }


            return;
        }


        // --- BABU LÉPÉS ---
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
            document.querySelectorAll(".legalMove").forEach(sq => sq.classList.remove("legalMove"));
            selectedSquare = null;

            legals = [];
            return;
        }

        // --- BABU ELENGEDÉSE ---
        if (selectedSquare === square) {
            selectedSquare.classList.remove("highlighted");
            document.querySelectorAll(".legalMove").forEach(sq => sq.classList.remove("legalMove"));
            selectedSquare = null;
            legals = [];
        }
    });
}

function getLegels(name, index) {
    const legalIndexes = [];
    //FEHÉR GYALOG
    if (name === "pawn-w") {
        if (!isOccupiedBlack(index - 8) && !isOccupiedWhite(index-8)) {
            legalIndexes.push(index - 8);
        }
        if(isOccupiedBlack(index - 7)){
             legalIndexes.push(index - 7);
             
        }
        if(isOccupiedBlack(index - 9)){
             legalIndexes.push(index - 9);
        }
        if (index >= 48 && index <= 55 && !isOccupiedWhite(index-8))  {
            legalIndexes.push(index - 16)
        }
    }

    //FEKETE GYALOG
    /* if (name === "pawn-b") {
        if (!isOccupiedWhite(index + 8)) {
            legalIndexes.push(index + 8);
        }
        if(isOccupiedWhite(index + 7)){
             legalIndexes.push(index + 7);
             
        }
        if(isOccupiedWhite(index + 9)){
             legalIndexes.push(index + 9);
        }
        if (index >= 8 && index <= 15) {
            legalIndexes.push(index + 16)
        }
    } */
    return legalIndexes;
}


//ELLENŐRZI VAN-E FEHÉR BÁBU A MEGADOTT MEZŐN
function isOccupiedWhite(index) {
    const classes = Array.from(squares[index].classList);
    const hasWhitePiece = classes.some(c => c.endsWith("-w"));
    return hasWhitePiece
}


//ELLENŐRZI VAN-E FEKETE BÁBU A MEGADOTT MEZŐN
function isOccupiedBlack(index) {
    const classes = Array.from(squares[index].classList);
    const hasBlackPiece = classes.some(c => c.endsWith("-b"));
    return hasBlackPiece
}


//ÁTVÁLTJA AZ INDEXET SAKK MEZŐRE
function indexToNote(index) {
    const notes = [
        "A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8",
        "A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7",
        "A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6",
        "A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5",
        "A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4",
        "A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3",
        "A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2",
        "A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1"
    ];
    return notes[index]
}   