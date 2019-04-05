import React, { Component } from 'react';

import {
	StyleSheet,
	View,
  Text
} from 'react-native';


export default class Logo extends React.Component{

	render(){
		return(
			<View style={styles.container}>
				{/* <Image  style={{width:this.props.width, height: this.props.height}}
          			source={require('../assets/icon.png')}/>	
				</View> */}
				<Text style={{ fontFamily: 'System-code', fontSize: 56 }}>&lt;Sketch ML/&gt;</Text>
			</View>
			)
	}
}

const styles = StyleSheet.create({
  container : {
    flexGrow: 1,
    justifyContent:'center',
		alignItems: 'center',
		margin:15,

  },
  logoText : {
		fontSize:38,
		fontFamily: 'System-code',
		color:'black',
		textAlign: "center",
		fontWeight: '600',
  }
});