import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from 'react-native';
import { List,ListItem } from "react-native-elements";
import { Actions } from 'react-native-router-flux';

export default class displaySketches extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("from","==",this.props.email);
  state = {
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
                    source={require('../images/no_results_found.png')} 
              />
              <TouchableOpacity style={styles.button} onPress={this.newSkecth}>
                  <Text style={styles.buttonText}>Create Sketch</Text>
              </TouchableOpacity> 
         	</View>
        ) : (
     
          <List style={styles.list} containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
          
            <FlatList 
              data={this.state.sketches}
              ItemSeparatorComponent={this.renderSeparator}
              renderItem={({ item }) => (
              
                <ListItem 
                  style={styles.listItem}
                  button onPress={() => {this.showDetails(item.name,this.props.email)}}
                  roundAvatar
                  title={`${item.name.replace(/_/g, " ")}`}
                  avatar={{ uri: item.original_img }}
                  containerStyle={{ borderBottomWidth: 0 }}
                
                />
              )}
              
            />
          </List>
    
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
    // sketches.map(data =>
    //         console.log(data)
    // );
  }
}


const styles = StyleSheet.create({
  container : {
    backgroundColor: '#FAFAFA',
    flex: 1
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
    backgroundColor: '#9ACD32',
    marginVertical:50
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
  listItem:{
    backgroundColor: '#9ACD32'
  }
});