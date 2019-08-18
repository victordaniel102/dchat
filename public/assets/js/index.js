(async () => {
    var 
    socket = io(),
    ready = false;

    let 
    typing = false,
    typingTimer;

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

        if(msg.trim()) {

            msg = linkify(msg)

            $('.body').append(msgTemplate.replace("{msg}", msg));
            $('.body').scrollTop($('.body')[0].scrollHeight);

            // socket
            socket.emit("msg", msg);

            typing = false;
            socket.emit('stopping typing');

            e_msg.val("");
        }
    });

    $('.form-message').keydown(key => {
        if(ready && key.keyCode != "13") { input(); }
    });

    const input = () => {
        if (!typing) {
            typing = true;
            socket.emit('typing');
        }
        if (typingTimer) {
            clearTimeout(typingTimer);
            typingTimer = null;
        }
        typingTimer = setTimeout(() => {
            typing = false;
            socket.emit('stopping typing');
        }, 1000);
    }

    const sign = (name, state) => {
        if(ready) {
            let body = $('.body');

            // append elements
            body.append(signTemplate.replace("{text}", name + " " + state));
            body.scrollTop($('.body')[0].scrollHeight);
        }
    };

    socket.on('user join', (name) => sign(name, "entrou"));
    socket.on('user disconnect', (name) => sign(name, "saiu"));
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

            $('.body').scrollTop($('.body')[0].scrollHeight);

        }
    });

    socket.on('user typing', (user) => {
        if (ready) {
            $('.user-typing').text(user + " está digitando...");
            $('.form-message>input').addClass("typing");
        }
    });

    socket.on('user stopped typing', () => {
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

    const linkify = (text) => {
        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, function(url) {
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        });
    }
})();