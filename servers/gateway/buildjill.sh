echo "building gateway server..."
env GOOS=linux go build
docker build -t amitgal17/gamezone_gateway .
go clean
echo "build done"
