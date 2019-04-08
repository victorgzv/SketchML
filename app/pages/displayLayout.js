import React, { Component } from 'react';
import {StyleSheet,View,Text,TouchableOpacity,TextInput,Switch,Image} from 'react-native';

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
  createLayout = () => {
    let stack = this.state.widgets;
    let layout=[];
    for(i=0;i<stack.length;i++){//Iterates through all the rows 
      console.log(stack[i]);
      let uiElement=[];
      for(j=0;j<stack[i].length;j++){//Iterates through all the columns of each row
        //Each type of object will add an UI element to the array of elements
          let objectType= stack[i][j]['object'];
          if(objectType==="Textfield"){
            uiElement.push( 
                <TextInput style = {styles.input}
                underlineColorAndroid = "transparent"
                placeholder="Enter Your text Here"
                
                />
            );
          }else if(objectType==="Text"){
            uiElement.push( <Text style = {styles.label}>Lorem Ipsum</Text>);
          }
          else if(objectType==="Button"){
            uiElement.push( 
                  <TouchableOpacity style={styles.button} >
                    <Text style={styles.buttonText}>Button</Text>
                  </TouchableOpacity> 
            );
          }
          else if(objectType==="Image"){
            uiElement.push(
                        <Image  style={styles.img}
          			        source={require('../assets/img-placeholder.png')}
                        />
            );
          }
          else if(objectType==="Switch"){
            uiElement.push( 
                          <Switch style = {styles.switch}
                          thumbTintColor="#66BB6A"
                          />
            );
          }
      }
      layout.push(<View style={styles.rows}>{uiElement}</View>);
    }
    return layout
  
  }//end function

render(){ 
		return(
			<View style={styles.container}>
            {this.createLayout()}
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
//Function to sort bounding boxes by its minX coordinate
sortXaxis(a, b) {
  if (a['x0'] === b['x0']) {
      return 0;
  }
  else {
      return (a['x0'] < b['x0']) ? -1 : 1;
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
      var rowOrder=[];
      for(i=0;i<row.length;i++){//Iterates through all the rows 
        rowOrder[i]=[];
          for(j=0;j<row[i].length;j++){//Iterates through all the columns of each row
            //If a row only contains one element
            if(row[i].length===1){ 
              // console.log("There is only one elements on this row");
              rowOrder[i].push(row[i][j]);
            }else if(row[i].length>1){
              // console.log(row[i][j]);
              if(row[i][j]['x0']>xCounter){
                xCounter = row[i][j]['x0'];
                rowOrder[i].push(row[i][j]);//add element at the end of the row array
              }else{
                rowOrder[i].unshift(row[i][j]);//add element at the start of the row array
              }
              rowOrder[i]=rowOrder[i].sort(this.sortXaxis);//sort all elements on the x coordinate
            } 
          }          
      }//end for loop
      
      // //Updating the state of widgets
      this.setState({
        widgets: rowOrder
      });  
      
      
    });   
  }
}

const styles = StyleSheet.create({
    container: {
      marginTop: 50,
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center'
      
    },
    rows: {
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
   },
    input: {
       flex:2,
       backgroundColor: '#fff',
       borderWidth: .5,
       borderColor: '#000',
       height: 40,
       borderRadius: 5 ,
       margin: 15,
       paddingHorizontal:16,
       paddingVertical:12,
       
    },
    button: {
      margin: 25,
      height: 40,
      width:100,
      backgroundColor:'#66BB6A',
      justifyContent: 'center',
      borderRadius: 5 ,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 0.8,
      elevation: 6,
      shadowRadius: 15 ,
      shadowOffset : { width: 1, height: 13}
    
    },
    buttonText: {
      fontSize:16,
      fontWeight:'500',
      color:'white',
      textAlign:'center',
      fontFamily: 'Roboto'
    },
    switch: {
      margin: 25,
      height: 40,
     
    },
    img: {
      width : 120,
      height: 120,
      margin: 25
    },
    label: {
    
       margin: 25,
       
     }
 })