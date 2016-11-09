var localVideo;
var remoteVideo;
var peerConnection;
var localStream;
var userId = (Math.random(0, 1) * 1000000).toFixed().toString();
var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

var MESSAGE_TYPE_SDP = 'sdp';
var MESSAGE_TYPE_ICE = 'ice';
var MESSAGE_TYPE_ONLINE = 'online';
var MESSAGE_TYPE_ONLINE_CONFIRM = 'onlineConfirm';
var MESSAGE_TYPE_OFFLINE = 'offline';

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

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

    // ignore our own messages
    if (signal.userId === userId) {
        return;
    }

    console.log(message);

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