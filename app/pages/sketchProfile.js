import React from 'react';
import {Actions} from 'react-native-router-flux';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Dimensions } from 'react-native'
import Image from 'react-native-scalable-image';
import { DotIndicator} from 'react-native-indicators';
import * as firebase from 'firebase';

export default class Singup extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("name", "==", this.props.sname).where("from","==",this.props.email);
  state = {
    isLoading: true,
    isEmpty:true,
    predicted_image: '',
    codeUrl: ''
  }
  componentDidMount(){
    unsubscribe = this.ref.onSnapshot(this.onImageLoad);
  }
  componentWillUnmount() {
    unsubscribe= null;
  }
  displayLayout=()=>{
    let sname=this.props.sname;
    let email = this.props.email;
    Actions.displayLayout({email:email,sname:sname});
  }
  downloadFile=()=>{
    // Linking.openURL(this.state.codeUrl);
    const ref = firebase.storage().ref().child(this.props.email + "/" + this.props.sname +"-code.js");
    let options = {
        "arrowParens": "avoid",
        "bracketSpacing": true,
        "htmlWhitespaceSensitivity": "css",
        "insertPragma": false,
        "jsxBracketSameLine": false,
        "jsxSingleQuote": false,
        "parser": "babel",
        "printWidth": 80,
        "proseWrap": "preserve",
        "requirePragma": false,
        "semi": true,
        "singleQuote": false,
        "tabWidth": 2,
        "trailingComma": "none",
        "useTabs": false 
    }
    ref.getDownloadURL().then(function(data) {
      // `url` is the download URL for 'images/stars.jpg'
      fetch(data)
      .then(function(response) {
        response.text().then(function(text) {
          console.log(text);
          
        });
      });
    }).catch(function(error) {
      // Handle any errors
    });
  }
	render(){
    const animating = this.state.isLoading;
    const empty = this.state.isEmpty;
    const codeUrl = this.state.codeUrl;
		return(
			<View style={styles.container}>
             {animating ? (
            <View style={styles.container}>
                <DotIndicator color='#66BB6A' />
            </View>
            ) : (
              <View style={styles.container}>
               {empty ? (
                  <View style={styles.container}>
                  <Text>No predictions found</Text>
                  </View>
               ):(
                <View style={styles.container}>
                    <Text > Sketch: {this.props.sname.replace(/_/g, " ")}</Text>
                    <Image
                    width={Dimensions.get('window').width} // height will be calculated automatically
                    source={{uri: this.state.predicted_image}}
                    /> 
                    <Text >{this.state.imageStatus}</Text> 
                    <TouchableOpacity style={styles.button} onPress={this.displayLayout}>
                      <Text style={styles.buttonText}>Preview Layout</Text>
                    </TouchableOpacity> 
                    {
                      codeUrl !== undefined ? (
                      <TouchableOpacity style={styles.button} onPress={this.downloadFile}>
                        <Text style={styles.buttonText}>Download code</Text>
                      </TouchableOpacity> 
                      ):(
                        <Text>No code available</Text>
                      )
                    }
                </View>
              )}
              </View>

             )}
  			</View>
			);
  }
  onImageLoad = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const predicted_img = doc.data().predicted_url;
      const code_url = doc.data().code_url;
      console.log("code_url: " + code_url);
      if(doc.data().num_predictions==0){
        this.setState({
          isLoading: false
        });
      }
        if(predicted_img !=""){
          this.setState({
            predicted_image: predicted_img,
            codeUrl: code_url,
            isLoading: false,
            isEmpty: false
          });
        
        }
    });   
  }
}

const styles = StyleSheet.create({
  container : {
    backgroundColor: '#FAFAFA',
    flex: 1,
    justifyContent:'center',
    alignItems: 'center'
  },
  button: {
    width:300,
    backgroundColor:'#66BB6A',
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 13
  },
  buttonText: {
    fontSize:18,
    fontWeight:'500',
    color:'#ffffff',
    textAlign:'center'
  },
  lottie: {
    width: 250,
    height: 300
  }
  
});