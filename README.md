# Project 2: Flack, a messaging application for teams

CS50w: Web Programming with Python and JavaScript

## Summary of application

After submitting a display name, the user can listen to, subscribe to and create channels, in which he/she can view and send messages to all subscribers of those channels.

## Short description of the functionality

Via a unique display name a user can subscribe to and create channels, view and create messages as well as upload pictures in every subscribed channel. A menu with all channels is visible on the left and collapses for smaller screens.

## Technology

Javascript, Python3, Ajax
Requires browser with ES6 / Local Storage

## files

README.md, application.py
In directory templates: layout.html, index.html
In directory static: styles.css, backgroundimage.jpg

## Detailed working of the application

Dialogue between server and browser:
- At the default web address the user is presented with a form index.html, asking him/her to input a display name, or create a new display name. This will serve as the unique identification of the user.
- Creating a new display name will result in adding this display name to a list on the server. Inputting a known display name will give the user access. Inputting an invalid display name will display an error message.
- A known user is presented with a menu of channels that he has subscribed to and a list of the remaining channels, on the left side of the screen. The right side is filled with messages from the latest channel the user has selected. The menu on the left side of the screen can be collapsed, for use on smaller screens.
- On selecting a channel, all messages of that channel appear on the left side of the screen, together with the display name of the sender and the date and time the message was sent. The user can type in a message of his own, which will be sent to all subscribers of that channel.
- The user can also upload an image, which will be shown in small size in the message thread.
- The user can create a channel, provided the name does not already exist. The channel will be added to the list of channels for all users, and the creator of the channel is automatically subscribed to the channel.

Remarks:
- Registration and login with username and password are not implemented in this version. In future versions this could easily be done by storing this information in a database. For now the display name is the unique key identifying the user.
- Messages are stored in variables in the application on the server and not on a continuous basis saved to a database. Existing users have the relevant data history in Local Storage on their computer, new users load data from the application when submitting their display name. As with login information, saving messages in a database can easily be done in future versions.
- For test purposes, a number of display names, channels and messages are pre-read into the application, in order not to start with a completely empty application.
