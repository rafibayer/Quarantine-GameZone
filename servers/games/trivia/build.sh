echo "building trivia server..."
env GOOS=linux go build
docker build -t amitgal17/trivia_server
go clean
echo "build done"
