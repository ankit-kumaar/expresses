const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Serve the login form
app.get('/login', (req, res, next) => {
    res.send(
        '<form action="/login" method="POST">' +
        '<input type="text" name="username" placeholder="Your username"><br>' +
        '<button type="submit">Login</button></form>'
    );
});

// Handle the login form submission and store the username and the first message in the file
app.post('/login', (req, res, next) => {
    const username = req.body.username;
    const message = 'Welcome to the chat!'; // The first message after login
    const messageEntry = { username, message };

    // Append the message entry to the file
    fs.appendFile('messages.txt', JSON.stringify(messageEntry) + '\n', (err) => {
        if (err) {
            console.error('Error writing message to file:', err);
        }
        res.cookie('username', username); // Store the username in a cookie
        res.redirect('/');
    });
});

// Serve the main page with the send message form and display stored messages
app.get('/', (req, res, next) => {
    const username = req.cookies.username || '';
    const messages = readMessagesFromFile();

    let html = '<h2>Welcome, ' + username + '</h2>' +
        '<form action="/" method="POST">' +
        '<input type="text" name="message" placeholder="Message"><br>' +
        '<button type="submit">Send</button></form>';

    // Display stored messages
    if (messages.length > 0) {
        html += '<h2>Stored Messages:</h2><ul>';

        for (const message of messages) {
            html += `<li>${message.username}: ${message.message}</li>`;
        }

        html += '</ul>';
    }

    res.send(html);
});

// Handle the send message form submission and store the message in the file
app.post('/', (req, res, next) => {
    const username = req.cookies.username || '';
    const message = req.body.message;
    const messageEntry = { username, message };

    // Append the message entry to the file
    fs.appendFile('messages.txt', JSON.stringify(messageEntry) + '\n', (err) => {
        if (err) {
            console.error('Error writing message to file:', err);
        }
        res.redirect('/');
    });
});

// Function to read messages from the file and return them as an array of objects
function readMessagesFromFile() {
    try {
        const data = fs.readFileSync('messages.txt', 'utf8');
        const lines = data.split('\n');
        const messages = [];
        for (const line of lines) {
            if (line.trim() !== '') {
                const messageEntry = JSON.parse(line);
                messages.push(messageEntry);
            }
        }
        return messages;
    } catch (err) {
        console.error('Error reading messages from file:', err);
        return [];
    }
}

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
