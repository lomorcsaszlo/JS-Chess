// Helper to call your Python server
async function postPythonApi(endpoint, data = {}) {
    const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
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

// Main function to get best move
export async function getBestMove(fen) {
    try {
        // Correct: first argument is endpoint, second is data
        const data = await postPythonApi("api/bestmove", { fen });

        // The API should return { "move": "e2e4" }
        const bestMove = data.move || null;

        console.log("Best move:", bestMove);
        return bestMove;
    } catch (err) {
        console.error("Error fetching best move:", err);
        return null;
    }
}

// Example usage:
getBestMove("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3");
