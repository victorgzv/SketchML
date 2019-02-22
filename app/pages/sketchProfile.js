import React from 'react';
import {Actions} from 'react-native-router-flux';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { Dimensions } from 'react-native'
import Image from 'react-native-scalable-image';
import { DotIndicator} from 'react-native-indicators';

export default class Singup extends React.Component {
  unsubscribe = null;
  ref =  this.props.db.collection("sketches").where("name", "==", this.props.sname).where("from","==",this.props.email);
  state = {
    isLoading: true,
    isEmpty:true,
    predicted_image: ''
  }
  componentDidMount(){
    unsubscribe = this.ref.onSnapshot(this.onImageLoad);
  }
  componentWillUnmount() {
    unsubscribe= null;
  }
  displayLayout=()=>{
    let sname=this.props.sname;
    let email = this.props.email;
    Actions.displayLayout({email:email,sname:sname});
  }
	render(){
    const animating = this.state.isLoading;
    const empty = this.state.isEmpty;
		return(
			<View style={styles.container}>
             {animating ? (
            <View style={styles.container}>
                <DotIndicator color='#66BB6A' />
            </View>
            ) : (
              <View style={styles.container}>
               {empty ? (
                  <View style={styles.container}>
                  <Text>0 predictions found</Text>
                  </View>
               ):(
                <View style={styles.container}>
                    <Text > Sketch: {this.props.sname.replace(/_/g, " ")}</Text>
                    <Image
                    width={Dimensions.get('window').width} // height will be calculated automatically
                    source={{uri: this.state.predicted_image}}
                    /> 
                    <Text >{this.state.imageStatus}</Text> 
                    <TouchableOpacity style={styles.button} onPress={this.displayLayout}>
                      <Text style={styles.buttonText}>Preview Layout</Text>
                    </TouchableOpacity> 
                </View>
              )}
              </View>

             )}
  			</View>
			);
  }
  onImageLoad = (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const predicted_img = doc.data().predicted_url;
      if(doc.data().num_predictions==0){
        this.setState({
          isLoading: false
        });
      }
        if(predicted_img !=""){
          this.setState({
            predicted_image: predicted_img,
            isLoading: false,
            isEmpty: false
          });
        
        }
    });   
  }
}

const styles = StyleSheet.create({
  container : {
    backgroundColor: '#FAFAFA',
    flex: 1,
    justifyContent:'center',
    alignItems: 'center'
  },
  button: {
    width:300,
    backgroundColor:'#66BB6A',
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 13
  },
  buttonText: {
    fontSize:18,
    fontWeight:'500',
    color:'#ffffff',
    textAlign:'center'
  },
  lottie: {
    width: 250,
    height: 300
  }
  
});


// //( (x1 +x2)/2 ,(y1 + y2)/2 )
      // let xCenter =(predictions[0][i]['x0']+predictions[0][i]['x1'])/2;
      // let yCenter =(predictions[0][i]['y0']+predictions[0][i]['y1'])/2;
  // calculateDistance(predictions,image_width,image_height){
  //   console.log("from function" +predictions[0].length);
    
  //   for(i=0;i<predictions[0].length;i++){
  //     console.log(predictions[0][i]['width']+","+predictions[0][i]['height']);
  //   }
  //   // sharp(input)
  //   //     .extract({ left: left, top: top, width: width, height: height })
  //   //     .toFile(output, function(err) {
  //   //       // Extract a region of the input image, saving in the same format.
  //   // });
  //   // console.log(boxes);
  //   // this.buildGroups(boxes);
  // }

  // buildGroups = async (b) => {
  //  const x0_coordinates=[];
  //  const y0_coordinates=[];
  //  const x1_coordinates=[];
  //  const y1_coordinates=[];
  //     for(i=0;i<b[0].length;i++){
  //       x0_coordinates.push(b[0][i]['x0']);
  //       y0_coordinates.push(b[0][i]['y0']);
  //       x1_coordinates.push(b[0][i]['x1']);
  //       y1_coordinates.push(b[0][i]['y1']);
  //       // console.log(b[0][i]['x0']);
  //     //   console.log("in2");
  //     //   console.log(b[i]['width']);
  //     // // Y= Math.min(b[i]['top'],b[i+1]['top']);
  //     // // maxW = Math.max(b[i]['width'],b[i+1]['width']);
  //     // // maxH = Math.max(b[i]['height'],b[i+1]['height']);
        
  //     }
  //     console.log("boxes: "+ array);
  //     console.log("x0_coordinates: " +Math.min(...x0_coordinates));
  //     console.log("y0_coordinates: " +Math.min(...y0_coordinates));
  //     console.log("x1_coordinates: " +Math.max(...x1_coordinates));
  //     console.log("y1_coordinates: " +Math.max(...y1_coordinates));
  //   }