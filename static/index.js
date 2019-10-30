// Function to open and close the navigation menu on the left
function openNav() {
    document.getElementById("menu").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("menubutton").style.display = "none";
    document.getElementById("channelheader").style.marginLeft = "0";}
function closeNav() {
    document.getElementById("menu").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("menubutton").style.display = "block";
    document.getElementById("channelheader").style.marginLeft = "45px";}

// Function to open and close a dialogue box
function openForm() {
    document.getElementById('newdisplayname').style.display = "block";}
function closeForm() {
    document.getElementById('newdisplayname').style.display = "none";}

// Function to check whether a display name is available
// If it is, the display name is added to the server list and the function returns true, otherwise false
function addDisplayName(namecandidate) {

    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/adddisplayname');

    // Callback function for when request completes
    request.onload = () => {
        // Extract JSON data from request
        const res = JSON.parse(request.responseText);

        if (res.success) {
            // Define the localStorage variable
            localStorage.setItem("displayname", namecandidate);
            document.getElementById('displaynamefeedback').innerHTML = '';
            // Close the dialogue box
            // closeForm("newdisplayname");
        } else {
            document.getElementById('displaynamefeedback').innerHTML = 'Already in use';
        }

    }

    // Add data to send with request
    const data = new FormData();
    data.append("displayname", namecandidate);

    // Send request
    request.send(data);
}

// This function initiates a user dialogue that results in a valid new display name, both in localStorage as well as server side
function addDisplayName() {
    // Open a dialogue box
    openForm("newdisplayname");
    let namecandidate = "";
    let ready = false;

    // Send the input from the user to the server, repeat this until a new valid name is entered
    while (!ready) {
        document.getElementById("newdisplayname").onsubmit = () => {
            // Retrieve the name that the user entered
            namecandidate = document.getElementById("displayname").value;
            ready = checkDisplayName(namecandidate)
            if (!ready) {
                document.getElementById("displaynamefeedback").innerHTML = "Display name already in use";
            }
            return false;
        }
    }
    // Define the localStorage variable
    localStorage.setItem("displayname", namecandidate);
    // Close the dialogue box
    closeForm("newdisplayname");
}

// Function to load the favorites from the user with the given display name on the page
function loadfavorites (displayname) {
    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/loadfavorites');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        // Create the list of favorites
        for (favorite of data.favorites) {
            const li = document.createElement("li");
            li.innerHTML = favorite;
            // Add new item to task list
            document.querySelector("#favorites").append(li);
        }
    }

    // Add data to send with request
    const data = new FormData();
    data.append("displayname", displayname);

    // Send request
    request.send(data);
}

// Function to load the messages from the given channel on the page
function loadmessages (channel) {
    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/loadmessages');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        // Create the list of messages
        for (message of data.messages) {
            const p1 = document.createElement("p");
            p1.innerHTML = message.user + " " + message.timestamp;
            p1.classList.add("messageheader");
            const p2 = document.createElement("p");
            p2.innerHTML = message.message;
            p2.classList.add("messagetext");
            const div = document.createElement("div");
            div.appendChild(p1);
            div.appendChild(p2);
            div.classList.add("container");
            document.querySelector("#messages").append(div);
        }
    };

    // Add data to send with request
    const data = new FormData();
    data.append("channel", channel);

    // Send request
    request.send(data);
}

// For testing purposes set values of localStorage
// localStorage.setItem("displayname", "paul");
localStorage.removeItem("displayname");
localStorage.setItem("currentchannel", "");

// When the document has finished loading, perform a number of actions
document.addEventListener('DOMContentLoaded', () => {

    // STEP 1. INITIALIZE THE PAGE

    // Check if displayname has been created, add the name to the page
    if (!localStorage.getItem("displayname")) {

        openForm();
        document.getElementById("newdisplayname").onsubmit = () => {

            // Retrieve the name that the user entered
            const namecandidate = document.getElementById("displayname").value;

            // Initialize new request
            const request = new XMLHttpRequest();
            request.open('POST', '/adddisplayname');

            // Callback function for when request completes
            request.onload = () => {
                // Extract JSON data from request
                const res = JSON.parse(request.responseText);

                if (res.success) {
                    // Define the localStorage variable
                    localStorage.setItem("displayname", namecandidate);
                    document.getElementById("displayname").innerHTML = displayname;
                    document.getElementById('displaynamefeedback').innerHTML = '';
                    // Close the dialogue box
                    // closeForm("newdisplayname");
                } else {
                    document.getElementById('displaynamefeedback').innerHTML = 'Already in use';
                }
            }

            // Add data to send with request
            const data = new FormData();
            data.append("displayname", namecandidate);

            // Send request
            request.send(data);
            return false;
        };
    } else {
        const displayname = localStorage.getItem("displayname");
        document.getElementById("displayname").innerHTML = displayname;
        console.log(displayname);
        loadfavorites(displayname);
    }

    // Get the most recent channel from localStorage and load the messages from that channel
    if (localStorage.getItem("currentchannel")) {
        const currentchannel = localStorage.getItem("currentchannel")
        loadmessages(currentchannel);
    }

// STEP 2. CREATE WEBSOCKET TO LISTEN FOR NEW MESSAGES, NEW CHANNELS AND NEW FAVORITES

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        // STEP 2A. WHEN NEW CHANNEL IS CREATED, SEND IT TO ALL USERS

        // To create a new channel
        document.getElementById('newchannel').onsubmit = () => {
            // Select the value of the input field 'channelname'
            const channel = document.getElementById('channel').value;
            console.log("emitted data: " + channel);
            socket.emit('add channel', {'channel': channel});
            // document.getElementById('channelfeedback').innerHTML = '';
            document.getElementById('channel').value = '';
            return false;
        }
    });

    // When a new vote is announced, add to the list
    socket.on('channel added', data => {
        // Add the newly created channel to the list of channels
        console.log("received data: " + data)
        if (data.available) {
            const li = document.createElement('li');
            li.innerHTML = data.channel;
            document.getElementById('channels').append(li);
            document.getElementById('channelfeedback').innerHTML = '';
        } else {
            document.getElementById('channelfeedback').innerHTML = 'Already in use';
        }
    });

    // STEP 2B. WHEN NEW MESSAGE IS CREATED, SEND IT TO ALL USERS
    // TO DO

});
