echo "building gateway server..."
env GOOS=linux go build
docker build -t rbayer/gamezone_gateway .
go clean
echo "build done"
