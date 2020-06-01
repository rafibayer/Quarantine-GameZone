echo "Building tic tac toe server"
env GOOS=linux go build
docker build -t amitgal17/gamezone_tictactoe .
go clean

