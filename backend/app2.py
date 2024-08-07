from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/data', methods=['POST'])
def get_data():
    data = request.json
    response = {
        'received_data': data,
        'message': 'Data received successfully!'
    }
    return jsonify(response)

@app.route('/api/test', methods=['GET'])
def test_get():
    return jsonify({"message": "GET request successful!"})

if __name__ == '__main__':
    app.run(debug=True)
