# Rungika

## API documentation

Swagger UI: http://localhost:8080/swagger-ui/index.html

## Run the Spring Boot backend

```bash
mvn clean spring-boot:run
```

## Update and deploy

1. Run `gradle build`
2. Push the `main` branch to the remote Git repository
3. After a few minutes, changes are deployed to https://rungika.onrender.com (managed in the [Render dashboard](https://dashboard.render.com/))

## Image upload and retrieval tutorial

https://www.javainuse.com/fullstack/imageupload

## Deploy Angular with Spring Boot in the same executable JAR

https://marco.dev/angular-with-java

## Docker

```bash
docker build -t nikuzejl/rungika-server:latest .
docker run -p 10000:10000 nikuzejl/rungika-server:latest
```

## Troubleshooting 403 errors

https://community.render.com/t/direct-link-403-issue/9374/3

## Other links

- https://www.youtube.com/watch?v=KxqlJblhzfI&t=10s
- https://www.youtube.com/watch?v=o8DEk4XGcZw
- https://github.com/bezkoder/angular-16-jwt-auth
- https://github.com/bezkoder/spring-boot-login-mongodb
