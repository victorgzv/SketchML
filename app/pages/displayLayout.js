import React from 'react';
import {StyleSheet,View,Text,TouchableOpacity,TextInput} from 'react-native';
import { element } from 'prop-types';

export default class Singup extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("name", "==", this.props.sname).where("from","==",this.props.email);
  state = {
    widgets:[]
  }
  componentDidMount(){
    // this._fetchNormalData();
    unsubscribe = this.ref.onSnapshot(this.onImageLoad);
    
  }
  componentWillUnmount() {
    unsubscribe= null;
  }

render(){ 
		return(
			<View style={styles.container}>
                  <Text > Layout: </Text>
                    {this.state.widgets}
  			</View>
			);
}
  onImageLoad = (querySnapshot) => {
    var elements =[];
    querySnapshot.forEach((doc) => {
      const predictions = doc.data().predictions;
      for(i=0;i<predictions.length;i++){
          let objectType= predictions[i]['object'];
          if(objectType==="Textfield"){
            elements.push( 
                <TextInput style = {styles.input}
                underlineColorAndroid = "transparent"
                placeholderTextColor = "#9a73ef"
                autoCapitalize = "none"
                />
            );
          }else if(objectType==="Label"){
            elements.push( <Text style = {styles.label}> Your text goes here </Text>);
          }
      }
      this.setState({
        widgets: elements
      });  
      
      
    });   
  }
}



const styles = StyleSheet.create({
    container: {
       paddingTop: 23
    },
    input: {
       margin: 15,
       height: 40,
       borderColor: 'black',
       borderWidth: 1,
       paddingLeft:5
    },
    label: {
        margin: 15
     }
 })