import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import {Router,Stack,Scene} from 'react-native-router-flux';
import Login from './pages/login';
import Singup from './pages/singup';
import Landing from './pages/landing';
import Sketch from './pages/Sketch';
import ListSketches from './pages/displaySketches1';
import SketchProfile from './pages/sketchProfile';
import DisplayLayout from './pages/displayLayout';
import DisplaySourceCode from './pages/displaySourceCode';
import * as firebase from 'firebase';
import 'firebase/firestore';
import {config,settings} from './FirebaseConfig'; 
import {Font} from 'expo';


firebase.initializeApp(config);
const firestore = firebase.firestore();
firestore.settings(settings);
export default class Routes extends React.Component {
    
		state={
            fontLoaded:false
        }
	
	async componentDidMount(){
		await Font.loadAsync({
			'System-code': require('./assets/fonts/code-regular.ttf')
		});
		this.setState({fontLoaded:true})
	}
    render(){
        return(
            <Router navigationBarStyle={styles.navBar} titleStyle={styles.navTitle} sceneStyle={styles.routerScene} hideNavBar={false}>
                <Stack key="root">
                    <Scene key="login" component={Login} db ={firestore} fontLoaded= {this.state.fontLoaded} title="Login" hideNavBar={true}/>
                    <Scene key="signup" component={Singup} db ={firestore} fontLoaded= {this.state.fontLoaded} title="Register" hideNavBar={true}/>
                    <Scene key="sketch" component={Sketch} db ={firestore} title="Sketch" hideNavBar={true}/>
                    <Scene key="listSketches" component={ListSketches} db ={firestore} title="Sketches" />
                    <Scene key="landing" component={Landing} db ={firestore} hideNavBar={false} />
                    <Scene key="sketchProfile" component={SketchProfile} db ={firestore} title="Results" />
                    <Scene key="displayLayout" component={DisplayLayout} db ={firestore} title="Layout" />
                    <Scene key="displaySourceCode" component={DisplaySourceCode} db ={firestore} title="Source Code"/>
                </Stack>
            </Router>
        )
    }
    
}
const styles = StyleSheet.create({
  navbar: {
     backgroundColor: 'red', // changing navbar color
  },
  navTitle: {
    width: 150,
    fontFamily: 'Roboto'
  },
  routerScene: {
      marginTop:0
  }
 
 })
