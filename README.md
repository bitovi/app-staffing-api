# These are extra files in the repository...





#app-staffing-api-scaffold

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
