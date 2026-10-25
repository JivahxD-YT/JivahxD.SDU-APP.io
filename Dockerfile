FROM node:24-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9.11-eclipse-temurin-25 AS backend-build
WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
COPY --from=frontend-build /workspace/frontend/dist/sdu-frontend/browser backend/src/main/resources/static
RUN mvn -f backend/pom.xml verify

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/sdu-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
