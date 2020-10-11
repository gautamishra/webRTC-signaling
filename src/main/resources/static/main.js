'use strict'
console.log("laoded");
let peerConnection = '';
const val = Math.floor(1000 + Math.random() * 9000);

console.log(val);
let dataChannel;
let connection = new WebSocket("wss://webrtc-sanketan.herokuapp.com/socket");
const remoteStream = new MediaStream();
document.getElementById("remoteVid").hidden = true;

const idEle = document.getElementById('uid');
idEle.innerHTML = val;
connection.onopen = () => {
    console.log("connected to the server");
}

connection.onmessage = (message) => {
    let payload = JSON.parse(message.data);
    switch (payload.event) {
        case 'candidate':
            console.log(" get candidiate");
            setRemoteIceCoandidate(payload.data);

            break;

        case 'offer':
            console.log("get offer");
            setRemoteOfferAndCreatAnswer(payload.data);
            break;

        case 'answer':
            console.log("answer");
            handleAnswer(payload.data)
            break;
    }
}

function sendMessage(message) {
    connection.send(JSON.stringify(message));
}

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
peerConnection = new RTCPeerConnection({
    reliable: true
});


// DATA chaneel configurations 

let handleDataChannelOpen = function (event) {
    dataChannel.send("Hello World!");
}

let handleDataChannelMessageReceived = function (event) {
    console.log("dataChannel.OnMessage:", event);
};

let handleDataChannelError = function (error) {
    console.log("dataChannel.OnError:", error);
};

let handleDataChannelClose = function (event) {
    console.log("dataChannel.OnClose", event);
};

let handleChannelCallback = function (event) {
    dataChannel = event.channel;
    dataChannel.onopen = handleDataChannelOpen;
    dataChannel.onmessage = handleDataChannelMessageReceived;
    dataChannel.onerror = handleDataChannelError;
    dataChannel.onclose = handleDataChannelClose;
}

dataChannel = peerConnection.createDataChannel("dataChannel", {reliable: true});

peerConnection.ondatachannel = handleChannelCallback;


dataChannel.onopen = handleDataChannelOpen;

dataChannel.onmessage = handleDataChannelMessageReceived;

dataChannel.onerror = handleDataChannelError;

dataChannel.onclose = handleDataChannelClose;


function setRemoteIceCoandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    document.getElementById("remoteVid").hidden = false;
}


function setRemoteOfferAndCreatAnswer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection.createAnswer(function (answer) {
        peerConnection.setLocalDescription(answer);
        sendMessage({
            event: "answer",
            data: answer
        });
        seticeCandidate();
    }, function (error) {
        // Handle error here
    });
}


function createOfferAndSend() {
    peerConnection.createOffer(function (offer) {
        console.log(offer);
        sendMessage({
            event: "offer",
            data: offer
        });
        peerConnection.setLocalDescription(offer);
        seticeCandidate();
    }, (err) => {
        console.log(err);
    });
}

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function seticeCandidate() {
    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            console.log(event.candidate);
            sendMessage({
                event: "candidate",
                data: event.candidate
            });
        }
    };
}

function startProcess() {
    createOfferAndSend();
}


function sendDataChannelMessage(msg) {
    switch (dataChannel.readyState) {
        case "connecting":
            console.log("Connection not open; queueing: " + msg);
            // sendQueue.push(msg);
            break;
        case "open":
            console.log("sending" + msg);
            dataChannel.send(msg)
            // sendQueue.forEach((msg) => dataChannel.send(msg));
            break;
        case "closing":
            console.log("Attempted to send message while closing: " + msg);
            break;
        case "closed":
            console.log("Error! Attempt to send while connection closed.");
            break;
    }
}


//  Audio Video Configuration

const constraints = {
    video: true, audio: true
};

async function playVideoFromCamera() {
    try {
        const constraints = {'video': true, 'audio': true, 'echoCancellation': true};
        const localStream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.querySelector('video#localVideo');
        videoElement.srcObject = localStream;
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    } catch (error) {
        console.error('Error opening video camera.', error);
    }
}


peerConnection.ontrack = function (e) {
    console.log("stream added");
    if (!e) {
        return;
    }
    const remoteVideo = document.querySelector('video#remoteVideo');
    remoteVideo.srcObject = remoteStream;
    console.log(remoteStream);
};

peerConnection.addEventListener('track', async (event) => {
    remoteStream.addTrack(event.track, remoteStream);
    console.log(remoteStream);
});