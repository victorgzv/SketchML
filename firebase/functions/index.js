const functions = require('firebase-functions');
const exec = require('child_process').exec;
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');
const {google} = require('googleapis');
const {Storage} = require('@google-cloud/storage');
const projectId = 'sketch-layouts';
const UUID = require("uuid/v4");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// Creates a client
const storage = new Storage({projectId});
const {auth} = require('google-auth-library');

async function makePrediction(b64img) {
    const client = await auth.getClient({scopes: ['https://www.googleapis.com/auth/cloud-platform']});
    return new Promise((resolve, reject) => {

        var ml = google.ml({
            version: 'v1'
        });
        
        const params = {
            auth: client,
            name: 'projects/sketch-layouts/models/sketchml_detection/versions/v1',
            resource: {
                instances: [{"b64":b64img}]
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
    
    if (path.basename(filePath).endsWith('-predicted')){
        console.log('File already exists. Exiting ...');
        return;
    }
    if (filePath.startsWith(dirName)) {  
        const destination = '/tmp/' + fileName;
        console.log('got a new image', filePath);
        console.log('dest', destination);
        return file.download({
            destination: destination
        }).then(() => {
            if(sizeOf(destination).width > 600) {
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
            let objectName =  result.data.predictions[0].detection_classes;
            let dimensions = sizeOf(destination);
            let data="";
            let num_predictions=0;
            let arrayOfElements=[];
            let imageRef = db.collection('sketches');
            console.log("SCORES"+ scores);
           
            for (i=0;i< scores.length;i++){
                if (scores[i] >= 0.7) {
                    num_predictions++;
                    let x0 = boxes[i][1] * dimensions.width ;
                    let y0 = boxes[i][0] * dimensions.height;
                    let x1 = boxes[i][3] * dimensions.width;
                    let y1 = boxes[i][2] * dimensions.height;
                    let width = x1 - x0;
                    let height = y1 - y0;
                    let class_name="";
                    let class_color="";
                    if(objectName[i] === 1){
                        console.log("CLASS: LABEL");
                        class_name="Label";
                        class_color="Firebrick"
                    }else if(objectName[i] === 2){
                        console.log("CLASS: TEXT FIELD");
                        class_name="Textfield";
                        class_color="limegreen"
                    }
                    console.log("Class: " + objectName[i]);
                    data +="stroke "+class_color+" fill none rectangle " + x0 + "," + y0 + ","+ x1 + "," +y1+ "\r\n";
                    arrayOfElements.push({object: class_name,accuracy:scores[i],x0: x0,y0: y0,x1: x1,y1: y1,width: width,height: height});
                } 
            }//end for loop
            console.log("num_predictions: " + num_predictions);
            if(num_predictions>0){

           
            fs.writeFile('/tmp/rect.txt', data, function(err, data){
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
                    const metadata = { contentType: contentType};
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
                      },(err, file) => {
                            if (err) return console.error(err);
                     });
                     let predicted_img_url = "https://firebasestorage.googleapis.com/v0/b/" + fileBucket + "/o/" + encodeURIComponent(filePath + "-predicted") + "?alt=media&token=" + uuid;

                    // Update document on Firestore
                    imageRef
                    .where("name", "==", path.basename(filePath))
                    .where("from", "==", path.dirname(filePath))
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                          console.log(querySnapshot.size); 
                          if(querySnapshot.size >0){
                            console.log(doc.id, " => ", doc.data());
                            imageRef.doc(doc.id).update({num_predictions: num_predictions,predicted_url: predicted_img_url,width:dimensions.width,height:dimensions.height,predictions:arrayOfElements},{merge:true});
                            
                          }   
                        }.bind(this));
                        return true;
                    })
                    .catch(function(error) {
                      console.log("Error getting documents:", error);
                      return error;
                     });

                    
                    resolve(destination);
                  }
                });
              });
            }else{
              
                // Update document on Firestore
                imageRef
                .where("name", "==", path.basename(filePath))
                .where("from", "==", path.dirname(filePath))
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                      console.log(querySnapshot.size); 
                      if(querySnapshot.size >0){
                        console.log(doc.id, " => ", doc.data());
                        imageRef.doc(doc.id).update({num_predictions: num_predictions},{merge:true});
                        
                      }   
                    }.bind(this));
                    return true;
                })
                .catch(function(error) {
                  console.log("Error getting documents:", error);
                  return error;
                 });
                 return console.log("No objects were found");
            }
        })
    }else {
        return 'not a new image';
    }
  });


  