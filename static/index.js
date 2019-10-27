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

// For testing purposes set values of localStorage
localStorage.setItem("displayname", "paul");
localStorage.setItem("currentchannel", "movies");

document.addEventListener('DOMContentLoaded', () => {

    // Check if displayname has been created
    if (!localStorage.getItem("displayname")) {
        // TO DO inlogprocedure
    }
    // TO DO hier 'else' gebruiken?
    const displayname = localStorage.getItem("displayname")

    // Check if displayname is valid
    // Initialize new request
    const request = new XMLHttpRequest();
    request.open('POST', '/checkdisplayname');

    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        // Update the result div
        if (data.success) {
            document.getElementById("displayname").innerHTML = displayname;
        }
        else {
            // TO DO aanmelden of inloggen
        }
    }

    // Add data to send with request
    const data = new FormData();
    data.append("displayname", displayname);

    // Send request
    request.send(data);

});


document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        // Each button should emit a "submit vote" event
        document.querySelectorAll('button').forEach(button => {
            button.onclick = () => {
                const selection = button.dataset.vote;
                socket.emit('submit vote', {'selection': selection});
            };
        });
    });

    // When a new vote is announced, add to the unordered list
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });
});

document.addEventListener('DOMContentLoaded', () => {

    // By default, submit button is disabled
    document.querySelector('#submit').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#message').onkeyup = () => {
        if (document.querySelector('#message').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    };

    document.querySelector('#new-message').onsubmit = () => {

        // Create new item for list
        const li = document.createElement('li');
        li.innerHTML = document.querySelector('#message').value;

        // Add new item to task list
        document.querySelector('#messages').append(li);

        // Clear input field and disable button again
        document.querySelector('#message').value = '';
        document.querySelector('#submit').disabled = true;

        // Stop form from submitting
        return false;
    };

});


// Load current value of  counter
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#displayname').innerHTML = localStorage.getItem('displayname');

    // Count every time button is clicked
    document.querySelector('button').onclick = () => {
        // Increment current display
        let displayname = localStorage.getItem('displayname');

        // do something with displayname; counter++;

        // Update displayname
        document.querySelector('#displayname').innerHTML = displayname;
        localStorage.setItem('displayname', displayname);
    }
});
