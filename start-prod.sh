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

if [ -n "$SEED_DATABASE" ]; then
    echo "Environment variable set (SEED_DATABASE). Seeding database."
    npm run seed 
fi

node src/app.js