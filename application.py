import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

votes = {"yes": 0, "no": 0, "maybe": 0}
users = {"paul", "demo"}
channels = ["movies", "restaurants", "bars", "festivals"]
usersfavorites = {"paul": ["movies", "restaurants"], "demo": ["restaurants", "bars"]}
channelsmessages = {"movies": [{"user": "paul", "timestamp": "Wed 24 Oct 12:03", "message": "first message in movies"}, \
                            {"user": "paul", "timestamp": "Thu 25 Oct 8:03", "message": "second message in movies"}], \
                            "restaurants": [{"user": "demo", "timestamp": "Thu 25 Oct 11:00", "message": "first message in restaurants"}]}


@app.route("/checkdisplayname", methods=["POST"])
def checkdisplayname():

    # Query for currency exchange rate
    # TO DO not sure if syntax is right
    displayname = request.form.get("displayname")
    print(displayname)

    # Check if displayname is in set of users
    success = displayname in users
    return jsonify(success)


@app.route("/")
def index():
    channels.append("streetlife")
    return render_template("index.html", channels=channels)


@socketio.on("submit vote")
def vote(data):
    selection = data["selection"]
    votes[selection] += 1
    emit("vote totals", votes, broadcast=True)
