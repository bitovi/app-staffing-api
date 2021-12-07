#!/bin/sh

# TODO
# if in kubernetes context
    # while true
        # check for postgres
        # if postgres is turned on
            # break
        # else
            # sleep 5


npm run migrate

# TODO: move seed to a helm job to enable conditionally
npm run seed 

node src/app.js