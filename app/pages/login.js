import React, { Component } from 'react';
import {Actions} from 'react-native-router-flux';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import Logo from '../components/logo';
export default class Login extends React.Component {
  state = {
    email: '',
    password:'',
    message:''
  }
  loginUser = () =>{
    let email = this.state.email;
    let password= this.state.password;
    if(email !== "" && password !== "" ){
        this.props.db.collection("users")
        .where("email", "==", this.state.email)
        .where("password", "==", this.state.password)
        .get()
        .then(function(querySnapshot) {
              if(querySnapshot.empty == true){
                this.setState({
                  message: 'Incorrect user or password'
                });
              }
              querySnapshot.forEach(function(doc) {
                console.log(querySnapshot.size); 
                if(querySnapshot.size >0){
                  Actions.listSketches({email:email});
                  this.setState({
                    message: ''
                  });      
                }   
              }.bind(this));
        }.bind(this))
        .catch(function(error) {
            console.log("Error getting documents:", error);
        });
    }else{
      this.setState({
        message: 'Incomplete fields'
      });
    }
  }
  signup(){
    Actions.signup()
  }
	render(){
    const fontLoaded= this.props.fontLoaded;
		return(
			<KeyboardAvoidingView behaviour="padding" style={styles.container}>
        {fontLoaded ? (
                   	<Logo width= {150} height={150}></Logo>
                ) : (  
                   <ActivityIndicator size="small" color="#66BB6A" />
                )
        }
        <View style={styles.formContainer}>
          <TextInput style={styles.inputBox} 
              underlineColorAndroid='rgba(0,0,0,0)' 
              placeholder="Email"
              placeholderTextColor = "#9E9E9E"
              selectionColor="#fff"
              keyboardType="email-address"
              autoCapitalize = 'none'
              returnKeyType = "next"
              onSubmitEditing={()=> this.password.focus()}
              onChangeText={(text) => this.setState({email: text})}
              />
          <TextInput style={styles.inputBox} 
              underlineColorAndroid='rgba(0,0,0,0)' 
              placeholder="Password"
              secureTextEntry={true}
              placeholderTextColor = "#9E9E9E"
              autoCapitalize = 'none'
              returnKeyType = "go"                                                                        
              ref={(input) => this.password = input}
              onChangeText={(text) => this.setState({password: text})}
              />

            <Text style={styles.error_message}> {this.state.message} </Text>

           <TouchableOpacity style={styles.button} onPress={this.loginUser}>
             <Text style={styles.buttonText}>Login</Text>
           </TouchableOpacity> 
          
          
           
          
  		</View>
        <View style={styles.singupTextContent}>
          <Text style={styles.singupText}>Don't have an account yet?</Text>
          <TouchableOpacity onPress={this.signup}><Text style={styles.singupButton}>Signup</Text></TouchableOpacity>
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
  singupTextContent:{
    flexGrow: 1,
    justifyContent:'center',
    alignItems: 'flex-end',
    paddingVertical: 10,
    flexDirection: 'row'
  },
  singupText:{
    color: '#9E9E9E',
    fontsize:16
  },
  singupButton:{
    color:'#9E9E9E',
    fontSize:16,
    marginHorizontal:5
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
    marginVertical: 10
  },
  buttonText: {
    fontSize:18,
    fontWeight:'500',
    color:'#ffffff',
    textAlign:'center'
  },
  error_message:{
    color:'#C20000',
  }
});