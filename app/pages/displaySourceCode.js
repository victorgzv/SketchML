import React from 'react';
import {StyleSheet,View,Text,TouchableOpacity,TextInput} from 'react-native';
import * as firebase from 'firebase';

export default class Singup extends React.Component {

  state = {
   code:''
  }
  componentDidMount(){
  }
  componentWillUnmount() {
  
  }
  createLayout = () => {}
    render(){ 
            return(
                <View style={styles.container}>
                  <Text>Hi there!</Text>
                </View>
                );
    }//end of render method

}//end of class

const styles = StyleSheet.create({
    container: {
      marginTop: 150,
      justifyContent: 'center',
      flexDirection: 'column'
    },
    rows: {
      justifyContent: 'center',
      flexDirection: 'row',
   },
    input: {
       margin: 15,
       height: 40,
       flex:2,
       borderColor: 'black',
       borderWidth: 1,
       paddingLeft:5
    },
    label: {
      flex:1,
        margin: 15
     }
 })