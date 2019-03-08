const functions = require('firebase-functions');
const exec = require('child_process').exec;
const admin = require('firebase-admin');
const path = require('path');
const fs = require('file-system');
const sizeOf = require('image-size');
const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');
const projectId = 'sketchml';
const UUID = require("uuid/v4");
const prettier = require("prettier");
const codeGen = require('./code-gen.js');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// Creates a client
const storage = new Storage({ projectId });
const { auth } = require('google-auth-library');

async function makePrediction(b64img) {
  const client = await auth.getClient({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  return new Promise((resolve, reject) => {

    var ml = google.ml({
      version: 'v1'
    });

    const params = {
      auth: client,
      name: 'projects/sketchml/models/sketchml_detect/versions/v1',
      resource: {
        instances: [{ "b64": b64img }]
      }
    };

    ml.projects.predict(params, (err, result) => {
      console.log("executing ML Predict...");
      if (err) {
        console.log("ERROR:" + err);
        reject(err);
      } else {
        console.log("RESULT: " + result.data.predictions[0].num_detections);
        resolve(result);
      }
    });
  });
}
function resizeImg(filepath) {
  return new Promise((resolve, reject) => {
    exec(`convert ${filepath} -resize 600x ${filepath}`, (err) => {
      if (err) {
        console.error('Failed to resize image', err);
        reject(err);
      } else {
        console.log('resized image successfully');
        resolve(filepath);
      }
    });
  });
}
//Function to sort bounding boxes by its minY coordinate
function sortFunction(a, b) {
  if (a['y0'] === b['y0']) {
      return 0;
  }
  else {
      return (a['y0'] < b['y0']) ? -1 : 1;
  }
}
//Function to sort bounding boxes by its minX coordinate
function sortXaxis(a, b) {
  if (a['x0'] === b['x0']) {
      return 0;
  }
  else {
      return (a['x0'] < b['x0']) ? -1 : 1;
  }
}
async function createLayoutFile(fileBucket,bucket,filePath,predictions) {
  //Call to function sort by minY coordinate
  
  let sorted_predictions = predictions.sort(sortFunction);
  let yCounter = 0;
      let counterRows = 0;
      var row = [];
      
      //For loop to iterate through sorted elements. It calculates the number of rows and the elements that are part of the rows.
      for( i=0;i<sorted_predictions.length;i++){
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
          for( j=0;j<row[i].length;j++){//Iterates through all the columns of each row
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
              rowOrder[i]=rowOrder[i].sort(sortXaxis);//sort all elements on the x coordinate
            } 
          }          
      }//end for loop
      
    let fileName = path.basename(filePath);
    let file = '/tmp/'+ fileName + '.js';
    let wstream = fs.createWriteStream(file);
    wstream.write(codeGen.addImports());
    wstream.write(codeGen.addopeningHeaders());
    for(i=0;i<rowOrder.length;i++){//Iterates through all the rows 
    
      wstream.write("<View style={styles.rows}>");
      for(j=0;j<rowOrder[i].length;j++){//Iterates through all the columns of each row
        //Each type of object will add an UI element to the array of elements
          let objectType= rowOrder[i][j]['object'];
          if(objectType==="Textfield"){
            console.log("TEXTFIELD");
            
            let textfield="<TextInput style = {styles.input} "+
            "underlineColorAndroid = 'transparent' "+
            "placeholderTextColor = '#9a73ef' "+
            "autoCapitalize = 'none'/>";
            wstream.write(textfield);

          }else if(objectType==="Label"){
            console.log("LABEL");
            let label ="<Text style = {styles.label}> Text </Text>";
            wstream.write(label); 
          }
      }
      wstream.write("</View>");
    }//end for loop
    wstream.write(codeGen.addclosingHeaders());
    wstream.write(codeGen.addStyles());
   
    wstream.end();
    let options = {
        "arrowParens": "avoid",
        "bracketSpacing": true,
        "htmlWhitespaceSensitivity": "css",
        "insertPragma": false,
        "jsxBracketSameLine": false,
        "jsxSingleQuote": false,
        "parser": "babel",
        "printWidth": 80,
        "proseWrap": "preserve",
        "requirePragma": false,
        "semi": true,
        "singleQuote": false,
        "tabWidth": 2,
        "trailingComma": "none",
        "useTabs": false 
    }
    
    fs.readFile(file,'utf8',(err, data) => {
      if (err) throw err;
      console.log('---complete---');
       fs.writeFile(file, prettier.format(data,opt), (err)  => {
          if (err) throw err;
          console.log('complete');
      });
  });

  //Upload code file to cloud storage
    let uuid = UUID();
    await  bucket.upload(file, {
    destination: filePath + "-code.js",
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      contentType: 'text/javascript',
      cacheControl: 'public, max-age=31536000',
      firebaseStorageDownloadTokens: uuid
    },
  }, (err, file) => {
    if (err) return console.error(err);
    return console.log("Successfully uploaded code to bucket.");
  });
  
  let code_url = "https://firebasestorage.googleapis.com/v0/b/" + fileBucket + "/o/" + encodeURIComponent(filePath + "-code.js") + "?alt=media&token=" + uuid;
  if (code_url !== null){
     // Update document on Firestore
     let addCodeFile =  db.collection('sketches');
     addCodeFile.where("name", "==", path.basename(filePath)).where("from", "==", path.dirname(filePath)).get()
     .then((querySnapshot) => {
       querySnapshot.forEach((doc) => {
         if (querySnapshot.size > 0) {
          addCodeFile.doc(doc.id).update({ code_url: code_url }, { merge: true });
         }
       });
       return true;
     })
     .catch((error) => {
       console.log("Error getting documents:", error);
       return error;
     });
  }
}

