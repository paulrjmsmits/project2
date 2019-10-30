import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = {"paul", "demo"}
channels = ["movies", "restaurants", "bars", "festivals"]
usersfavorites = {"paul": ["movies", "restaurants"], "demo": ["restaurants", "bars"]}
channelsmessages = {"movies": [{"user": "paul", "timestamp": "Wed 24 Oct 12:03", "message": "first message in movies"}, \
                            {"user": "paul", "timestamp": "Thu 25 Oct 8:03", "message": "second message in movies"}], \
                            "restaurants": [{"user": "demo", "timestamp": "Thu 25 Oct 11:00", "message": "first message in restaurants"}]}


@app.route("/")
def index():
    channels.append("streetlife")
    return render_template("index.html", channels=channels)


@app.route("/adddisplayname", methods=["POST"])
def adddisplayname():

    # Query for displayname and currentchannel
    displayname = request.form.get("displayname")
    print(displayname)

    # Check if displayname is in set of users
    if displayname in users:
        return jsonify({"success": False})
    else:
        users.add(displayname)
        return jsonify({"success": True})


@app.route("/checkchannel", methods=["POST"])
def checkchannel():

    # Query for displayname and currentchannel
    channel = request.form.get("channel")
    print(channel)
    print(not channel in channels)

    # Check if displayname is in set of users
    return jsonify({"success": not channel in channels})


@app.route("/loadfavorites", methods=["POST"])
def loadfavorites():

    # Query for displayname and currentchannel
    displayname = request.form.get("displayname")
    print("load favorites:", displayname)

    # Return the favorites and the messages in the currentchannel
    return jsonify({"favorites": usersfavorites[displayname]})


@app.route("/loadmessages", methods=["POST"])
def loadmessages():

    # Query for displayname and currentchannel
    channel = request.form.get("channel")

    # Return the favorites and the messages in the currentchannel
    return jsonify({"messages": channelsmessages[channel]})


@socketio.on("add channel")
def addchannel(data):
    channel = data["channel"]
    print("on server: ", channel)
    available = not channel in channels
    if available:
        channels.append(channel)
        emit("channel added", {"available": available, "channel": channel}, broadcast=True)
    else:
        emit("channel added", {"available": available, "channel": channel}, broadcast=False)
