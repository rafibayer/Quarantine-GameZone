package handlers

// Endpoints is a map user to convert between
// gametypes and endpoints for their services
var Endpoints = map[string]string{
	"tictactoe": "http://gamezone_tictactoe:80/v1/tictactoe",
	"trivia":    "http://gamezone_trivia:4000/v1/trivia",
}

// GameCapacity maintains a map
// of player capacities for each game supported
var GameCapacity = map[string]int{
	"tictactoe": 2,
	"trivia":    2,
}
