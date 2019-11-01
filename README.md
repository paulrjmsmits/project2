# Project 2: Flack, a messaging application for teams

CS50w: Web Programming with Python and JavaScript

## Summary of application

After submitting a display name, the user can listen to, subscribe to and create channels, in which he/she can view and send messages to all subscribers of those channels.

## Short description of the functionality

First time users are presented with a pop-up window to register a unique display name. A known user can subscribe to and create channels, view and create messages in every subscribed channel. A menu with all channels is visible on the left and collapses for smaller screens. Newly created channels are immediately visible for every user. New messages are broadcasted to all users, together with the display name of the sender and a timestamp.

When the browser is reopened after closing, the display name and the most recent channel are remembered and presented to the user.

A special feature is that the user can mark channels as favorite. Favorite channels are separately listed in the menu. A favorite channel can be unmarked as well. The menu with channels, favorites etc. on the left is collapsible.

## Technology

Javascript, Python3, Flask
Requires browser with ES6 / Local Storage

## Files

README.md, application.py
In directory templates: index.html
In directory static: index.js, styles.css, backgroundimage.jpg

## Implementation remarks
- Messages are stored in variables in the application on the server and not in a database. A maximum of one hundred messages per channel is saved.
- For test purposes, a few display names (demo and paul), channels and messages are pre-read into the application, in order not to start with a completely empty application.
