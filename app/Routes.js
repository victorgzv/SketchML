import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import {Router,Stack,Scene} from 'react-native-router-flux';
import Login from './pages/login';
import Singup from './pages/singup';
import Landing from './pages/landing';
import Sketch from './pages/Sketch';
import ListSketches from './pages/displaySketches';
import SketchProfile from './pages/sketchProfile';
import DisplayLayout from './pages/displayLayout';
import DisplaySourceCode from './pages/displaySourceCode';
import * as firebase from 'firebase';
import 'firebase/firestore';
import {config,settings} from './FirebaseConfig'; 


firebase.initializeApp(config);
const firestore = firebase.firestore();
firestore.settings(settings);
export default class Routes extends React.Component {
    render(){
        return(
            <Router navigationBarStyle={styles.navBar} titleStyle={styles.navTitle} sceneStyle={styles.routerScene} hideNavBar={false}>
                <Stack key="root"  >
                    <Scene key="login" component={Login} db ={firestore} title="Login" hideNavBar={true}/>
                    <Scene key="signup" component={Singup} db ={firestore} title="Register" hideNavBar={true}/>
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
    width: 150
  },
  routerScene: {
      marginTop:0
  }
 
 })
