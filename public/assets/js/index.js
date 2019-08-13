(async () => {
    var 
    socket = io(),
    ready = false;

    // templates
    const 
    { msgTemplate, signTemplate, msgTemplateOther } = await $.get("/template.json"),

    // format time
    setTime = (format, time) => {
        return `Entrada ${time.getHours() + format +  time.getMinutes()}`;
    };

    // ui events
    $('.form-username').on('submit', e => {
        e.preventDefault();

        let 
        name = $(e.target.username).val(),
        time = new Date();

        $('.sidebar-header-username').text(name);

        let 
        signTime = time.getMinutes() < 10 
        ? setTime(":0", time)
        : setTime(":", time);

        $('.sidebar-header-time').text(signTime);
        $('.modal').remove();

        ready = true;
        socket.emit("join", name);
    });

    $('.form-message').on('submit', e => {
        e.preventDefault();

        let 
        e_msg = $(e.target.txtMsg),
        msg = e_msg.val();

        if(msg) {

            $('.body').append(msgTemplate.replace("{msg}", msg));

            // socket
            socket.emit("msg", msg);
            e_msg.val("");
        }
    });

    $('.form-message').keydown(key => {
        if(ready) {
            if(key.keyCode == 8) {
                socket.emit('deleting');
            } else {
                socket.emit('typing');
            }
        } 
    });

    const sign = (name, state) => {
        if(ready) {
            let body = $('.body');

            // append elements
            body.append(signTemplate.replace("{text}", name + " " + state));
            body.scrollTop($('.body')[0].scrollHeight);
        }
    };

    socket.on('user join', (name) => sign(name, "Entrou"));
    socket.on('user disconnect', (name) => sign(name, "Saiu"));
    socket.on('user msg', (user, msg) => {
        if (ready) {

            let
            time = new Date(),
            pMsgTime = time.getMinutes() < 10 
            ? setTime(":0", time)
            : setTime(":", time);

            $('.body').append(msgTemplateOther
                .replace("{text}", msg)
                .replace("{user}", user)
                .replace("{time}", pMsgTime.split(/\s/)[1]));
        }
    });

    socket.on('user typing', (user) => {
        if (ready) {
            $('.user-typing').text(user + " está digitando...");
            $('.form-message>input').addClass("typing");
        }
    });

    socket.on('user deleting', () => {
        if (ready) {
            $('.user-typing').text("");
            $('.form-message>input').removeClass("typing");
        }
    });

    const
    userList = $('.sidebar-body-users'),
    userLen = $('.header-status');

    socket.on('users update', (users) => {
        if (ready) {
            let i = 0;

            userList.text("");

            for (user in users) {
                updateUsers(users[user]);
                i++;
            }

            let toWrite = i == 1 ? i + ' usuário' :i + ' usuários';

            userLen.text(toWrite);
        }
    });

    const updateUsers = (user) => {
        let pUser = `<p>${user}</p>`;

        userList.append(pUser);
    }
})();