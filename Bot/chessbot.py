from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import random

app = Flask(__name__)
CORS(app)

def get_random_move(fen):
    """
    Returns:
      move_string (e.g. 'e2e4', 'checkmate W', 'stalemate B')
      status ('normal', 'checkmate', 'stalemate')
    """
    board = chess.Board(fen)
    legal_moves = list(board.legal_moves)

    # side to move = side affected
    color = "W" if board.turn else "B"

    # Checkmate
    if board.is_checkmate():
        return f"checkmate {color}", "checkmate"

    # Stalemate
    if board.is_stalemate():
        return f"stalemate {color}", "stalemate"

    # No legal moves but not mate
    if not legal_moves:
        return f"no_legal_moves {color}", "no_legal_moves"

    # Normal move
    move = random.choice(legal_moves)
    return move.uci(), "normal"

@app.post("/api/bestmove")
def best_move():
    data = request.get_json() or {}
    fen = data.get("fen")

    if not fen:
        return jsonify({"error": "FEN is required"}), 400

    move, status = get_random_move(fen)

    return jsonify({
        "move": move,     # e.g. "e2e4" or "checkmate W" or "stalemate B"
        "status": status
    })

if __name__ == "__main__":
    app.run(debug=True)
