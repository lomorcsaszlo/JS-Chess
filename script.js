import { getBestMove } from './lichess.js'

const squares = document.getElementsByClassName("square");
const board = document.getElementById("chessboard");
let isWhiteMoves = false;
let halfmoveClock = 0;
let fullmoveNumber = 1;





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
generateBoardFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")


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
            console.log(indexToNote(targetIndex))
            const pieceClasses = Array.from(selectedSquare.classList).filter(
                c =>
                    !["square", "highlighted", "light-square", "dark-square"].includes(c)
            );

            selectedSquare.classList.remove("highlighted");
            
            if(!pieceClasses.some(c => c.startsWith("pawn"))){
                halfmoveClock += 1;
            }else if(pieceClasses.some(c => c.startsWith("pawn"))){
                halfmoveClock = 0;
            }
            const oldPieceClasses = Array.from(square.classList).filter(
                c =>
                    !["square", "light-square", "dark-square", "highlighted"].includes(c)
            );
            square.classList.remove(...oldPieceClasses);
            square.classList.add(...pieceClasses);
            selectedSquare.classList.remove(...pieceClasses);
            
            const fen = getFen();


            getBestMove(fen).then(moveNote => {
                console.log("Best move:", moveNote);
                MovePiece(moveNote);
                fullmoveNumber += 1;
            }).catch(err => console.error("Error getting move:", err));
            
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
        const oneForward = index - 8;
        const twoForward = index - 16;
        const captures = [index - 7, index - 9];

        // move forward one
        if (!isOccupiedWhite(oneForward) && !isOccupiedBlack(oneForward))
            legalIndexes.push(oneForward);

        // move forward two (only from rank 2 → row 6, index 48–55)
        if (index >= 48 && index <= 55 && !isOccupiedWhite(twoForward) && !isOccupiedBlack(twoForward))
            legalIndexes.push(twoForward);

        // capture moves
        for (const cap of captures)
            if (isOccupiedBlack(cap)) legalIndexes.push(cap);
    }
    if (name === "knight-w") {
        const knightMoves = [
            -17, -15, -10, -6, 6, 10, 15, 17
        ];

        const row = Math.floor(index / 8);
        const col = index % 8;

        for (const moveOffset of knightMoves) {
            const move = index + moveOffset;
            if (move < 0 || move >= 64) continue;

            const moveRow = Math.floor(move / 8);
            const moveCol = move % 8;

            // valid knight moves must change both row and column by 1 or 2
            const rowDiff = Math.abs(moveRow - row);
            const colDiff = Math.abs(moveCol - col);
            const isValidKnightMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

            if (!isValidKnightMove) continue; // skip wrapping moves
            if (!isOccupiedWhite(move)) {
                legalIndexes.push(move);
            }
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


//PINELVE VAN-E?
//(mezö pinelve van-e9)
// Declare outside, like your isWhiteMoves


function getFen() {
    let fen = "";
    let emptyCount = 0;

    for (let i = 0; i < 64; i++) {
        const square = squares[i];
        const pieceClass = Array.from(square.classList).find(c =>
            /pawn-|rook-|knight-|bishop-|queen-|king-/.test(c)
        );

        if (pieceClass) {
            if (emptyCount > 0) {
                fen += emptyCount;
                emptyCount = 0;
            }

            const [piece, color] = pieceClass.split("-");
            const letterMap = {
                pawn: "p",
                rook: "r",
                knight: "n",
                bishop: "b",
                queen: "q",
                king: "k"
            };
            const letter = letterMap[piece];

            fen += color === "w" ? letter.toUpperCase() : letter.toLowerCase();
        } else {
            emptyCount++;
        }

        if ((i + 1) % 8 === 0) {
            if (emptyCount > 0) {
                fen += emptyCount;
                emptyCount = 0;
            }
            if (i !== 63) fen += "/";
        }
    }

    // Use the external variables here
    fen += isWhiteMoves ? ` w KQkq - ${halfmoveClock} ${fullmoveNumber}`
        : ` b KQkq - ${halfmoveClock} ${fullmoveNumber}`;

    console.log(fen);
    return fen;
}



//LICHESS BOT




function MovePiece(chess_note) {
    const previous = chess_note.slice(0, 2);
    const move = chess_note.slice(2, 4);
    let MovedPiece = null;
    let removePiece = null;


    for (let i = 0; i < squares.length; i++) {
        if (move == indexToNote(i).toLowerCase() ) {
            MovedPiece = squares[i];
        }

        if (previous == indexToNote(i).toLowerCase()) {
            removePiece = squares[i]
        }
    }
    if(removePiece.classList.contains("pawn-w") || removePiece.classList.contains("pawn-b")){
        halfmoveClock = 0;
    }else{
        halfmoveClock += 1;
    }
    if (MovedPiece.classList.contains("piece")) {
        MovedPiece.classList.remove("piece")
        MovedPiece.classList.remove(MovedPiece.classList[2])

    }
    console.log(removePiece.classList[3])

    MovedPiece.classList.add("piece")
    MovedPiece.classList.add(removePiece.classList[3])

    removePiece.classList.remove("piece")
    removePiece.classList.remove(removePiece.classList[2])


}
/* const moveNote = await getBestMove(getFen());
MovePiece(moveNote) */
function isCheck(index) {
    return 0;
}
