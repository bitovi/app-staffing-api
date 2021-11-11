# app-staffing-api

Backend for https://github.com/bitovi/app-staffing/

## Run Application

``` sh
docker compose up --build
```

## Connect to the Docker app's shell

```sh
docker compose exec api bash
```

## Testing

The migrations need to run before you'll be able to debug the tests.
Run `npm run pretest`
then run `npm run seed`
then run `npm run test` and all of your dreams will come true.
