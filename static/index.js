// Function to open and close the navigation menu on the left
function openNav() {
    document.getElementById('menu').style.width = '250px';
    document.getElementById('main').style.marginLeft = '250px';
    document.getElementById('menubutton').style.display = 'none';
    document.getElementById('channelheader').style.marginLeft = '0';}
function closeNav() {
    document.getElementById('menu').style.width = '0';
    document.getElementById('main').style.marginLeft = '0';
    document.getElementById('menubutton').style.display = 'block';
    document.getElementById('channelheader').style.marginLeft = '45px';}

// Function to open and close a dialogue box
function openForm() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('displayname-popup').style.display = 'block';}
function closeForm() {
    document.getElementById('displayname-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';}

// Function to add a favorite to the list on the server and display it on the page
function addfavorite(favorite) {

    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/addfavorite');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        if (data.success) {

            // Create the HTML element and append it to the list on the page
            const a = document.createElement('a');
            a.setAttribute('onclick', "loadmessages('" + favorite + "')");
            a.href = 'javascript:void(0)';
            a.innerHTML = favorite;
            const li = document.createElement('li');
            li.id = favorite + '-id';
            li.appendChild(a);
            document.getElementById('favorites').append(li);

            // Change the button in the header to "remove from favorites"
            document.getElementById('favorite-button').innerHTML = "Remove from favorites";
            document.getElementById('favorite-button').setAttribute('onclick', "removefavorite('" + favorite + "')");
        }
    }

    // Add data to request
    const data = new FormData();
    data.append('favorite', favorite);
    data.append('displayname', localStorage.getItem('displayname'));

    // Send request
    request.send(data);
}

// Function to remove a favorite from the list
function removefavorite(favorite) {

    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/removefavorite');

    // Callback function for when request is complete
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        if (data.success) {

            // Get the HTML element with the right channel id and remove it
            const element = document.getElementById(favorite + "-id");
            element.parentNode.removeChild(element);

            // Change the button in the header to "add to favorites"
            document.getElementById('favorite-button').innerHTML = "Add to favorites";
            document.getElementById('favorite-button').setAttribute('onclick', "addfavorite('" + favorite + "')");
        }
    }

    // Add data to request
    const data = new FormData();
    data.append('favorite', favorite);
    data.append('displayname', localStorage.getItem('displayname'));

    // Send data
    request.send(data);
}

// Function to load all favorites from the user with the given display name on the page
function loadfavorites () {

    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/loadfavorites');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        if (data.present) {

            // Create the list of favorites
            for (favorite of data.favorites) {

                // Create the HTML element for the favorite
                const a = document.createElement('a');
                a.setAttribute('onclick', "loadmessages('" + favorite + "')");
                a.href = 'javascript:void(0)';
                a.innerHTML = favorite;
                const li = document.createElement('li');
                li.id = favorite + '-id';
                li.appendChild(a);
                document.getElementById('favorites').append(li);
            }
        }
    }

    // Add data to send with request
    const data = new FormData();
    data.append('displayname', localStorage.getItem('displayname'));

    // Send request
    request.send(data);
}

// Function to load all messages from the given channel on the page
function loadmessages(channel) {

    // Clear the contents of the messages window
    document.getElementById('messages').innerHTML = "";
    // Put the channel name in the header
    document.getElementById('channelheadertext').innerHTML = "Channel: " + channel;

    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/loadmessages');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        // Put a 'remove from favorites' or 'add to favorites' button in the header
        if (data.favorite) {
            document.getElementById('favorite-button').innerHTML = "Remove from favorites";
            document.getElementById('favorite-button').setAttribute('onclick', "removefavorite('" + channel + "')");
        } else {
            document.getElementById('favorite-button').innerHTML = "Add to favorites";
            document.getElementById('favorite-button').setAttribute('onclick', "addfavorite('" + channel + "')");
        }

        if (data.present) {

            // Create the list of messages
            for (message of data.messages) {

                // Create the HTML element for the message
                const p1 = document.createElement('p');
                p1.innerHTML = message.user + ' ' + message.timestamp;
                p1.classList.add('messageheader');
                const p2 = document.createElement('p');
                p2.innerHTML = message.message;
                p2.classList.add('messagetext');
                const div = document.createElement('div');
                div.appendChild(p1);
                div.appendChild(p2);
                div.classList.add('container');
                document.getElementById('messages').append(div);
            }
        }

        // Adjust the localStorage variable
        localStorage.setItem('currentchannel', channel);
    }

    // Add data to send with request
    const data = new FormData();
    data.append('channel', channel);
    data.append('displayname', localStorage.getItem('displayname'));

    // Send request
    request.send(data);
}

