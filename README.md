# These are extra files in the repository...





#app-staffing-api

Backend for https://github.com/bitovi/app-staffing/

## Run Application


### Kubernetes Local
See the ops repo:
https://github.com/bitovi/operations-staffing-app/blob/main/_scripts/local/README.md

### Docker Compose
``` sh
docker compose up --build
```

> The Node.js server listens on port 4000 and for debugging the [Inspector client](https://nodejs.org/en/docs/guides/debugging-getting-started/) must be attached to the host and port 127.0.0.1:9230


#### Connect to the Docker app's shell

```sh
docker compose exec api bash
```

## Testing

The migrations need to run before you'll be able to debug the tests.
Run `npm run pretest`
then run `npm run seed`
then run `npm run test` and all of your dreams will come true.


## Open the docs

Once you have the app running, as noted above, you can read the documentation at `/docs`.
