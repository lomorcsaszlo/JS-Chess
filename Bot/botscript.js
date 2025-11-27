import { getBestMove } from './bot.js'

const squares = document.getElementsByClassName("square");
const board = document.getElementById("chessboard");
let isWhiteMoves = false;
let halfmoveClock = 0;
let fullmoveNumber = 1;
let canMove = true;
//teszt
let kingHasMoved = false;
let kingsideRookHasMoved = false;
let queensideRookHasMoved = false;


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
                console.log("Selected a square w426ith no piece.");
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
        if (selectedSquare && selectedSquare !== square && legals.includes(targetIndex) && canMove) {
            canMove = false;

            console.log(indexToNote(targetIndex))
            const pieceClasses = Array.from(selectedSquare.classList).filter(
                c =>
                    !["square", "highlighted", "light-square", "dark-square"].includes(c)
            );

            selectedSquare.classList.remove("highlighted");

            if (!pieceClasses.some(c => c.startsWith("pawn"))) {
                halfmoveClock += 1;
            } else if (pieceClasses.some(c => c.startsWith("pawn"))) {
                halfmoveClock = 0;
            }
            //SACRIFICE THE ROOOOOOK
            const selectedIndex = Array.from(squares).indexOf(selectedSquare);
            console.log(selectedIndex, "LÉPÉS INDEXE VAGY HOGY")
            if (pieceClasses.some(c => c.startsWith("rook")) && selectedIndex == 63) {
                kingsideRookHasMoved = true;
                console.log("kingside rook moved")
            }
            if (pieceClasses.some(c => c.startsWith("rook")) && selectedIndex == 56) {
                queensideRookHasMoved = true;
                console.log("queenside rook moved")
            }
            if (pieceClasses.some(c => c.startsWith("king"))) {
                kingHasMoved = true;
                console.log("king  moved")
            }
            console.log(kingHasMoved)
            if (pieceClasses.some(c => c.startsWith("king")) && targetIndex == 62) {

                for (let i = 0; i < squares.length; i++) {
                    const classes = Array.from(squares[i].classList);
                    if (classes.some(c => c.includes("rook-w")) && i == 63) {
                        MovePiece("h1f1")
                    }
                }
            }
            if (pieceClasses.some(c => c.startsWith("king")) && targetIndex == 58) {
                for (let i = 0; i < squares.length; i++) {
                    const classes = Array.from(squares[i].classList);
                    if (classes.some(c => c.includes("rook-w")) && i == 56) {
                        MovePiece("a1d1")

                    }
                }
            }




            const oldPieceClasses = Array.from(square.classList).filter(
                c =>
                    !["square", "light-square", "dark-square", "highlighted"].includes(c)
            );
            square.classList.remove(...oldPieceClasses);
            square.classList.add(...pieceClasses);
            selectedSquare.classList.remove(...pieceClasses);

            const fen = getFen();


            setTimeout(() => {
                getBestMove(fen).then(moveNote => {
                    console.log("Best move:", moveNote);
                    MovePiece(moveNote);
                    fullmoveNumber += 1;
                    canMove = true;
                }).catch(err => alert("A szerver nem működik :("));

                Quotes();
            }, 600); // delay in ms


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

    // Helper functions
    const sameRow = (a, b) => Math.floor(a / 8) === Math.floor(b / 8);

    // ♙ WHITE PAWN
    if (name === "pawn-w") {
        const oneForward = index - 8;
        const twoForward = index - 16;
        const captures = [index - 7, index - 9];

        // Move forward one
        if (!isKingCheck() && oneForward >= 0 && !isOccupiedWhite(oneForward) && !isOccupiedBlack(oneForward))
            legalIndexes.push(oneForward);

        // Move forward two (rank 2)
        if (!isKingCheck() && index >= 48 && index <= 55 && !isOccupiedWhite(twoForward) && !isOccupiedBlack(twoForward))
            legalIndexes.push(twoForward);

        // Captures
        for (const cap of captures) {
            if (!isKingCheck() && cap >= 0 && cap < 64 && isOccupiedBlack(cap) && !sameRow(index, cap)) {
                legalIndexes.push(cap);
            }
        }
    }

    // ♘ WHITE KNIGHT
    if (name === "knight-w") {
        const knightMoves = [-17, -15, -10, -6, 6, 10, 15, 17];
        const row = Math.floor(index / 8);
        const col = index % 8;

        for (const moveOffset of knightMoves) {
            const move = index + moveOffset;
            if (!isKingCheck() && (move < 0 || move >= 64)) continue;

            const moveRow = Math.floor(move / 8);
            const moveCol = move % 8;
            const rowDiff = Math.abs(moveRow - row);
            const colDiff = Math.abs(moveCol - col);

            if (!isKingCheck() && !((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) continue;
            if (!isKingCheck() && !isOccupiedWhite(move)) legalIndexes.push(move);
        }
    }

    // ♗ WHITE BISHOP
    if (name === "bishop-w" || name === "queen-w") {
        const directions = [-9, -7, 7, 9];
        for (const dir of directions) {
            let pos = index + dir;
            while (
                !isKingCheck() &&
                pos >= 0 &&
                pos < 64 &&
                Math.abs((pos % 8) - ((pos - dir) % 8)) === 1
            ) {
                if (isOccupiedWhite(pos)) break;
                legalIndexes.push(pos);
                if (isOccupiedBlack(pos)) break;
                pos += dir;
            }
        }
    }

    // ♖ WHITE ROOK
    if (name === "rook-w" || name === "queen-w") {
        const directions = [-8, 8, -1, 1];
        for (const dir of directions) {
            let pos = index + dir;
            while (!isKingCheck() && pos >= 0 && pos < 64) {
                // Prevent wrapping horizontally
                if ((dir === 1 || dir === -1) && !sameRow(pos, pos - dir)) break;
                if (isOccupiedWhite(pos)) break;
                legalIndexes.push(pos);
                if (isOccupiedBlack(pos)) break;
                pos += dir;
            }
        }
    }

    // ♔ WHITE KING
    // ♔ WHITE KING
    if (name === "king-w") {
        const moves = [-9, -8, -7, -1, 1, 7, 8, 9];
        const row = Math.floor(index / 8);
        const col = index % 8;

        for (const moveOffset of moves) {
            const move = index + moveOffset;
            if (move < 0 || move >= 64) continue;

            const moveRow = Math.floor(move / 8);
            const moveCol = move % 8;
            if (Math.abs(moveRow - row) > 1 || Math.abs(moveCol - col) > 1) continue;
            if (isOccupiedWhite(move)) continue;

            // --- simulate move to test if it causes check ---
            const originalClasses = Array.from(squares[move].classList);
            const fromClasses = Array.from(squares[index].classList);

            // Temporarily move king
            squares[move].classList.add("king-w", "piece");
            squares[index].classList.remove("king-w", "piece");

            const inCheck = isKingCheck(); // test if king still in check

            // Undo temporary move
            squares[index].classList.add("king-w", "piece");
            squares[move].classList.remove("king-w", "piece");
            for (const c of originalClasses) {
                if (!["square", "light-square", "dark-square"].includes(c)) {
                    squares[move].classList.add(c);
                }
            }

            if (!inCheck) {
                legalIndexes.push(move);
            }

        }
        // Kingside castling (O-O)
        if (!kingHasMoved && !kingsideRookHasMoved) {
            const kingsidePath = [61, 62]; // f1, g1
            let kingsideValid = true;

            // Check if squares between king and rook are empty
            for (const squareIndex of kingsidePath) {
                if (isOccupiedWhite(squareIndex) || isOccupiedBlack(squareIndex)) {
                    kingsideValid = false;
                    break;
                }
            }

            // Check if king doesn't move through check
            if (kingsideValid) {
                let castlingValid = true;

                // Check if king is not in check
                if (isKingCheck()) {
                    castlingValid = false;
                }

                // Check if king doesn't move through attacked squares
                for (const checkIndex of [61, 62]) { // f1, g1
                    // Simulate king position to check for attack
                    const originalClasses = Array.from(squares[checkIndex].classList);
                    squares[checkIndex].classList.add("king-w", "piece");
                    squares[index].classList.remove("king-w", "piece");

                    if (isKingCheck()) {
                        castlingValid = false;
                    }

                    // Restore original state
                    squares[index].classList.add("king-w", "piece");
                    squares[checkIndex].classList.remove("king-w", "piece");
                    for (const c of originalClasses) {
                        if (!["square", "light-square", "dark-square"].includes(c)) {
                            squares[checkIndex].classList.add(c);
                        }
                    }

                    if (!castlingValid) break;
                }

                if (castlingValid) {
                    legalIndexes.push(62); // g1 for kingside castling
                }
            }
        }

        // Queenside castling (O-O-O)
        if (!kingHasMoved && !queensideRookHasMoved) {
            const queensidePath = [59, 58, 57]; // d1, c1, b1
            let queensideValid = true;

            // Check if squares between king and rook are empty
            for (const squareIndex of queensidePath) {
                if (isOccupiedWhite(squareIndex) || isOccupiedBlack(squareIndex)) {
                    queensideValid = false;
                    break;
                }
            }

            // Check if king doesn't move through check
            if (queensideValid) {
                let castlingValid = true;

                // Check if king is not in check
                if (isKingCheck()) {
                    castlingValid = false;
                }

                // Check if king doesn't move through attacked squares
                for (const checkIndex of [59, 58]) { // d1, c1 (b1 doesn't need checking for castling)
                    // Simulate king position to check for attack
                    const originalClasses = Array.from(squares[checkIndex].classList);
                    squares[checkIndex].classList.add("king-w", "piece");
                    squares[index].classList.remove("king-w", "piece");

                    if (isKingCheck()) {
                        castlingValid = false;
                    }

                    // Restore original state
                    squares[index].classList.add("king-w", "piece");
                    squares[checkIndex].classList.remove("king-w", "piece");
                    for (const c of originalClasses) {
                        if (!["square", "light-square", "dark-square"].includes(c)) {
                            squares[checkIndex].classList.add(c);
                        }
                    }

                    if (!castlingValid) break;
                }

                if (castlingValid) {
                    legalIndexes.push(58); // c1 for queenside castling
                }
            }
        }
    }



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

    // === Determine castling rights ===
    let castling = "";

    // White pieces
    const whiteKing = squares[60]?.classList.contains("king-w"); // e1
    const whiteRookA1 = squares[56]?.classList.contains("rook-w"); // a1
    const whiteRookH1 = squares[63]?.classList.contains("rook-w"); // h1

    if (whiteKing && whiteRookH1) castling += "K";
    if (whiteKing && whiteRookA1) castling += "Q";

    // Black pieces
    const blackKing = squares[4]?.classList.contains("king-b"); // e8
    const blackRookA8 = squares[0]?.classList.contains("rook-b"); // a8
    const blackRookH8 = squares[7]?.classList.contains("rook-b"); // h8

    if (blackKing && blackRookH8) castling += "k";
    if (blackKing && blackRookA8) castling += "q";

    if (castling === "") castling = "-";

    // === Assemble final FEN ===
    fen += isWhiteMoves
        ? ` w ${castling} - ${halfmoveClock} ${fullmoveNumber}`
        : ` b ${castling} - ${halfmoveClock} ${fullmoveNumber}`;

    console.log("FEN:", fen);
    return fen;
}




//LICHESS BOT




function MovePiece(chess_note) {
    const previous = chess_note.slice(0, 2);
    const move = chess_note.slice(2, 4);
    let MovedPiece = null;
    let removePiece = null;


    for (let i = 0; i < squares.length; i++) {
        if (move == indexToNote(i).toLowerCase()) {
            MovedPiece = squares[i];
        }

        if (previous == indexToNote(i).toLowerCase()) {
            removePiece = squares[i]
        }
    }
    if (removePiece.classList.contains("pawn-w") || removePiece.classList.contains("pawn-b")) {
        halfmoveClock = 0;
    } else {
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
function isCheck(index, color) {
    const enemyColor = color === "w" ? "b" : "w";
    const ownColor = color === "w" ? "w" : "b";

    const directions = {
        diagonal: [-9, -7, 7, 9],
        straight: [-8, 8, -1, 1],
    };

    // --- Diagonals: bishops + queens ---
    for (const dir of directions.diagonal) {
        let i = index + dir;
        while (i >= 0 && i < 64 && sameLine(index, i, dir)) {
            const sq = squares[i];
            if (!sq) break;

            if (sq.classList.contains("piece")) {
                if (sq.classList.contains(`-${ownColor}`)) break;
                if (
                    sq.classList.contains(`bishop-${enemyColor}`) ||
                    sq.classList.contains(`queen-${enemyColor}`)
                ) return true;
                break;
            }
            i += dir;
        }
    }

    // --- Horizontals/verticals: rooks + queens ---
    for (const dir of directions.straight) {
        let i = index + dir;
        while (i >= 0 && i < 64 && sameLine(index, i, dir)) {
            const sq = squares[i];
            if (!sq) break;

            if (sq.classList.contains("piece")) {
                if (sq.classList.contains(`-${ownColor}`)) break;
                if (
                    sq.classList.contains(`rook-${enemyColor}`) ||
                    sq.classList.contains(`queen-${enemyColor}`)
                ) return true;
                break;
            }
            i += dir;
        }
    }

    return false;
}

function sameLine(from, to, dir) {
    const fromRow = Math.floor(from / 8);
    const toRow = Math.floor(to / 8);
    const fromCol = from % 8;
    const toCol = to % 8;

    if (dir === -8 || dir === 8) return fromCol === toCol; // vertical
    if (dir === -1 || dir === 1) return fromRow === toRow; // horizontal
    return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol); // diagonal
}




function isKingCheck() {
    let kingIndex = null;

    // Find white king
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].classList.contains("king-w")) {
            kingIndex = i;
            break;
        }
    }
    if (kingIndex === null) return false;

    const enemyColor = "b";
    const row = Math.floor(kingIndex / 8);
    const col = kingIndex % 8;

    // --- Check for pawn attacks (black pawns attack downwards) ---
    const pawnAttacks = [kingIndex + 7, kingIndex + 9];
    for (const a of pawnAttacks) {
        if (a >= 0 && a < 64 && Math.abs(Math.floor(a / 8) - row) === 1) {
            if (squares[a].classList.contains(`pawn-${enemyColor}`)) return true;
        }
    }

    // --- Check for knight attacks ---
    const knightOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];
    for (const offset of knightOffsets) {
        const pos = kingIndex + offset;
        if (pos < 0 || pos >= 64) continue;
        const pr = Math.floor(pos / 8), pc = pos % 8;
        if (Math.abs(pr - row) === 2 && Math.abs(pc - col) === 1 ||
            Math.abs(pr - row) === 1 && Math.abs(pc - col) === 2) {
            if (squares[pos].classList.contains(`knight-${enemyColor}`)) return true;
        }
    }

    // --- Check for diagonal attacks (bishops + queens) ---
    const diagonalDirs = [-9, -7, 7, 9];
    for (const dir of diagonalDirs) {
        let pos = kingIndex + dir;
        while (pos >= 0 && pos < 64 && Math.abs((pos % 8) - ((pos - dir) % 8)) === 1) {
            const sq = squares[pos];
            if (sq.classList.contains("piece")) {
                if (sq.classList.contains(`bishop-${enemyColor}`) ||
                    sq.classList.contains(`queen-${enemyColor}`)) return true;
                break;
            }
            pos += dir;
        }
    }

    // --- Check for straight attacks (rooks + queens) ---
    const straightDirs = [-8, 8, -1, 1];
    for (const dir of straightDirs) {
        let pos = kingIndex + dir;
        while (pos >= 0 && pos < 64) {
            if ((dir === 1 || dir === -1) &&
                Math.floor(pos / 8) !== Math.floor((pos - dir) / 8)) break;
            const sq = squares[pos];
            if (sq.classList.contains("piece")) {
                if (sq.classList.contains(`rook-${enemyColor}`) ||
                    sq.classList.contains(`queen-${enemyColor}`)) return true;
                break;
            }
            pos += dir;
        }
    }

    // --- Check for king attacks (adjacent squares) ---
    const kingOffsets = [-9, -8, -7, -1, 1, 7, 8, 9];
    for (const offset of kingOffsets) {
        const pos = kingIndex + offset;
        if (pos < 0 || pos >= 64) continue;
        const pr = Math.floor(pos / 8), pc = pos % 8;
        if (Math.abs(pr - row) <= 1 && Math.abs(pc - col) <= 1) {
            if (squares[pos].classList.contains(`king-${enemyColor}`)) return true;
        }
    }

    return false;
}
const moveBox = document.querySelector(".move-box p").style.display = "none";
function Quotes() {
    const moveBox = document.querySelector(".move-box p")
    const quotes = [
        "I believe in America. America has made my fortune.",
        "I'm gonna make you an offer you can't refuse",
        "And I raised my daughter in the American fashion.",
        "I gave her freedom, but I taught her never to dishonor her family.",
        "She found a boyfriend; not an Italian.",
        "She went to the movies with him; she stayed out late. I didn't protest.",
        "Two months ago, he took her for a drive, with another boyfriend.",
        "They made her drink whiskey. And then they tried to take advantage of her.",
        "She resisted. She kept her honor. So they beat her, like an animal.",
        "When I went to the hospital, her nose was broken.",
        "Her jaw was shattered, held together by wire.",
        "She couldn't even weep because of the pain. But I wept.",
        "She was the light of my life — beautiful girl. Now she will never be beautiful again.",
        "I went to the police, like a good American.",
        "These two boys were brought to trial.",
        "The judge sentenced them to three years in prison — suspended sentence.",
        "They went free that very day!",
        "I stood in the courtroom like a fool, and they smiled at me.",
        "Then I said to my wife: 'For justice, we must go to Don Corleone.'",
        "Why did you go to the police? Why didn't you come to me first?",
        "What do you want of me? Tell me anything.",
        "We've known each other many years, but this is the first time you came to me for help.",
        "You never wanted my friendship.",
        "You were afraid to be in my debt.",
        "You found paradise in America, had a good trade, made a good living.",
        "The police protected you; there were courts of law.",
        "And you didn't need a friend like me.",
        "But now you come to me and you say: 'Don Corleone, give me justice.'",
        "But you don't ask with respect.",
        "You don't offer friendship.",
        "You don't even think to call me Godfather.",
        "Instead, you come into my house on the day my daughter is to be married,",
        "And you ask me to do murder, for money."
    ];


    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    moveBox.innerText = randomQuote;
    moveBox.style.display = "block";


}








console.log(isCheck(60, "w"))

document.addEventListener('keydown', function (event) {
    if (event.key.toLowerCase() === 'f') {
        // Load the audio
        const audio = new Audio('sabrina.mp3'); // <-- make sure the path is correct
        audio.currentTime = 0;
        audio.play();

        // Stop after 6 seconds
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; // reset to beginning
        }, 6400);

        // Flash animation
        const squares = document.querySelectorAll('.light-square');
        squares.forEach(square => {
            square.classList.remove('flash-square');
            void square.offsetWidth; // restart animation
            square.classList.add('flash-square');
        });
    }
});


function isMate() {
    let kingIndex = null;

    for (let i = 0; i < squares.length; i++) {
        if (squares[i].classList.contains("king-w")) {
            kingIndex = i;
            break;
        }
    }
    legals = getLegels("king-w", kingIndex)
    return legals.length
}



const winbox = document.getElementsByClassName("winBox")[0].style.display = "none";



