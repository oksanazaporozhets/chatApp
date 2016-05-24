(function () {
    var session_username = sessionStorage.getItem('ss_user_email'),
        chat_title = getDomElement('#chat-title'),
        messages = getDomElement('.chat-messages'),
        textarea = getDomElement('.chat-app textarea');
   
    try {
        var server = io.connect('http://127.0.0.1:8080');
    } catch (e) {
        alert('Page not found.' + e);
    }
    // if the server connection is successful
    if (server !== undefined) {
        server.emit('chat-connection', sessionStorage.getItem('ss_user_email'));
    
        server.on('update-title', function(name){
            name += ', ';
            chat_title.innerHTML = name.concat(chat_title.innerHTML);
        });

        server.on('output', function (data) {
            if (data.length) {
               
                for (var i = 0; i < data.length; i++) {
                    var wrapper = document.createElement('div');
                    wrapper.setAttribute('class', 'chat-wrapper');

                    var picWrapper = document.createElement('div');
                    picWrapper.setAttribute('class', 'pic-wrapper');

                    wrapper.appendChild(picWrapper);
                    //var image = document.createElement('img');
                    //image.setAttribute('src', data[i].photo);
                    //image.setAttribute('class', 'profile-pic');
                    //
                    //image.setAttribute('width', '100%');
                    //image.setAttribute('height', '100%');
                    //picWrapper.appendChild(image);
                    
                    image.addEventListener('error', function(){
                        this.onerror = "";
                        return true;
                    });
                    
                    // create the last message
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');

                    var msg = '<span>';
 
                    if (data[i].email === session_username) {
                        msg += 'You message:</span>';
                    } else {
                        msg += data[i].name + ':</span>';
                    }

                    message.innerHTML = msg;
                    message.innerHTML += data[i].message;
                    wrapper.appendChild(message);
                    wrapper.scrollTop = messages.scrollHeight;
                    messages.appendChild(wrapper);
                    messages.scrollTop = messages.scrollHeight;
                }
            }
        });

        textarea.addEventListener('keydown', function (event) {
            if (event.which === 13 && event.shiftKey === false) {
                server.emit('input', {
                    email: session_username,
                    message: this.value
                });
                event.preventDefault;
            }
        });
    };

    function getDomElement(s) {
            return document.querySelector(s);
        };
})();