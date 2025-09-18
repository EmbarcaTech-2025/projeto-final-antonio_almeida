# Use Java 17 (Amazon Corretto)
FROM amazoncorretto:17.0.5-al2022-RC-headless

WORKDIR /app

# Copia o .jar (dentro de back/target)
COPY back/target/dataharbor-iot-0.0.1-SNAPSHOT.jar /app/

EXPOSE 8090

ENTRYPOINT ["java", "-Dspring.profiles.active=dev", "-jar", "dataharbor-iot-0.0.1-SNAPSHOT.jar"]

