import TrackPlayer from 'react-native-track-player';
let ws;

class pp {
    constructor() {
		this.sendHeartbeat = null;
        this.websocketConnection();
        this.data = {
            title:null,
            image:null
        }
	}

	heartbeat(websocket, ms) {
		this.sendHeartbeat = setInterval(() => {
			websocket.send(JSON.stringify({ op: 9 }));
		}, ms);
	}

	websocketConnection() {
		if (ws) {
			ws.close();
			ws = null;
		}
		ws = new WebSocket('wss://listen.moe/gateway');
		ws.onopen = () => {
			clearInterval(this.sendHeartbeat);
			ws.send(JSON.stringify({ op: 2}));
		};
		ws.onmessage = message => {
			if (!message.data.length) return;
			try {
                var response = JSON.parse(message.data);
            } catch (error) {
				return;
			}
			if (response.op === 0) return this.heartbeat(ws, response.d.heartbeat);
			if (response.op === 1) {
				if (response.t !== 'TRACK_UPDATE'
				&& response.t !== 'TRACK_UPDATE_REQUEST'
				&& response.t !== 'QUEUE_UPDATE') return;

                const data = response.d;
                TrackPlayer.add({
                    url:'https://listen.moe/stream',
                    title:data.song.albums[0].name,
                    artwork:data.song.albums[0].image
                });
                console.warn(data)
				// Now we do with data as we wish.
			}
		};
		ws.onclose = err => {
			if (err) {
				clearInterval(this.sendHeartbeat);
				if (!err.wasClean) setTimeout(() => this.websocketConnection(), 5000);
			}
			clearInterval(this.sendHeartbeat);
		};
    }
    
    play = () =>{
        TrackPlayer.play()
        console.warn(this.data)
    }
}

const Plyaer = new pp();

export default Plyaer;


