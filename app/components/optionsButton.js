import React, { Component } from 'react';
import {
	StyleSheet,
	View,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import * as firebase from 'firebase';


export default class Logo extends React.Component{
    show = () =>{
        Alert.alert(
            'Remove all your Sketches?',
            'Are you sure you would like to completely remove all your sketches? You can tap and hold a sketch to remove it.',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Yes, remove', onPress: () => this.removeAllSketches()},
            ],
            {cancelable: false},
          );
    }
    removeAllSketches = async () =>{
    //Call to db to get documents matching name and user
    const urls=[];
    console.log("hi");
     this.props.db.collection("sketches")
    .where("from","==",this.props.user)
    .get()
        .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                console.log(querySnapshot.size); 
                if(querySnapshot.size >0){
                  //delete sketch

                  var original= doc.data().name;
                  var num_predictions= doc.data().num_predictions;
                  const originalImage = firebase.storage().ref().child(this.props.user+"/" + original);
                  const predictedImage = firebase.storage().ref().child(this.props.user+"/" + original +"-predicted");
                  const codeFile = firebase.storage().ref().child(this.props.user+"/" + original +"-code.js");
                  
                 
                if(predictedImage!=" " && num_predictions>0){
                    predictedImage.getDownloadURL().then(function(url) {
                    console.log("predicted:" +url);
                    if(url!=""){
                     predictedImage.delete().then(function() {
                       console.log("Predicted Object successfully deleted!");
                     }).catch(function(error) {
                       console.error("Error removing object: ", error);
                     });
                    }
                   });
                }

                if(codeFile!=" " && num_predictions>0){
                    codeFile.getDownloadURL().then(function(url) {
                        console.log("codefile:" +url);
                    if(url!=""){
                      codeFile.delete().then(function() {
                       console.log("Code File successfully deleted!");
                     }).catch(function(error) {
                       console.error("Error removing object: ", error);
                     });
                    }
                   });
                }
                     originalImage.getDownloadURL().then(function(url) {
                    if(url!=""){
                     originalImage.delete().then(function() {
                       console.log("Original Object successfully deleted!");
                     }).catch(function(error) {
                       console.error("Error removing object: ", error);
                     });
                    }
                   });
                
                  doc.ref.delete().then(function() {
                    console.log("Document successfully deleted!");
                  }).catch(function(error) {
                    console.error("Error removing document: ", error);
                  });
                 
                }   
              }.bind(this));
        }.bind(this))
        .catch(function(error) {
            console.log("Error getting documents:", error);
        });
        
        // const [files] = await firebase.storage().ref().child(this.props.user).getDownloadURL();
        // console.log('Files:');
        urls.forEach(file => {
        console.log(file);
        });
    }


	render(){
		return(
            
			<View style={styles.container}>
            <TouchableOpacity onPress={this.show}>
                <Image style={styles.button} source={require('../assets/menu.png')}/>
                </TouchableOpacity>	
			</View>
			)
	}
}

const styles = StyleSheet.create({
  container : {
    flexGrow: 1,
    justifyContent:'center',
	alignItems: 'center',
  },
  button:{
      width:30,
      height: 30,
      margin: 15
  }

});