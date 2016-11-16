(function (window) {
    var Contrxx = window.Contrxx = {};

    var randomString = Math.random().toString(36).slice(-8);
    var videoChatPage = document.querySelector('#videoChatPage');
    var createRoomPage = document.querySelector('#createRoomPage');
    var linkToShare = document.querySelector('#link-to-share');

    linkToShare.innerHTML = window.location.href;

    if (window.location.pathname !== '/') {
        videoChatPage.style.display = 'block';
        createRoomPage.style.display = 'none';
    } else {
        videoChatPage.style.display = 'none';
        createRoomPage.style.display = 'block';
    }

    Contrxx.createRoom = function () {
        window.location.href = '/' + randomString;
    };

    Contrxx.totalTime = new Timer({
        el: document.querySelector('#video-chat-time')
    });

    Contrxx.limitedTime = new Timer({
        timeLimit: 20,
        el: document.querySelector('#video-chat-time-limit')
    });

    new CopyToClipboard({
        el: document.querySelector('.link')
    });

})(window);
