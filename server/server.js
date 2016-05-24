var http = require('http');
var mongo = require('mongodb').MongoClient;
var io = require('socket.io');
var app = require('express');
var client = require('socket.io').listen(app).sockets;
app.listen(3000);

mongo.connect('mongodb://127.0.0.1:27017/chat', function(err, db) {
    var usercount = 0;
    if (err) throw err;
    console.log("Server has started.");

    client.on('connection', function(socket) {
        socket.on('join', function(data) {
            var user_email = data.user_email,
                user_name = data.user_name,
                photo_option = data.photo_option,
                fpass = data.fpass,
                cpass = data.cpass;
            if (user_email === '' || user_name === '' || cpass === '' || fpass === '') {
                socket.emit('alert', 'You missed one field.');
                return;
            }
            if (fpass !== cpass) {
                socket.emit('alert', 'Wrong pair login/password!');
                return;
            };
            var users = db.collection('users');

            users.find().sort({
                _id: 1
            }).toArray(function(err, res) {
                if (err) throw err;
                var newUserEmail = user_email;
                if (!isUserAlreadyExist(newUserEmail, res)) {
                    // if not found, push the user into the db
                    users.insert({
                        user_email: user_email,
                        user_name: user_name,
                        photo_option: photo_option,
                        password: cpass
                    }, function() {
                        socket.emit('alert', 'Your account has been created');
                        socket.emit('clear-login');
                        return found;
                    });
                } else {
                    socket.emit('alert', 'Username already exists. ');
                }

                function isUserAlreadyExist(newUserEmail, res) {
                    if (res.length) {
                        for (var i = 0; i < res.length; i++) {
                            var answer;
                            if (newUserEmail === res[i].user_email) {
                                return true;
                            }
                            return false;
                        }
                    } else {
                        return false;
                    }
                };
            });
        });

        socket.on('login', function(login_info) {
            var this_user_email = login_info.user_email,
                this_user_password = login_info.user_password;

            if (this_user_email === '' || this_user_password === '') {
                socket.emit('alert', 'Please fill both fields');
            } else {
                var users = db.collection('users');
                users.find().toArray(function(err, res) {
                    if (err) throw err;

                    var found = false,
                        location = -1;

                    if (res.length) {
                        for (i = 0; i < res.length; i++) {
                            if (res[i].user_email === this_user_email) {
                                found = true;

                                if (res[i].password === this_user_password) {
                                    socket.emit('redirect', 'chat.html');
                                } else {
                                    socket.emit('alert', 'Please retry password');
                                }
                                break;
                            }
                        }

                        if (!found) {
                            socket.emit('alert', 'Sorry, could not find you. Please sign up.');
                            socket.emit('redirect', 'signup.html');
                        }
                    }
                })
            }
        });

        socket.on('chat-connection', function(ss_user_email) {
            var users = db.collection('users');
            users.find({
                'user_email': ss_user_email
            }).toArray(function(err, res) {
                if (err) throw err;

                var user = res[0];
                socket.broadcast.emit('status', user.user_name + ' has just joined the chat room.');
                socket.emit('update-title', user.user_name);

                var col = db.collection('messages'),
                    sendStatus = function(s) {
                        socket.emit('status', s);
                    };

                col.find().limit(100).sort({
                    _id: 1
                }).toArray(function(err, res) {
                    if (err) throw err;
                    socket.emit('output', res);
                    socket.on('input', function(data) {
                        var email = data.email,
                            photo = user.photo_option,
                            name = user.user_name,
                            message = data.message;

                        var new_msg = {
                            email: email,
                            photo: photo,
                            name: name,
                            message: message
                        };

                        if (message !== "") {
                            col.insert(
                                new_msg,
                                function() {
                                    // send latest message to all clients
                                    client.emit('output', [new_msg]);

                                    sendStatus({
                                        message: "Message sent",
                                        clear: true
                                    });
                                });
                        } else {
                            sendStatus('Name or message is missing');
                        }
                    });
                });
                socket.on('disconnect', function() {
                    socket.broadcast.emit('status', user.user_name + ' has just left the chat room.');
                });
            });
        });
    });
});