var localVideo;
var remoteVideo;
var peerConnection;
var localStream;
var userId = (Math.random(0, 1) * 1000000).toFixed().toString();
var peerConnectionConfig;

var MESSAGE_TYPE_SDP = 'sdp';
var MESSAGE_TYPE_ICE = 'ice';
var MESSAGE_TYPE_ONLINE = 'online';
var MESSAGE_TYPE_ONLINE_CONFIRM = 'onlineConfirm';
var MESSAGE_TYPE_OFFLINE = 'offline';

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var room = location.pathname;

var searchParams = new URLSearchParams();
searchParams.set('ident', 'yeliseev');
searchParams.set('secret', '46b999b0-a677-11e6-87ad-a75b3d35d1e1');
searchParams.set('domain', 'webrtc-proto');
searchParams.set('application', 'test');
searchParams.set('room', 'test');
searchParams.set('secure', '1');

fetch("https://service.xirsys.com/ice", {
  method: "POST",
  body: searchParams
})
.then(function(response) {
    return response.json();
})
.then(function(response) {
    console.log(response);
    peerConnectionConfig = response.d;
    pageReady();
});

function pageReady() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    serverConnection = new WebSocket('wss://webrtc-proto-server.herokuapp.com/');
    serverConnection.onmessage = gotMessageFromServer;
    serverConnection.onopen = function() {
        serverMessage(MESSAGE_TYPE_ONLINE);
    }
    serverConnection.onclosed = function() {
        serverMessage(MESSAGE_TYPE_OFFLINE);
    }

    var constraints = {
        video: true,
        audio: true,
    };

    if(navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    if(isCaller) {
        peerConnection.createOffer(gotDescription, errorHandler);
    }
}

function gotMessageFromServer(message) {
    if(!peerConnection && localStream) start(false);

    var signal = JSON.parse(message.data);

    // ignore our own messages and messages from other roooms
    console.log(signal);
    if (signal.userId === userId || signal.room !== room) {
        return;
    }

    console.log('message', message);

    switch (signal.type) {
        case MESSAGE_TYPE_SDP:
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.contents.description), function() {
                peerConnection.createAnswer(gotDescription, errorHandler);
            }, errorHandler);

            break;
        case MESSAGE_TYPE_ICE:
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.contents.candidate));
            
            break;
        case MESSAGE_TYPE_ONLINE:
            enableCall();
            serverMessage(MESSAGE_TYPE_ONLINE_CONFIRM);
            
            break;
        case MESSAGE_TYPE_ONLINE_CONFIRM:
            enableCall();
            
            break;
        case MESSAGE_TYPE_OFFLINE:
            disableCall();
            
            break;
    }
}

function gotIceCandidate(event) {
    if(event.candidate != null) {
        serverMessage(MESSAGE_TYPE_ICE, {
            candidate: event.candidate
        });
    }
}

function gotDescription(description) {
    console.log('got description', description);
    peerConnection.setLocalDescription(description, function () {
        serverMessage(MESSAGE_TYPE_SDP, {
            description: description
        });
    }, function() {console.log('set description error')});
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function errorHandler(error) {
    console.log(error);
}

function serverMessage(type, contents) {
    serverConnection.send(JSON.stringify({
        type: type,
        userId: userId,
        room: room,
        contents: contents
    }));
}

function enableCall() {
    document.querySelector('#waiting').style.display = 'none';
    document.querySelector('#start').style.display = 'inline';
}

function disableCall() {
    document.querySelector('#waiting').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
    remoteVideo.src = '';
}

window.onbeforeunload = function() {
    serverMessage(MESSAGE_TYPE_OFFLINE);
}