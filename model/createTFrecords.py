'''
Victor Gonzalez - D16123580 - DT228
|DATA PREPARATION|
Once the dataset of images have been manually labelled this script prepares the images and
their annotations for training the model.
The following data must be converted to TensorFlow format in order to train the model.

The steps are:
1. Convert XML annotations into a pandas Dataframe.
2. Split dataframe into training and testing data.
3. Convert each dataframe into csv files.
4. Covert each csv file into TensorFlow records format.

The following script has been implemented after reseraching TensorFlow API and watching a bunch of videos:

https://www.edureka.co/blog/tensorflow-object-detection-tutorial/

https://www.youtube.com/watch?v=Rgpfk6eYxJA

https://github.com/tensorflow/models/tree/master/research/object_detection
'''
# import the necessary packages:
import sys
sys.path.append("..")
import io
import tensorflow as tf
import matplotlib.pyplot as plt
import matplotlib.image as mimg
from PIL import Image
import os
import glob
import cv2
import numpy as np
import pandas as pd
from pathlib import Path
import xml.etree.ElementTree as ET
from models.research.object_detection.utils import dataset_util
from models.research.object_detection.utils import label_map_util
from sklearn.model_selection import train_test_split
from collections import namedtuple, OrderedDict
#*******************************************************************************************************************
# A function to parse the xml files
def read_xml(file):
    data = [] #array to store extracted values from the xml files
    # for each file
    for xml in file:
        # Geting xml
        tree = ET.parse(xml)
        # Getting the root of the xml file
        root = tree.getroot()
        # Getting every xml tag that contains objects
        for x in root.findall('object'):
            filename = root.find('filename').text#Name of the image
            width =  int((root.find('size')).find('width').text)#Width of the image
            height = int((root.find('size')).find('height').text)#Name of the image
            # coordinate of each labelled object in the xml
            bounding_box = x.find('bndbox')
            xmin = float(bounding_box.find('xmin').text)
            xmax = float(bounding_box.find('xmax').text)
            ymin = float(bounding_box.find('ymin').text)
            ymax = float(bounding_box.find('ymax').text)
            label =  x.find('name').text
            #Add values to array data
            data.append((filename, width, height, label, xmin, ymin, xmax, ymax))
    # Creating dataframe
    columns_name = ['filename', 'width', 'height', 'class', 'xmin', 'ymin', 'xmax', 'ymax']
    # Dataframe is created with the array of values extracted from each xml filw and the column names above
    df = pd.DataFrame(data=data, columns=columns_name)
    return df
#*******************************************************************************************************************
# Function to create group in the dataframe. Each image contains 1 or more objects
def make_groups(df, field=None):
    if field==None:
        field = 'filename'

    data = namedtuple('object', ['filename', 'info'])#group object by image and its annotations
    grouped = df.groupby(field)
    grouped_data = []
    for filename, x in zip(grouped.groups.keys(), grouped.groups):
        grouped_data.append(data(filename, grouped.get_group(x)))
    return grouped_data
#*******************************************************************************************************************
# Convert data into TF records (TensorFlow format)
def convert_to_tf(group, img_path, label_map_dict):
      # TensorFlow function to read images.
      with tf.gfile.GFile(os.path.join(img_path, '{}'.format(group.filename)), 'rb') as f:
          img_file = f.read()
      # Encode to bytes
      encoded_img = io.BytesIO(img_file)
      # Read the image using PIL
      img = Image.open(encoded_img)
      width, height = img.size#get size of each image
      # Encode the name of the img file
      filename = group.filename.encode('utf8')
      # format of the image
      img_format = b'jpg'   # Image in bytes
      # Dvariables for features of the TF records
      xmins = []
      xmaxs = []
      ymins = []
      ymaxs = []
      classes_text = []
      classes = []
      # Reading each group of images (image and its annotations)
      for index, row in group.info.iterrows():
          xmins.append(row['xmin'] / width)
          xmaxs.append(row['xmax'] / width)
          ymins.append(row['ymin'] / height)
          ymaxs.append(row['ymax'] / height)
          classes_text.append(row['class'].encode('utf8'))
          classes.append(label_map_dict[row['class']])

      tf_example = tf.train.Example(features=tf.train.Features(feature={
          'image/height': dataset_util.int64_feature(height),
          'image/width': dataset_util.int64_feature(width),
          'image/filename': dataset_util.bytes_feature(filename),
          'image/source_id': dataset_util.bytes_feature(filename),
          'image/encoded': dataset_util.bytes_feature(img_file),
          'image/format': dataset_util.bytes_feature(img_format),
          'image/object/bbox/xmin': dataset_util.float_list_feature(xmins),
          'image/object/bbox/xmax': dataset_util.float_list_feature(xmaxs),
          'image/object/bbox/ymin': dataset_util.float_list_feature(ymins),
          'image/object/bbox/ymax': dataset_util.float_list_feature(ymaxs),
          'image/object/class/text': dataset_util.bytes_list_feature(classes_text),
          'image/object/class/label': dataset_util.int64_list_feature(classes),}))

      return tf_example
#*******************************************************************************************************************
# Images folder
img_path = 'sketchML/training_images/'
# Label map contains the classes to be detected
label_map_dict = label_map_util.get_label_map_dict('sketchML/label_map.pbtxt')
# Using glob to read the images and xml contained in teh training images folder
images = sorted(glob.glob('sketchML/training_images/*.jpg'))
xmls = sorted(glob.glob('sketchML/training_images/*.xml'))
#printing values
print("Total number of images: ", len(images))
print("Total number of xmls: ", len(xmls))
#Call to function that reads the xml files
df = read_xml(xmls)
#Splitting dataframe into training a validation test 80% is training and 20% is validation data.
train, valid = train_test_split(df, test_size=0.2, stratify=df['class'], random_state=111)

train = train.reset_index(drop=True)
valid = valid.reset_index(drop=True)
# Converting both dataframes into CSV files
train.to_csv('sketchML/training_data/train.csv')
valid.to_csv('sketchML/training_data/valid.csv')

print("Training data lenght: ", len(train))
print("Validation data lenght ", len(valid))

writer = tf.python_io.TFRecordWriter('sketchML/records/train.record')
# Call to the group image and their data function
img_groups = make_groups(train, field='filename')
# Iterate groups to create tfrecords
for group in img_groups:
    tf_example = convert_to_tf(group, img_path, label_map_dict)
    writer.write(tf_example.SerializeToString())
# closing tensorflow writting handle
writer.close()
print(" Training TFRecords created")

# Preparing handle for TF records conversion
writer = tf.python_io.TFRecordWriter('sketchML/records/valid.record')
# Call to the group image and their data function
img_groups = make_groups(valid, field='filename')
# Iterate groups to create tfrecords
for group in img_groups:
    tf_example = convert_to_tf(group, img_path, label_map_dict)
    writer.write(tf_example.SerializeToString())
# closing tensorflow writting handle
writer.close()
print("Validation TFRecords created ")
