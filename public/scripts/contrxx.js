(function (window) {
    var Contrxx = window.Contrxx = {};

    var randomString = Math.random().toString(36).slice(-8);
    var videoChatPage = document.querySelector('#videoChatPage');
    var createRoomPage = document.querySelector('#createRoomPage');

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

    Contrxx.timeManager = new Timer({
        el: document.querySelector('#video-chat-time')
    });

})(window);
