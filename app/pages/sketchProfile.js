import React from 'react';
import {Actions} from 'react-native-router-flux';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { Dimensions } from 'react-native'
import Image from 'react-native-scalable-image';
import { DotIndicator} from 'react-native-indicators';

export default class Singup extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("name", "==", this.props.sname).where("from","==",this.props.email);
  state = {
    isLoading: true,
    isEmpty:true,
    predicted_image: ''
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
	render(){
    const animating = this.state.isLoading;
    const empty = this.state.isEmpty;
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
      if(doc.data().num_predictions==0){
        this.setState({
          isLoading: false
        });
      }
        if(predicted_img !=""){
          this.setState({
            predicted_image: predicted_img,
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