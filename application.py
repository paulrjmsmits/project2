import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Some initial values, so that the application will not start completely empty
users = {"paul", "demo"}
channels = ["movies", "restaurants", "bars", "festivals"]
usersfavorites = {"paul": ["movies", "restaurants"], "demo": ["restaurants", "bars"]}
channelsmessages = {"movies": [{"user": "paul", "timestamp": "Wed 24 Oct 12:03", "message": "first message in movies"}, \
                            {"user": "paul", "timestamp": "Thu 25 Oct 8:03", "message": "second message in movies"}], \
                            "restaurants": [{"user": "demo", "timestamp": "Thu 25 Oct 11:00", "message": "first message in restaurants"}], \
                            "bars": [], "festivals": []}


@app.route("/")
def index():
    return render_template("index.html", channels=channels)


@app.route("/adddisplayname", methods=["POST"])
def adddisplayname():

    # Query for display name
    displayname = request.form.get("displayname")

    # Check if display name is in set of users, if not, add it
    if displayname in users:
        return jsonify({"success": False})
    else:
        users.add(displayname)
        usersfavorites[displayname] = []
        return jsonify({"success": True})


@app.route("/addfavorite", methods=["POST"])
def addfavorite():

    # Query for favorite and display name
    favorite = request.form.get("favorite")
    displayname = request.form.get("displayname")

    # If the favorite does not yet exist, create it, otherwise return false
    if not favorite in usersfavorites[displayname]:
        usersfavorites[displayname].append(favorite)
        return jsonify({"success": True})
    else:
        return jsonify({"success": False})


@app.route("/removefavorite", methods=["POST"])
def removefavorite():

    # Query for favorite and display name
    favorite = request.form.get("favorite")
    displayname = request.form.get("displayname")

    # If favorite is in the user's favorites, remove it, else return false
    if displayname in usersfavorites:
        if favorite in usersfavorites[displayname]:
            usersfavorites[displayname].remove(favorite)
            return jsonify({"success": True})
    return jsonify({"success": False})

@app.route("/loadfavorites", methods=["POST"])
def loadfavorites():

    # Query for display name
    displayname = request.form.get("displayname")

    # Return all favorites, if any
    if displayname in usersfavorites:
        return jsonify({"present": True, "favorites": usersfavorites[displayname]})
    else:
        return jsonify({"present": False})


@app.route("/loadmessages", methods=["POST"])
def loadmessages():

    # Query for current channel and display name
    channel = request.form.get("channel")
    displayname = request.form.get("displayname")
    favorite = channel in usersfavorites[displayname];

    # Return all messages in that channel, if any
    if channel in channelsmessages:
        return jsonify({"present": True, "favorite": favorite, "messages": channelsmessages[channel]})
    else:
        return jsonify({"present": False, "favorite": favorite})


@socketio.on("add channel")
def addchannel(data):

    # Get the channel from the form data
    channel = data["channel"]
    available = not channel in channels

    # If the channel is not present, broadcast it to all users; if it already exists, reply only to sender
    if available:
        channels.append(channel)
        channelsmessages[channel] = []
        emit("channel added", {"available": available, "channel": channel}, broadcast=True)
    else:
        emit("channel added", {"available": available, "channel": channel}, broadcast=False)


@socketio.on("add message")
def addmessage(data):

    # Retrieve the transmitted data and record the time
    displayname = data["displayname"]
    channel = data["channel"]
    message = data["message"]
    timestamp = datetime.now().strftime("%d-%b-%Y %H:%M:%S")

    # Check if user input is valid
    if displayname in users and channel in channels:

        # If the list reaches 100 messages, pop the first message
        if len(channelsmessages[channel]) >= 100:
            channelsmessages[channel].pop(0)

        # Add the message with the display name and timestamp
        channelsmessages[channel].append({"user": displayname, "timestamp": timestamp, "message": message})

        # Broadcast it to all users
        emit("message added", {"channel": channel, "user": displayname, "timestamp": timestamp, "message": message})
