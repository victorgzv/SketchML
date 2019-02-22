import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
   Image 
} from 'react-native';

export default class Logo extends React.Component{
	render(){
		return(
			<View style={styles.container}>
				<Image  style={{width:70, height: 70}}
          			source={require('../images/s_logo.png')}/>
          		<Text style={styles.logoText}>Sketch ML</Text>	
  			</View>
			)
	}
}

const styles = StyleSheet.create({
  container : {
    flexGrow: 1,
    justifyContent:'center',
		alignItems: 'center',
		marginVertical:5
  },
  logoText : {
  	fontSize:18,
  	color:'black'
  }
});