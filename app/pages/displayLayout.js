import React from 'react';
import {StyleSheet,View,Text,TouchableOpacity,TextInput} from 'react-native';

export default class Singup extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("name", "==", this.props.sname).where("from","==",this.props.email);
  state = {
    widgets:[]
  }
  componentDidMount(){
    // this._fetchNormalData();
    unsubscribe = this.ref.onSnapshot(this.onDataLoad);
    
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
//Function to sort bounding boxes by its minY coordinate
sortFunction(a, b) {
  if (a['y0'] === b['y0']) {
      return 0;
  }
  else {
      return (a['y0'] < b['y0']) ? -1 : 1;
  }
}
//This method returns information about the predicted bounding boxes and create code according to the type of object found
  onDataLoad = (querySnapshot) => {
    var elements =[];
   
    
    querySnapshot.forEach((doc) => {
      const predictions = doc.data().predictions;
      //Call to function sort by minY coordinate
      let sorted_predictions = predictions.sort(this.sortFunction);

      const imgWidth = doc.data().width;
      const imgHeight = doc.data().height;
      console.log(imgWidth,imgHeight);

      for(i=0;i<predictions.length;i++){
          //Each type of object will add an UI element to the array of elements
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

      let yCounter = 0;
      let counterRows = 0;
      var row = [];
      

      for(i=0;i<sorted_predictions.length;i++){
         
          row [counterRows] = [];//Creates a 2D array for each row
          if(sorted_predictions[i]['y0']>yCounter){
            counterRows++;
            yCounter = sorted_predictions[i]['y0'] +sorted_predictions[i]['height']
           
            if(sorted_predictions[i]['y0']<yCounter){
              console.log("Element "+ sorted_predictions[i]['object']+" is in row: " + (counterRows-1));
              let position = (counterRows-1);
              row[position].push(sorted_predictions[i]);
            
            }
          }else{
            if(sorted_predictions[i]['y0']<yCounter){
              console.log("Element "+ sorted_predictions[i]['object']+" is in row: " + (counterRows-1));
              let position = (counterRows-1);
              row[position].push(sorted_predictions[i]);
            }
            continue;
          }
          
         
      }
      console.log(counterRows);
      console.log(row)
      
     
     
      
      //Updating the state of widgets
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