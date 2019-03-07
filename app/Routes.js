import React, { Component } from 'react';
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
            <Router >
                <Stack key="root" hideNavBar={true}>
                    <Scene key="login" component={Login} db ={firestore} title="Login" />
                    <Scene key="signup" component={Singup} db ={firestore} title="Register"/>
                    <Scene key="sketch" component={Sketch} db ={firestore} title="Sketch"/>
                    <Scene key="listSketches" component={ListSketches} db ={firestore} title="Sketches" hideNavBar={true}/>
                    <Scene key="landing" component={Landing} db ={firestore} hideNavBar={false} />
                    <Scene key="sketchProfile" component={SketchProfile} db ={firestore} title="sketchProfile" />
                    <Scene key="displayLayout" component={DisplayLayout} db ={firestore} title="displayLayout" />
                    <Scene key="displaySourceCode" component={DisplaySourceCode} db ={firestore} title="displaySourceCode" />
                </Stack>
            </Router>
        )
    }
    
}

