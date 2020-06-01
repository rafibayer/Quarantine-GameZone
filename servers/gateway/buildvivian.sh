echo "building gateway server..."
env GOOS=linux go build
docker build -t viviancarolinehua/gamezone_gateway .
go clean
echo "build done"
