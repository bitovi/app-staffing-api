# app-staffing-api

Backend for https://github.com/bitovi/app-staffing/

## Run Application


### Kubernetes Local
See the ops repo: 
https://github.com/bitovi/operations-staffing-app/blob/local-poc/_scripts/local/README.md

Will move to when [this PR](https://github.com/bitovi/operations-staffing-app/pull/7) is merged:
https://github.com/bitovi/operations-staffing-app/blob/main/_scripts/local/README.md

### Docker Compose
``` sh
docker compose up --build
```

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
