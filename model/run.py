'''
Victor Gonzalez - D16123580 - DT228
|MODEL DEPLOYMENT|
Once the model is trained and evaluated using TensorFlow Object Detection API
the graphs orginated from the trained model can be used againts testing picture to see the accuracy of the model.

The following script has been implemented after reseraching TensorFlow API and watching a bunch of videos:

https://www.edureka.co/blog/tensorflow-object-detection-tutorial/
https://www.youtube.com/watch?v=Rgpfk6eYxJA
https://github.com/tensorflow/models/tree/master/research/object_detection
'''
# import the necessary packages:
import numpy as np
import os
import tensorflow as tf
import cv2
import imutils
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as vis_util
from distutils.version import StrictVersion


images_dir = os.getcwd() +  "/sketchML/test_images"
frozen_graph = os.getcwd() + "/sketchML/experiments/exported_model/frozen_inference_graph.pb"
labels_location = os.getcwd() + "/sketchML/" + "label_map.pbtxt"
num_classes = 5

def main():
    print("Starting sketchML...")
    # Load the resulting frozen model from the trained model
    detection_graph = tf.Graph()
    with detection_graph.as_default():
        graph_def = tf.GraphDef()
        #Reading TF graph
        with tf.gfile.GFile(frozen_graph, 'rb') as fid:
            serialized_graph = fid.read()#read graph
            graph_def.ParseFromString(serialized_graph)#parsing graph
            tf.import_graph_def(graph_def, name='')#importing graph


    # Load map contains a value for each category name on which the model has been trained to detect objectsself.
    # If the model detects 1 it corresponds to a label and 2 to a text_input
    label_map = label_map_util.load_labelmap(labels_location) #Loadinf the label map from an specific location
    #Extract category names from this file asn create and index like label->1, text_input->2
    categories = label_map_util.convert_label_map_to_categories(label_map, max_num_classes=num_classes,
                                                                use_display_name=True)
    category_index = label_map_util.create_category_index(categories)
    print(category_index)
    #Reading every image to be tested
    img_paths = []
    for imageFileName in os.listdir(images_dir):
        if imageFileName.endswith(".jpg"):
            img_paths.append(images_dir + "/" + imageFileName)

#Using the graph to make predictions
    with detection_graph.as_default():
        with tf.Session(graph=detection_graph) as sess:
            #Itearate trhu every image contaned in the folder
            for image_path in img_paths:
                print(image_path)#Print the path of each image
                detect_img = cv2.imread(image_path)

                if detect_img is None:
                    print("error reading file " + image_path)
                    continue
                # end if

                # Input tensor
                image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
                # get bounding boxes
                detection_boxes = detection_graph.get_tensor_by_name('detection_boxes:0')
                #Get the level of confidence of each bounding box
                detection_scores = detection_graph.get_tensor_by_name('detection_scores:0')
                detection_classes = detection_graph.get_tensor_by_name('detection_classes:0')
                num_detections = detection_graph.get_tensor_by_name('num_detections:0')

                # Expand dimensions following TensorFlow documentation
                detect_img_expanded = np.expand_dims(detect_img, axis=0)
                # Detection
                (boxes, scores, classes, num) = sess.run(
                    [detection_boxes, detection_scores, detection_classes, num_detections],
                    feed_dict={image_tensor: detect_img_expanded})
                # Displaying results on the images.
                vis_util.visualize_boxes_and_labels_on_image_array(detect_img,
                                                                   np.squeeze(boxes),
                                                                   np.squeeze(classes).astype(np.int32),
                                                                   np.squeeze(scores),
                                                                   category_index,
                                                                   use_normalized_coordinates=True,
                                                                   line_thickness=5)
                #resize image to fit om screen
                resized = imutils.resize(detect_img,width=550,height=500);
                cv2.imshow("detect_img", resized)
                cv2.waitKey()

if __name__ == "__main__":
    main()
