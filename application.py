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
    return render_template("index.html", channels=channels)


@app.route("/adddisplayname", methods=["POST"])
def adddisplayname():

    # Query for displayname and currentchannel
    displayname = request.form.get("displayname")

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

@app.route("/addfavorite", methods=["POST"])
def addfavorite():

    # Query for favorite
    favorite = request.form.get("favorite")
    displayname = request.form.get("displayname")

    if not favorite in usersfavorites[displayname]:
        usersfavorites[displayname].append(favorite)
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

@app.route("/removefavorite", methods=["POST"])
def removefavorite():

    # Query for favorite
    favorite = request.form.get("favorite")
    displayname = request.form.get("displayname")

    if favorite in usersfavorites[displayname]:
        usersfavorites[displayname].remove(favorite)
        print(usersfavorites[displayname])
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})

@app.route("/loadfavorites", methods=["POST"])
def loadfavorites():

    # Query for displayname
    displayname = request.form.get("displayname")

    if displayname in usersfavorites:
        return jsonify({"present": True, "favorites": usersfavorites[displayname]})
    else:
        return jsonify({"present": False})

    # Return the favorites and the messages in the currentchannel


@app.route("/loadmessages", methods=["POST"])
def loadmessages():

    # Query for current channel
    channel = request.form.get("channel")
    print(channel)
    displayname = request.form.get("displayname")
    print(displayname)
    favorite = channel in usersfavorites[displayname];

    if channel in channelsmessages:
        return jsonify({"present": True, "favorite": favorite, "messages": channelsmessages[channel]})
    else:
        return jsonify({"present": False, "favorite": favorite})


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
