from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import random

def teszt():
    data = request.get_json() or {}

    FEN = data.get("fen", "Unknown")

    board = chess.Board(FEN)

    board.push(list(board.legal_moves)[0])
    

    
    return board.fen()



app = Flask(__name__)
CORS(app)

@app.post("/api/hello")

def hello():
    data = request.get_json() or {}

    name = data.get("fen", "Unknown")
    

    return jsonify({
        # "reply": f"{name}",
        "reply": f"{teszt()}",
    })

if __name__ == "__main__":
    app.run(debug=True)



teszt()