#!/bin/bash

 npm i -g nodemon 
 npm run migrate 
 npm run seed 
 nodemon --inspect=0.0.0.0:9229 /usr/src/app/src/app.js

