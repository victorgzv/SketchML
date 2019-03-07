import React from 'react';
import {StyleSheet,View,Text,ScrollView,ActivityIndicator} from 'react-native';

import * as firebase from 'firebase';

export default class Singup extends React.Component {
state = {
code:'',
loading:true
}
  componentDidMount(){
    const ref = firebase.storage().ref().child(this.props.email + "/" + this.props.sname +"-code.js");
    const that = this;
    ref.getDownloadURL().then(function(data) {
     
        fetch(data)
        .then(function(response) {
          response.text().then(function(text) {
            that.setState({ code: text,
                            loading: false
                          });
          });
        });
      }).catch(function(error) {
          console.log(error);
      });
  }
  componentWillUnmount() {
  
  }
  
    render(){
        const isLoading = this.state.loading;
            return(
                <View style={styles.container}>
                {isLoading ? (
                   	<View >
                      <ActivityIndicator size="large" color="#66BB6A" />
                    </View>
                ) : (
                    <ScrollView>
                        <Text
                        selectable={true} 
                        >{this.state.code}</Text>
                    </ScrollView>
                )}
                </View>
                );
    }//end of render method

}//end of class

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#FAFAFA',
      justifyContent: 'center',
      flexDirection: 'column'
    }
 })