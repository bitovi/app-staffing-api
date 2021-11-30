#!/bin/sh


# TODO: put in development build target
npm i -g nodemon


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


###
### nodemod inspect debugging.  Ideally we could do away with `--legacy-watch`
###

# https://stackoverflow.com/questions/27226653/nodemon-is-not-working-in-docker-environment
# attempt 1
# nodemon --inspect=0.0.0.0:9229 src/app.js

# attempt 2 (works!)
# https://www.npmjs.com/package/nodemon#user-content-application-isnt-restarting
nodemon --inspect=0.0.0.0:9229 --legacy-watch src/app.js

# attempt 3
# error: Starting inspector on nodemon.staffing-app.svc.cluster.local:9229 failed: address not available
# nodemon --inspect=nodemon.staffing-app.svc.cluster.local:9229 src/app.js

# attempt 4
# ping results in 100% packet loss
# nodemon --inspect=app-staffing-api.staffing-app.svc.cluster.local:9229 src/app.js


# attempt 5
# nodemon --inspect="${NODEMON_SERVICE_URL}:${NODEMON_SERVICE_PORT}" src/app.js