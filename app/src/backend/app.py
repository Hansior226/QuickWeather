from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

alerts = [
    "Zabierz parasol – możliwy deszcz!",
    "Piękna pogoda – idealna na spacer!",
    "Uwaga na silny wiatr!",
    "Upał – pamiętaj o wodzie!",
    "Zimno – załóż kurtkę!",
    "Możliwa burza – lepiej zostań w domu."
]

@app.route("/api/weather", methods=["GET"])
def get_random_alert():
    city = request.args.get("city", "nieznane miejsce")
    alert = random.choice(alerts)
    print(f"[INFO] Alert dla {city}: {alert}")
    return jsonify({"city": city, "alert": alert})

if __name__ == "__main__":
    app.run(debug=True)
