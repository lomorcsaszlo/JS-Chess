export async function getBestMove(fen) {
    const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${fen}`);
    const data = await res.json();
  
    const bestMove = data.pvs?.[0]?.moves?.split(" ")[0];
    console.log("Best move:", bestMove);
    return bestMove;
}
  