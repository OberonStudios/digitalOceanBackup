import face_recognition
from PIL import Image, ImageDraw
import sys
import os

SCALE_H = .1
SCALE_W = .1

my_file = str(sys.argv[1])
# my_file='photo-1544979703428.jpeg'

in_image = face_recognition.load_image_file('showroom/avatar_cropper/media/'+my_file)

out_image = Image.fromarray(in_image)

out_image_w, out_image_h = out_image.size

face_locations = face_recognition.face_locations(in_image)

for (top, right, bottom, left) in face_locations:
    if(out_image_h>out_image_w):
      out_image=out_image.crop((left-(out_image_h*SCALE_H), top-(out_image_h*SCALE_H), right+(out_image_h*SCALE_H), bottom+(out_image_h*SCALE_H)))
    else:
      out_image=out_image.crop((left-(out_image_w*SCALE_W), top-(out_image_w*SCALE_W), right+(out_image_w*SCALE_W), bottom+(out_image_w*SCALE_W)))

out_image.save('showroom/avatar_cropper/media/'+my_file)
