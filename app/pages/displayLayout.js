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
      
      //For loop to iterate through sorted elements. It calculates the number of rows and the elements that are part of the rows.
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
      }//end for loop
      console.log("No. of rows: "+counterRows);
      // console.log(row);
      let xCounter = 0;
      
      var orderElements=[];
      var rowOrder=[];
      for(i=0;i<row.length;i++){//Iterates through all the rows 
        rowOrder[i]=[];
          for(j=0;j<row[i].length;j++){//Iterates through all the columns of each row
           
            //If a row only contains one element
            if(row[i].length===1){ 
              // console.log("in_row: "+ i);
              // console.log(row[i][j]);
              console.log("There is only one elements on this row");
              rowOrder[i].push(row[i][j]);
            }else{
              if(row[i][j]['x0']>xCounter){
                xCounter = row[i][j]['x0'];
                // console.log("the element on the most right is: "+row[i][j]['object']);
                rowOrder[i].push(row[i][j]);
              }else{
                rowOrder[i].unshift(row[i][j]);
              }
              
            }
            
          }
        
          
      }//end for loop
      console.log(rowOrder);
      
      
      
      
     
     
      
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