from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import random

app = Flask(__name__)
CORS(app)  # Allow requests from JS frontend

def get_random_move(fen):
    """
    Returns a random legal move in UCI format for a given FEN.
    """
    board = chess.Board(fen)
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return None  # No legal moves (checkmate/stalemate)
    move = random.choice(legal_moves)
    return move.uci()  # e.g., "e2e4"

@app.post("/api/bestmove")
def best_move():
    data = request.get_json() or {}
    fen = data.get("fen")
    if not fen:
        return jsonify({"error": "FEN is required"}), 400

    move = get_random_move(fen)
    if not move:
        return jsonify({"error": "No legal moves available"}), 400

    return jsonify({"move": move})

if __name__ == "__main__":
    app.run(debug=True)
