import React, { Component } from 'react';
import {Actions} from 'react-native-router-flux';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  BackHandler
} from 'react-native';
export default class Sketch extends React.Component {
  state = {
    name: '',
    message:''
  }
  componentDidMount(){
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack(); // works best when the goBack is async
      return true;
    });
  }
  async goBack(){
    let email = this.props.email;
    await Actions.listSketches({email:email});
  }
  createSketch = () =>{
    let name = this.state.name;
    name = name.replace(/ /g,"_");
    let email = this.props.email;
    if(name !== "" ){
      const userRef = this.props.db.collection("sketches").add({
        name: name,
        from: email,
        image_url:'',
        predicted_url:''
      }); 
      Actions.landing({email:email,sname:name})
      
    }else{
      this.setState({
        message: 'Incomplete fields'
      });
      
    }
  }
  
  
	render(){
		return(
      <KeyboardAvoidingView behaviour="padding" style={styles.container}>
            <View style={styles.formContainer}>
            <Image 
              style={styles.infoImg}
              source={require('../assets/idea.png')} 
            />
            <TextInput style={styles.inputBox} 
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Sketch Name"
                placeholderTextColor = "#9E9E9E"
                selectionColor="#fff"
                onChangeText={(text) => this.setState({name: text})}
                />
              <Text style={styles.error_message}> {this.state.message} </Text>
            <TouchableOpacity style={styles.button} onPress={this.createSketch}>
              <Text style={styles.buttonText}>Create Sketch</Text>
            </TouchableOpacity> 
           </View>      
  			</KeyboardAvoidingView>
			)
	}
}

const styles = StyleSheet.create({
  container : {
    backgroundColor: '#FAFAFA',
    flex: 1,
    justifyContent:'center',
    alignItems: 'center', 
  },
  formContainer: {
    justifyContent:'center',
    alignItems: 'center'
  },
  inputBox: {
    width:300,
    backgroundColor:'rgba(194,194,194,0.2)',
    borderRadius: 25,
    paddingHorizontal:16,
    paddingVertical:12,
    fontSize:16,
    color:'#9E9E9E',
    marginVertical: 10
  },
  button: {
    width:300,
    backgroundColor:'#66BB6A',
    borderRadius: 25,
    paddingVertical: 12,
    marginVertical: 10,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.8,
    elevation: 6,
    shadowRadius: 15 ,
    shadowOffset : { width: 1, height: 13}
  },
  buttonText: {
    fontSize:18,
    fontWeight:'500',
    color:'#ffffff',
    textAlign:'center',
    fontFamily: 'Roboto'
  },
  error_message:{
    color:'#C20000',
  },
  infoImg:{
    width:150,
    height:150,
    margin: 30
  }
});