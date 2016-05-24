(function(){
    
    var getDomElement = function(s) {
        return document.querySelector(s);   
    };
            
    var user_email_input = getDomElement('#user_email'),
        user_password_input = getDomElement('#user_password'),
        submit_button = getDomElement('#submit_button');

    try {
        var server = io.connect('http://127.0.0.1:8080');
    }
    catch(e) {
        alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
    }
    
    if(server !== undefined) {
        submit_button.addEventListener('click', function(event){
            
            var user_email = user_email_input.value,
                user_password = user_password_input.value;

            server.emit('login', {
                user_email: user_email,
                user_password: user_password
            });
            event.preventDefault;
        });

        server.on('alert', function(msg){
            alert(msg);
        });
        
        server.on('clear-login', function(){
                user_email_input.value = '';
                user_password_input.value = '';
        });
        
        server.on('redirect', function(href){
            sessionStorage.setItem('ss_user_email', user_email_input.value);
            window.location.assign(href);
        });
    }
})();