exports.startPrediction = functions.storage.object().onFinalize((event) => {


  fs.rmdir('./tmp/', (err) => {
    if (err) {
      console.log('error deleting tmp/ dir');
    }
  });

  const fileBucket = event.bucket;
  const contentType = event.contentType;
  const filePath = event.name;
  const bucket = storage.bucket(fileBucket);
  const fileName = path.basename(filePath);
  const file = bucket.file(filePath);
  const dirName = path.dirname(filePath);

  if (path.basename(filePath).endsWith('-predicted') ) {
    console.log('Files already exists. Exiting ...');
    return;
  }
  if (path.basename(filePath).endsWith('-code.js')) {
    console.log('Files already exists. Exiting ...');
    return;
  }
  if (filePath.startsWith(dirName)) {
    const destination = '/tmp/' + fileName;
    console.log('got a new image', filePath);
    console.log('dest', destination);
    return file.download({
      destination: destination
    }).then(() => {
      if (sizeOf(destination).width > 600) {
        console.log('scaling image down...');
        return resizeImg(destination);
      } else {
        return destination;
      }
    }).then(() => {
      console.log('base64 encoding image...');
      let bitmap = fs.readFileSync(destination);
      return new Buffer(bitmap).toString('base64');
    }).then((b64string) => {
      console.log('sending image againts ML model ...');
      return makePrediction(b64string);
    }).then((result) => {
      let boxes = result.data.predictions[0].detection_boxes;
      let scores = result.data.predictions[0].detection_scores;
      let objectName = result.data.predictions[0].detection_classes;
      let dimensions = sizeOf(destination);
      let data = "";
      let num_predictions = 0;
      let arrayOfElements = [];
      let imageRef = db.collection('sketches');
      console.log("SCORES" + scores);

      for (i = 0; i < scores.length; i++) {
        if (scores[i] >= 0.7) {
          num_predictions++;
          let x0 = boxes[i][1] * dimensions.width;
          let y0 = boxes[i][0] * dimensions.height;
          let x1 = boxes[i][3] * dimensions.width;
          let y1 = boxes[i][2] * dimensions.height;
          let width = x1 - x0;
          let height = y1 - y0;
          let class_name = "";
          let class_color = "";
          if (objectName[i] === 1) {
            console.log("CLASS: LABEL");
            class_name = "Label";
            class_color = "Firebrick"
          } else if (objectName[i] === 2) {
            console.log("CLASS: TEXT FIELD");
            class_name = "Textfield";
            class_color = "limegreen"
          }
          console.log("Class: " + objectName[i]);
          data += "stroke " + class_color + " fill none rectangle " + x0 + "," + y0 + "," + x1 + "," + y1 + "\r\n";
          arrayOfElements.push({ object: class_name, accuracy: scores[i], x0: x0, y0: y0, x1: x1, y1: y1, width: width, height: height });
        }
      }//end for loop
      console.log("num_predictions: " + num_predictions);
      if (num_predictions > 0) {


        fs.writeFile('/tmp/rect.txt', data, (err, data) => {
          if (err) console.log(err);
          console.log("Successfully Written to File.");
        });
        console.log(arrayOfElements);


        // Draw a box on the image around the predicted bounding box
        return new Promise((resolve, reject) => {
          console.log(destination);
          // exec(`convert ${destination} -stroke "#39ff14" -strokewidth 2 -fill none -draw @/tmp/rect.txt ${destination}`, (err) => {
          exec(`convert ${destination} -strokewidth 2 -draw @/tmp/rect.txt ${destination}`, (err) => {
            if (err) {
              console.error('Failed to draw rect.', err);
              reject(err);
            } else {
              console.log('drew the rect');
              console.log("uploading image...");
              const metadata = { contentType: contentType };
              // Upload to cloud Storage
              let uuid = UUID();
              bucket.upload(destination, {
                destination: filePath + "-predicted",
                uploadType: "media",
                metadata: {
                  contentType: 'image/jpg',
                  metadata: {
                    firebaseStorageDownloadTokens: uuid
                  }
                }
              }, (err, file) => {
                if (err) return console.error(err);
                return console.log("succesfully uploaded!");
              });
              let predicted_img_url = "https://firebasestorage.googleapis.com/v0/b/" + fileBucket + "/o/" + encodeURIComponent(filePath + "-predicted") + "?alt=media&token=" + uuid;
              // Update document on Firestore
              imageRef.where("name", "==", path.basename(filePath)).where("from", "==", path.dirname(filePath)).get()
                .then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                    console.log(querySnapshot.size);
                    if (querySnapshot.size > 0) {
                      console.log(doc.id, " => ", doc.data());
                      imageRef.doc(doc.id).update({ num_predictions: num_predictions, 
                                                    predicted_url: predicted_img_url, 
                                                    width: dimensions.width, 
                                                    height: dimensions.height, 
                                                    predictions: arrayOfElements }, { merge: true });
                    }
                  });
                  return true;
                })
                .catch((error) => {
                  console.log("Error getting documents:", error);
                  return error;
                });
                createLayoutFile(fileBucket,bucket,filePath,arrayOfElements);
                
              resolve(destination);
            }
          });
        });
      } else {

        // Update document on Firestore
        imageRef
          .where("name", "==", path.basename(filePath))
          .where("from", "==", path.dirname(filePath))
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log(querySnapshot.size);
              if (querySnapshot.size > 0) {
                console.log(doc.id, " => ", doc.data());
                imageRef.doc(doc.id).update({ num_predictions: num_predictions }, { merge: true });

              }
            });
            return true;
          })
          .catch((error) => {
            console.log("Error getting documents:", error);
            return error;
          });
        return console.log("No objects were found");
      }
    })
  }
});