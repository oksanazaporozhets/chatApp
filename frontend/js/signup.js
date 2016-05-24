//(function(){
//    var checkbox = document.getElementById('photo_option');
//    var is_checked;
//    var photo_input = document.getElementById('photo_input');
//
//    function toggle() {
//        if (!is_checked) {
//            photo_input.style.display = "block";
//            is_checked = true;
//        } else {
//            photo_input.style.display = "none";
//            is_checked = false;
//        }
//        return is_checked;
//    }
//    checkbox.addEventListener('click', toggle);
//})();

(function(){
    
    var user_email_input = getDomElement('#user_email'),
        user_name_input = getDomElement('#user_name'),
        //photo_option = getDomElement('#photo_option'),
        //photo_input = getDomElement('#photo_input'),
        fpass_input = getDomElement('#password_first'),
        cpass_input = getDomElement('#password_confirm'),
        submit_button = getDomElement('#submit_button');

    try {
        var server = io.connect('http://127.0.0.1:8080');
    }
    catch(e) {
        alert('Error. ' + e);
    }
    
    function getDomElement(s) {
        return document.querySelector(s);   
    };
    // if successful
    if(server) {
        submit_button.addEventListener('click', function(event){
            var user_email = user_email_input.value,
                user_name = user_name_input.value,
                photo_option = photo_input.value,
                fpass = fpass_input.value,
                cpass = cpass_input.value;

            server.emit('join', {
                user_email: user_email,
                user_name: user_name,
                photo_option: photo_option,
                fpass: fpass,
                cpass: cpass
            });
            event.preventDefault;
        });
        
        server.on('alert', function(msg){
            alert(msg);
        });

        server.on('clear-login', function(){
                user_email_input.value = '';
                user_name.value = '';
                photo_option.checked = false;
                photo_input.value = '';
                photo_input.style.display = 'none';
                fpass_input.value = '';
                cpass_input.value = '';
        });
    }
})();