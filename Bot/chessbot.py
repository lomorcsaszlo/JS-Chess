from flask import Flask, request, jsonify
from flask_cors import CORS
import chess

app = Flask(__name__)
CORS(app)

@app.post("/api/hello")
def hello():
    data = request.get_json() or {}
    name = data.get("name", "Unknown")
    return jsonify(message=f"Hello, {name}!")

if __name__ == "__main__":
    app.run(debug=True)


