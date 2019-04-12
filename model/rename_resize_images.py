'''
Victor Gonzalez - D16123580 - DT228
This file renames multiple images contained in a directory from 1 to the last image.
It also resizes every image to a given width and height.
This script is important for the data prepartion of the dataset. Images named from 1 to x will be easier to identify.
Smaller images are easuer to process by the machine learning model.
'''
# import the necessary packages:
import os
import cv2
import glob
#*******************************************************************************************************************
# Function to rename multiple files
def rename_img(dirn):
    i = 0
    #for every image contained in the directory
    for filename in os.listdir(dirn):
        dst =str(i) + ".jpg"#grab each image
        src ='images/'+ filename
        dst ='images/'+ dst# destination
        os.rename(src, dst)# rename image
        i += 1
#*******************************************************************************************************************
# Function to resize images
def resize_img(dirn,w,h):
# Get all the images contained in a folder using the glob library
    imgs = glob.glob(dirn + '/' + '*.jpg')
    #for every image contained in the directory
    for img in imgs:
        I = cv2.imread(img)#read image
        h = int(w * I.shape[0] / I.shape[1])#calculate height according to width
        resized = cv2.resize(I,(w,h))#resize image
        cv2.imwrite(img ,resized)#write images to a file. This function will replace the images in the same folder.
#*******************************************************************************************************************
# Calling both functions
rename_img("images")#passing the name of the folder
resize_img("images",600,600)
