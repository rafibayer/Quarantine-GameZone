# add the necessary instructions
# to create a Docker container image
# for your Go API gateway server
FROM alpine
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
COPY gateway gateway
RUN update-ca-certificates
EXPOSE 443
ENTRYPOINT [ "/gateway" ]