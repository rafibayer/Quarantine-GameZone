echo "Building tic tac toe server"
env GOOS=linux go build
docker build -t rbayer/gamezone_tictactoe .
go clean

