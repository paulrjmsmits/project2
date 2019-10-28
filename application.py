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
    channel = request.form.get("channelname")
    print(channel)

    # Check if displayname is in set of users
    return jsonify({"success": not channel in channels})


@socketio.on("add channel")
def addchannel(data):
    channel = data["channel"]
    channels.add(channel)
    emit("channel added", channel, broadcast=True)


@app.route("/loadfavorites", methods=["POST"])
def loadfavorites():

    # Query for displayname and currentchannel
    displayname = request.form.get("displayname")
    print(displayname)

    # Return the favorites and the messages in the currentchannel
    return jsonify({"favorites": usersfavorites[displayname]})


@app.route("/loadmessages", methods=["POST"])
def loadmessages():

    # Query for displayname and currentchannel
    currentchannel = request.form.get("currentchannel")
    print(currentchannel)

    # Return the favorites and the messages in the currentchannel
    return jsonify({"messages": channelsmessages[currentchannel]})


@app.route("/")
def index():
    channels.append("streetlife")
    return render_template("index.html", channels=channels)