// For testing purposes:
// localStorage.setItem("displayname", "demo");
// localStorage.removeItem("displayname");
// localStorage.setItem("currentchannel", "movies");

// When the document has finished loading, perform a number of actions
document.addEventListener('DOMContentLoaded', () => {

    // STEP 1. INITIALIZE THE PAGE

    // Check if displayname has been created, add the name to the page
    if (!localStorage.getItem('displayname')) {

        // Open a dialogue box for a new display name
        openForm();
        document.getElementById('displayname-form').onsubmit = () => {

            // Retrieve the name that the user entered
            const namecandidate = document.getElementById('displayname-input').value;

            // Initialize new request
            const request = new XMLHttpRequest();
            request.open('POST', '/adddisplayname');

            // Callback function for when request completes
            request.onload = () => {

                // Extract JSON data from request
                const res = JSON.parse(request.responseText);

                if (res.success) {

                    // Define the localStorage variable
                    localStorage.setItem('displayname', namecandidate);
                    document.getElementById('displayname').innerHTML = namecandidate;
                    document.getElementById('displayname-feedback').innerHTML = "";

                    // Close the dialogue box
                    closeForm();

                } else {

                    // Notify the user that the entered name is already in use
                    document.getElementById('displayname-feedback').innerHTML = "Already in use";
                }
            }

            // Add data to send with request
            const data = new FormData();
            data.append('displayname', namecandidate);

            // Send request and prevent form from submitting
            request.send(data);
            return false;
        };

    } else {

        // Get the display name from localStorage
        const displayname = localStorage.getItem('displayname');
        document.getElementById('displayname').innerHTML = displayname;
        loadfavorites();

        // Get the most recent channel from localStorage and load the messages from that channel
        if (localStorage.getItem('currentchannel')) {
            const currentchannel = localStorage.getItem('currentchannel')
            loadmessages(currentchannel);
        }
    }

// STEP 2. CREATE WEBSOCKET TO LISTEN FOR NEW CHANNELS AND NEW MESSAGES

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Define what happens when connected
    socket.on('connect', () => {

        // Define what happens when the user enters a channel name
        document.getElementById('newchannel-form').onsubmit = () => {

            // Retrieve the value of the input field
            const channel = document.getElementById('newchannel-input').value;

            // Send the channel to the server, empty the input form and prevent it from submitting
            socket.emit('add channel', {'channel': channel});
            document.getElementById('newchannel-input').value = "";
            return false;
        }

        document.getElementById('newmessage-form').onsubmit = () => {

            // Retrieve the value of the input field
            const message = document.getElementById('newmessage-input').value;

            // Retrieve the value of the display name and the current channel from localStorage
            const displayname = localStorage.getItem('displayname');
            const channel = localStorage.getItem('currentchannel');

            // Send the message to the server, empty the input form and prevent it from submitting
            socket.emit('add message', {'displayname': displayname, 'channel': channel, 'message': message});
            document.getElementById('newmessage-input').value = "";
            return false;
        }
    });

    // Define what happens when reply from server on new channel is received
    socket.on('channel added', data => {

        // If the channel did not already exist, add it to the list of channels on the page
        if (data.available) {

            // Create the HTML element and append it to the list of channels
            const a = document.createElement("a");
            a.setAttribute('onclick', "loadmessages('" + data.channel + "')");
            a.href = 'javascript:void(0)';
            a.innerHTML = data.channel;
            const li = document.createElement('li');
            li.id = data.channel + "-id";
            li.appendChild(a);
            document.getElementById('channels').append(li);

            // Clear the input form
            document.getElementById('channelfeedback').innerHTML = '';

        } else {

            // Notify the user that the channel name is already in use
            document.getElementById('channelfeedback').innerHTML = "Already in use";
        }
    });

    // Define what happens when reply from server on new message is receiced
    socket.on('message added', data => {

        // If the message is in the channel that is currently displayed, add it to the list of messages
        if (data.channel == localStorage.getItem('currentchannel')) {

            // Create the HTML element for the message and append it to the messages in the channel
            const p1 = document.createElement('p');
            p1.innerHTML = data.user + ' ' + data.timestamp;
            p1.classList.add('messageheader');
            const p2 = document.createElement('p');
            p2.innerHTML = data.message;
            p2.classList.add('messagetext');
            const div = document.createElement('div');
            div.appendChild(p1);
            div.appendChild(p2);
            div.classList.add('container');
            document.getElementById('messages').append(div);

            // Scroll to the bottom of the page, to make sure that message is visible
            window.scrollTo(0,document.getElementById("messages").scrollHeight);
        }
    });
});
