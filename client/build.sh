env GOOS=linux go build
docker build -t viviancarolinehua/gamezone_client .
go clean
