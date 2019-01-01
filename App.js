/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StatusBar,ImageBackground, StyleSheet, Text, View,TouchableHighlight,TouchableOpacity,TouchableWithoutFeedback,Image} from 'react-native';

import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
let ws;



type Props = {};
export default class App extends Component<Props> {

  constructor(props){
    super(props);
    this.state = {
      id:null,
      image:null,
      title:null,
      status:true,
      count:0,
      artis:null
    }
    this.sendHeartbeat = null;
    this.websocketConnection();
    this.onPlay = this.onPlay.bind(this);
    this.onStop = this.onStop.bind(this);

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
        this.setState({
          id:data.song.id,
          image:data.song.albums[0].image,
          title:data.song.albums[0].name,
          artis:data.song.artists[0].name
        })
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

  onPlay =async () =>{
    await TrackPlayer.add({
      id:this.state.id,
      artist:this.state.artis,
      type:'kha',
      url:'https://listen.moe/stream',
      artwork:`https://cdn.listen.moe/covers/${this.state.image}`,
      title:`${this.state.title}`
    })
    await TrackPlayer.play();
    this.setState({
      status:false
    })

  }

  onStop = async () =>{
    await TrackPlayer.stop();
    await TrackPlayer.destroy();
    this.setState({
      status:true
    })
  }



  render() {
    return (
      <View style={{flex:1}}>
          <StatusBar hidden={true}/>
          <ImageBackground source={{uri:`https://cdn.listen.moe/covers/${this.state.image}`}} style={{height:'100%',width:'100%'}}/>
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            flexDirection:'row-reverse',
            alignContent: 'center',
          }}>
            
            <View style={{flex:1,maxWidth:60}}>
              <Image source={{uri:`https://cdn.listen.moe/covers/${this.state.image}`}} style={{height:60,width:60}} />
            </View>
            <View style={{flex:1,backgroundColor:'red',height:60}}>
              <View style={{alignItems:'center',paddingTop:5}}>
                <Text numberOfLines={1} style={{fontSize:14,fontWeight:'bold'}}>{this.state.artis}</Text>
                <Text numberOfLines={1} style={{fontSize:20,fontWeight:'bold'}}>{this.state.title}</Text>
              </View>
            </View>
            <View style={{flex:1,maxWidth:50,height:60,alignItems:'center',backgroundColor:'black'}}>
            {this.state.status ?
              <TouchableOpacity onPress={() => this.onPlay()}>
              <Icon style={{paddingLeft:5,paddingTop:10}} name="md-play" size={40} color="#900" />
              </TouchableOpacity>
              :<TouchableOpacity style={{color:'blue'}} onPress={() => this.onStop()}>
              <Icon style={{paddingLeft:5,paddingTop:10}} name="md-pause" size={40} color="#900" />
              </TouchableOpacity>
            }
            </View>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  image:{
    height:'100%',
    width:'100%'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  progress: {
    height: 1,
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
  },
});

