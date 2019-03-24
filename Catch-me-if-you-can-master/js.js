let uluru, map, marker;
let ws
let players = {}
let nick = '1'

let bots = [];
var moveBotsInt
var botsCount = 50;

function initMap() {
    uluru = { lat: -25.363, lng: 131.044 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: uluru,
        keyboardShortcuts: false
    });

    var icon = {
        url: "me.png", // url
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    marker = new google.maps.Marker({
        position: uluru,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: icon
    });

    getLocalization()
    startWebSocket()
    addKeyboardEvents()
}

function addKeyboardEvents() {
    window.addEventListener('keydown', poruszMarkerem)
}

function poruszMarkerem(ev) {
    let lat = marker.getPosition().lat()
    let lng = marker.getPosition().lng()

    switch (ev.code) {
        case 'ArrowUp':
            lat += 0.01
            break;
        case 'ArrowDown':
            lat -= 0.01
            break;
        case 'ArrowLeft':
            lng -= 0.01
            break;
        case 'ArrowRight':
            lng += 0.01
            break;
    }
    let position = {
        lat,
        lng
    }
    let wsData = {
        lat: lat,
        lng: lng,
        id: nick
    }
    marker.setPosition(position)
    ws.send(JSON.stringify(wsData))
}

function startWebSocket() {
    let url = 'ws://91.121.6.192:8010'
    ws = new WebSocket(url)
    ws.addEventListener('open', onWSOpen)
    ws.addEventListener('message', onWSMessage)
}

function onWSOpen(data) {
    console.log(data)
}

function onWSMessage(e) {
    let data = JSON.parse(e.data)

    if (!players['user' + data.id]) {
        players['user' + data.id] = new google.maps.Marker({
            position: { lat: data.lat, lng: data.lng },
            map: map,
            animation: google.maps.Animation.DROP
        })
    } else {
        players['user' + data.id].setPosition({
            lat: data.lat,
            lng: data.lng
        })
    }
}

function getLocalization() {
    navigator.geolocation.getCurrentPosition(geoOk, geoFail)
}

function geoOk(data) {
    let coords = {
        lat: data.coords.latitude,
        lng: data.coords.longitude
    }
    map.setCenter(coords)
    marker.setPosition(coords)

    createBots(coords);
}

function geoFail(err) {
    console.log(err);
    let lat = marker.getPosition().lat()
    let lng = marker.getPosition().lng()
    let coords = {
        lat: lat,
        lng: lng
    }
    createBots(coords);
}

function createBots(coords) {
    for (let i = 0; i < botsCount; i++) {
        var botCords = {
            lat: coords.lat + (Math.random() > 0.5 ? -1 : 1) * (Math.random() * (i + 1)),
            lng: coords.lng + (Math.random() > 0.5 ? -1 : 1) * (Math.random() * (i + 1))
        }
        var icon = {
            url: "enemy.png", // url
            scaledSize: new google.maps.Size(50, 50), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };
        let bot = new google.maps.Marker({
            position: botCords,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icon
        });
        bots.push(bot);
    }

}

function moveBots() {
    let markerLat = marker.getPosition().lat();
    let markerLng = marker.getPosition().lng();
    bots.forEach(bot => {
        var coords = {
            lat: bot.getPosition().lat(),
            lng: bot.getPosition().lng()
        };
        var botCords = {
            lat: coords.lat + (coords.lat >= markerLat ? -1 : 1) * 0.008,
            lng: coords.lng + (coords.lng >= markerLng ? -1 : 1) * 0.008
        }
        bot.setPosition(botCords);
        gameOwerCheck(botCords);
    });
}

function gameOwerCheck(botCords) {
    let markerLat = marker.getPosition().lat();
    let markerLng = marker.getPosition().lng();

    if (Math.abs(markerLat - botCords.lat) < 0.01 && Math.abs(markerLng - botCords.lng) < 0.01) {
        $('#game-menu').show();
        $('#game-ower').show();
        clearInterval(moveBotsInt);
    }
}

function startGame() {
    $('#timer').html("5");
    $('#game-ower').hide();
    var timerInt = setInterval(() => {
        var value = $('#timer').html();
        value--;
        $('#timer').html(value);
    }, 1000);

    setTimeout(() => {
        moveBotsInt = setInterval(() => {
            moveBots();
        }, 50);
        $('#game-menu').hide();
        $('#timer-container').hide();
        clearInterval(timerInt);
    }, 5000);
    $('#timer-container').show();
}