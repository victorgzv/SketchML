import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  Alert
} from 'react-native';
import { List,ListItem } from "react-native-elements";
import { Actions } from 'react-native-router-flux';
import * as firebase from 'firebase';

export default class displaySketches extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("from","==",this.props.email);
  state = {
    sname:'',
    sketches: [],
    isEmpty: false
  };
  newSkecth = () =>{
    let email = this.props.email;
    Actions.sketch({email:email});
  }
  componentDidMount(){
    // this._fetchNormalData();
    unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }
  componentWillUnmount() {
    unsubscribe= null;
  }
  showDetails = (name,email) =>{
    Actions.sketchProfile({sname:name,email:email});
  }
  //Function that gets the sketch's name and stores it on the state so it is accesible.
  getSketchName(name){
    this.setState({
      sname: name
    });
  }
  //Function that combines a call to other 2 functions
  combinedFunction(name){
    this.getSketchName(name);
   //Alert modal that makes sure that the user wants to remove a sketch
    Alert.alert(
      'Remove '+ this.state.sname.replace(/_/g, " "),
      'Are you sure you want to delete this sketch?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.removeSkecth()},
      ],
      {cancelable: false},
    );
  }
  //Function that removes a sketch from the database and their corresponding images from cloud storage
  removeSkecth = async () =>{
    //References to the images stored in cloud storage
    const originalImage = firebase.storage().ref().child(this.props.email+"/" + this.state.sname);
    const predictedImage = firebase.storage().ref().child(this.props.email+"/" + this.state.sname +"-predicted");
    const codeFile = firebase.storage().ref().child(this.props.email+"/" + this.state.sname +"-code.js");
    //Call to db to get documents matching name and user
    this.props.db.collection("sketches")
    .where("name","==",this.state.sname).where("from","==",this.props.email)
    .get()
        .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                console.log(querySnapshot.size); 
                if(querySnapshot.size >0){
                  //delete sketch
                  console.log("Doc: " + doc.id);
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
        });;
        //Delete original and predicted image from cloud storage
        //Dowloadurl to find out if the image url still exists before downloading
        await originalImage.getDownloadURL().then(function(url) {
         if(url!=""){
          originalImage.delete().then(function() {
            console.log("Original Object successfully deleted!");
          }).catch(function(error) {
            console.error("Error removing object: ", error);
          });
         }
        });

        await predictedImage.getDownloadURL().then(function(url) {
          if(url!=""){
           predictedImage.delete().then(function() {
             console.log("Predicted Object successfully deleted!");
           }).catch(function(error) {
             console.error("Error removing object: ", error);
           });
          }
         });

         await codeFile.getDownloadURL().then(function(url) {
          if(url!=""){
            codeFile.delete().then(function() {
             console.log("Code File successfully deleted!");
           }).catch(function(error) {
             console.error("Error removing object: ", error);
           });
          }
         });
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };
    
	render(){
    const empty = this.state.isEmpty
		return(
			<View style={styles.container}>
        {empty ? (
         	<View style={styles.img_container}>
              <Image 
                    style={styles.no_results}
                    source={require('../assets/no_results_found.png')} 
              />
              <TouchableOpacity style={styles.button} onPress={this.newSkecth}>
                  <Text style={styles.buttonText}>Create Sketch</Text>
              </TouchableOpacity> 
         	</View>
        ) : (
     
          <List style={styles.list} containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 ,marginTop: 0}}>
          
            <FlatList 
              data={this.state.sketches}
              ItemSeparatorComponent={this.renderSeparator}
              renderItem={({ item }) => (
              
                <ListItem 
                  style={styles.listItem}
                  button onPress={() => {this.showDetails(item.name,this.props.email)}}
                  onLongPress={() => {this.combinedFunction(item.name)}}
                  roundAvatar
                  title={`${item.name.replace(/_/g, " ")}`}
                  avatar={{ uri: item.original_img }}
                  containerStyle={{ borderBottomWidth: 0 }}
                
                />
              )}
              
            />
          </List>
    
        )}
  		</View>
			)
  }
  onCollectionUpdate = (querySnapshot) => {
    const sketches = [];
    if(querySnapshot.size === 0){
      this.setState({
        isEmpty: true
      });
    }
    querySnapshot.forEach((doc) => {
      const name = doc.data().name;
      const original_img = doc.data().image_url;
      console.log("name: "+ name  );
      
      if(querySnapshot.size >0){
        this.setState({
          isEmpty: false
        });
      }else{
        this.setState({
          isEmpty: true
        });
      }
      sketches.push({
        key: doc.id, // Document ID
        name,
        original_img
      });
    });
    let a = this.state.sketches.slice(); //creates the clone of the state
    a = sketches;
    this.setState({
      sketches: a
    });
  }
}


const styles = StyleSheet.create({
  container : {
    backgroundColor: '#FAFAFA',
    flex: 1
  },
  img_container: {
    backgroundColor: '#fbfcfc',
    justifyContent: 'center',
    flexGrow: 1,
    alignItems: 'center'
  },
  no_results:{
    width:250,
    height:250,
    borderWidth: 1,
    borderRadius: 75
  },
  list:{
    backgroundColor: '#9ACD32'
  }, 
  button: {
    width:300,
    backgroundColor:'#66BB6A',
    borderRadius: 25,
    paddingVertical: 12,
    marginVertical: 10
  },
  buttonText: {
    fontSize:18,
    fontWeight:'500',
    color:'#ffffff',
    textAlign:'center'
  },
  listItem:{
    backgroundColor: '#9ACD32'
  }
});