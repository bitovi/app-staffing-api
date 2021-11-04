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

The migrations need to run before you'll be able to debug the tests. Run `npm test` and all of your dreams will come true.
