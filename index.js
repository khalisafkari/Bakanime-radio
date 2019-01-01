/** @format */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';

TrackPlayer.setupPlayer().then(()=>{});

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(()=> require('./service'))
