// 1. Helper function to call chess-api.com
async function postChessApi(data = {}) {
    const response = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

// 2. Main function to get best move from a FEN
export async function getBestMove(fen) {
    try {
        const data = await postChessApi({ fen: fen });

        // The API returns something like:
        // { "move": "e2e4", "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1" }
        const bestMove = data.move || null;

        console.log("Best move:", bestMove);
        return bestMove;
    } catch (err) {
        console.error("Error fetching best move:", err);
        return null;
    }
}

// 3. Example usage:
getBestMove("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
