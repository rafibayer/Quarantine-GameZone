echo "building gateway server..."
env GOOS=linux go build
docker build -t $DOCKERUSER/gamezone_gateway .
go clean
echo "build done"
