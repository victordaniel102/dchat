var socket = io();
var ready = false;

const form = document.querySelector('.form-username');
const formMessage = document.querySelector('.form-message');
const modal = document.querySelector('.modal');
const headerUsername = document.querySelector('.header-username');
const headerTime = document.querySelector('.header-time');
const bodyMessages = document.querySelector('.body');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    var name = form.username.value;
    var time = new Date();

    headerUsername.textContent = name;
    if (time.getMinutes() < 10) headerTime.textContent = "Entrada: " + time.getHours() + ":0" + time.getMinutes();
    else headerTime.textContent = "Entrada: " + time.getHours() + ":" + time.getMinutes();

    modal.style.display = "none";
    ready = true;
    socket.emit("join", name);
})

formMessage.addEventListener('submit', function(e) {
    e.preventDefault()

    var msg = formMessage.txtMsg.value;
    if (msg.length != 0) {
        formMessage.txtMsg.value = "";

        let msgContainerOwn = document.createElement('div');
        let msgOwn = document.createElement('div');
        let pMsgText = document.createElement('p');

        msgContainerOwn.className = "msg-container own";
        msgOwn.className = "msg own";
        pMsgText.className = "msg-text";
        pMsgText.textContent = msg;

        msgOwn.appendChild(pMsgText);
        msgContainerOwn.appendChild(msgOwn);
        bodyMessages.appendChild(msgContainerOwn);
        $('.body').scrollTop($('.body')[0].scrollHeight);

        socket.emit('send', msg);
    }
})

socket.on('join', (name) => {
    if (ready) {
        let divSpanAlert = document.createElement('div');
        divSpanAlert.className = 'span-alert';

        let pSpanAlert = document.createElement('p');
        pSpanAlert.textContent = name + ' entrou';

        divSpanAlert.appendChild(pSpanAlert);
        bodyMessages.appendChild(divSpanAlert);
        $('.body').scrollTop($('.body')[0].scrollHeight);
    }
})

socket.on('logout', (name) => {
    if (ready) {
        let divSpanAlert = document.createElement('div');
        divSpanAlert.className = 'span-alert';

        let pSpanAlert = document.createElement('p');
        pSpanAlert.textContent = name + ' saiu';

        divSpanAlert.appendChild(pSpanAlert);
        bodyMessages.appendChild(divSpanAlert);
        $('.body').scrollTop($('.body')[0].scrollHeight);
    }
})


socket.on('msg', (user, msg) => {
    if (ready) {
        var time = new Date();

        let msgContainernOwn = document.createElement('div');
        let msgnOwn = document.createElement('div');
        let msgInfo = document.createElement('div');
        let pMsgText = document.createElement('p');
        let pMsgUser = document.createElement('p');
        let pMsgTime = document.createElement('p');

        msgContainernOwn.className = "msg-container nown";
        msgInfo.className = "msg-info";
        msgnOwn.className = "msg nown";
        pMsgUser.className = "msg-user";
        pMsgUser.textContent = user;
        pMsgTime.className = "msg-time";

        if (time.getMinutes() < 10) pMsgTime.textContent = time.getHours() + ":0" + time.getMinutes();
        else pMsgTime.textContent = time.getHours() + ":" + time.getMinutes();
        
        pMsgText.className = "msg-text";
        pMsgText.textContent = msg;

        msgInfo.appendChild(pMsgUser);
        msgInfo.appendChild(pMsgTime);

        msgnOwn.appendChild(msgInfo)
        msgnOwn.appendChild(pMsgText);

        msgContainernOwn.appendChild(msgnOwn);
        bodyMessages.appendChild(msgContainernOwn);

        $('.body').scrollTop($('.body')[0].scrollHeight);
    }
})