echo "Building tic tac toe server"
env GOOS=linux go build
docker build -t viviancarolinehua/gamezone_tictactoe .
go clean

