import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Dimensions,
  ScrollView
} from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import { Actions } from 'react-native-router-flux';
import * as firebase from 'firebase';

const resizeComponent = (value,percentage) =>{
  return value - (value * (percentage/100));
}
const Window = {
  Height: Dimensions.get('window').height,
  Width: Dimensions.get('window').width
}
const CardContainerSize = {
  Height: resizeComponent(300,5),
  Width: resizeComponent(Window.Width,50)
}
class Container extends Component {
  render(){
    return(
      <View style={styles.container2}>
        {this.props.children}
      </View>

    );
  }
}
class Card extends Component {
  
  render(){
    return(
      <TouchableOpacity onPress={this.props.onPress} onLongPress={this.props.onLongPress}>
      <View style={styles.cardContainer} >
              <View style={styles.card} onClick={this.props.customClickEvent}>
              {this.props.children}  
              </View>
      </View>
      </TouchableOpacity>
    );
  }
}
export default class displaySketches1 extends React.Component {
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
          <Container>
            <ScrollView>
              <View style={{flexDirection: 'row', flex: 1, flexWrap: 'wrap'}}>
            {
              this.state.sketches.map((item,i) => {
                return(
                  <Card key={i} 
                  onPress={()=>{this.showDetails(item.name,this.props.email)}}
                  onLongPress={() => {this.combinedFunction(item.name)}}>
                     <ImageLoad
                      style={styles.image}
                      loadingStyle={{ size: 'large', color: 'green' }}
                      source={{uri: item.original_img}}
                     />  
                     <Text style={styles.title}>{item.name.replace(/_/g, " ")}</Text>
                  </Card>
                );
               
              })
            }
              
             </View>
            </ScrollView>
            <TouchableOpacity 
                    activeOpacity={0.5} 
                    style={styles.TouchableOpacityStyle}
                    onPress={this.newSkecth}  >
                        <Image source={require('../assets/plus.png')}  style={styles.FloatingButtonStyle} />
            </TouchableOpacity>
          </Container>
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
  container2 : {
    flex:1,
    flexDirection: 'row'
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
    textAlign:'center',
    fontFamily: 'Roboto'
  },
  listItem:{
    backgroundColor: '#9ACD32'
  },
  cardContainer:{
    height: 200,
    width: CardContainerSize.Width,
    justifyContent: 'center',
    alignItems: 'center'

  },
  card: {
    height: resizeComponent(200,5),
    width: resizeComponent(CardContainerSize.Width,5),
    elevantion: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  image:{
    width: resizeComponent(CardContainerSize.Width,6),
    height: 151,
    resizeMode: 'stretch',
    borderRadius: 5
  },
  title:{
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    padding: 10
  },
  TouchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor:'#66BB6A',
    borderRadius: 64,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    elevation: 4 // Android
  },
  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
   
  }
});