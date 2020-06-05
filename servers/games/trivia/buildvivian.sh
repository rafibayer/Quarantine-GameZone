echo "Building tic trivia server"
env GOOS=linux go build
docker build -t viviancarolinehua/gamezone_trivia .
go clean

