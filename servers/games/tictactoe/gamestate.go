package main

import (
	"errors"
	"fmt"
	"net/http"
)

// Constants for board tokens
const empty = 0
const x = 1
const o = 2

// InProgress :game outcome for game still being player
const InProgress = "In-Progress"

// TicTacToe struct holds gamestate information for a game of tic tac toe
type TicTacToe struct {
	Board   [3][3]int `json:"Board"`
	Xturn   bool      `json:"xturn"`
	Xid     string    `json:"xid"`
	Oid     string    `json:"oid"`
	Xname   string    `json:"xname"`
	Oname   string    `json:"oname"`
	Outcome string    `json:"outcome"`
}

// NewTicTacToe returns a pointer to a new TicTacToe struct
// for players X and O given their ID's
func NewTicTacToe(xid string, oid string) *TicTacToe {

	client := &http.Client{}
	xname, err := GetNickname(xid, client)
	if err != nil {
		return nil
	}
	oname, err := GetNickname(xid, client)
	if err != nil {
		return nil
	}
	return &TicTacToe{
		[3][3]int{
			{empty, empty, empty},
			{empty, empty, empty},
			{empty, empty, empty},
		},
		true,
		xid,
		oid,
		xname,
		oname,
		InProgress,
	}
}

// returns the outcome of a game if the game is over
// otherwise returns "In-Progress"
func (game *TicTacToe) checkResult() string {

	for _, player := range []int{x, o} {

		// rows
		for _, row := range game.Board {
			if all(row[:], player) {
				return fmt.Sprintf("%d has won", player)
			}
		}

		// columns
		for i := 0; i < 3; i++ {
			if all(col(game, i), player) {
				return fmt.Sprintf("%d has won", player)
			}
		}

		//diagonal
		diag := []int{game.Board[0][0], game.Board[1][1], game.Board[2][2]}
		if all(diag, player) {
			return fmt.Sprintf("%d has won", player)
		}

		//anti-diagonal
		antidiag := []int{game.Board[0][2], game.Board[1][1], game.Board[2][0]}
		if all(antidiag, player) {
			return fmt.Sprintf("%d has won", player)
		}
	}

	// check for remaining possible moves
	for _, row := range game.Board {
		if contains(row[:], empty) {
			return InProgress
		}
	}
	return "Draw"
}

// Move attemps to make a move
// given a row, column, and player.
// if possible, board will be updated
// otherwise error will be returned
// indicating problem
func (game *TicTacToe) Move(row int, col int, player int) error {
	// make move and modify game if legal
	if (player != x && game.Xturn) || (player != o && !game.Xturn) {
		return errors.New("It is not this players turn")
	}

	if (row < 0 || row > 2) || (col < 0 || col > 2) {
		return errors.New("Move out of bounds")
	}

	if game.Board[row][col] != empty {
		return errors.New("This space is occupied")
	}

	// update board
	game.Board[row][col] = player
	// flip turns
	game.Xturn = !game.Xturn
	// check if game has ended
	game.Outcome = game.checkResult()

	return nil
}

// returns true if all elements in vs equal player
func all(vs []int, player int) bool {
	for _, e := range vs {
		if player != e {
			return false
		}
	}
	return true
}

// returns true if vs contains token
func contains(vs []int, token int) bool {
	for _, e := range vs {
		if e == token {
			return true
		}
	}
	return false
}

// returns board column col from game
func col(game *TicTacToe, col int) []int {
	column := make([]int, 0)
	for _, row := range game.Board {
		column = append(column, row[col])
	}
	return column
}
