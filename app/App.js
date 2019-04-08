import React from 'react';
import { StyleSheet, View} from 'react-native';
import Routes from './Routes';


export default class App extends React.Component {
  unsubscribe = null;
  componentDidMount(){
   
  }
  componentWillUnmount() {
   
  }
  render() {
    return (
      <View style={styles.container}> 
       <Routes/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
