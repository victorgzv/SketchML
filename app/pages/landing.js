import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import {ImagePicker, Permissions} from 'expo';
import * as firebase from 'firebase';
import {Actions} from 'react-native-router-flux';


export default class Landing extends React.Component {
  state = {
    image: null,
    uri:'',
    url:'',
    uploading: false
  };
    takePicture = async () => {
      await Permissions.askAsync(Permissions.CAMERA);
      await Permissions.askAsync(Permissions.CAMERA_ROLL);

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
      this._handleImagePicked(result);
    };
    chooseFromGallery = async () => {
      await Permissions.askAsync(Permissions.CAMERA);
      await Permissions.askAsync(Permissions.CAMERA_ROLL);

      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
      this._handleImagePicked(result);
    };
    addurl = () =>{
      const image_url=this.state.url;
      const dbref=this.props.db.collection("sketches");
      dbref
      .where("name", "==", this.props.sname)
      .where("from", "==", this.props.email)
      .get()
      .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                console.log(querySnapshot.size); 
                if(querySnapshot.size >0){
                  console.log(doc.id, " => ", doc.data());
                  dbref.doc(doc.id).update({image_url: image_url})
                }   
              }.bind(this));
        })
        .catch(function(error) {
            console.log("Error getting documents:", error);
        });
    }
    _handleImagePicked = async pickerResult => {
      try {
        this.setState({ uploading: true });
        if (!pickerResult.cancelled) {
          await uploadImageAsync(pickerResult.uri,this.props.email,this.props.sname);
          const ref = firebase.storage().ref().child(this.props.email + "/" + this.props.sname);
          await ref.getDownloadURL().then(function(url) {
            console.log("url: " + url);
            this.setState({url:url});
            this.addurl();
          }.bind(this)) ;
          
          await Actions.listSketches({email:this.props.email});
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.setState({ uploading: false });
      }
      
    }
 
	render(){
    const isLoading = this.state.uploading;
		return(
			<View style={styles.container}>
                 {isLoading ? (
                   	<View style={styles.container}>
                      <ActivityIndicator size="large" color="#66BB6A" />
                    </View>
                ) : (
                <View style={styles.container}>
                    <TouchableOpacity style={styles.button} onPress={this.takePicture}>
                      <Text style={styles.buttonText}>Take picture</Text>
                    </TouchableOpacity> 
                    <TouchableOpacity style={styles.button} onPress={this.chooseFromGallery}>
                      <Text style={styles.buttonText}>Upload picture</Text>
                    </TouchableOpacity> 
                </View>
                 )}
  			</View>
			)
	}
}
async function uploadImageAsync(uri,email,sname) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
  const ref = firebase.storage().ref().child(email+"/" + sname);
  
  const snapshot = await ref.put(blob).then(function(snapshot) {
    console.log('Uploaded an image called: '+ email+"/" + sname);
    Alert.alert('Upload image','Image uploaded successfully');
    
  });
   
  // We're done with the blob, close and release it
  blob.close();
 
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
});