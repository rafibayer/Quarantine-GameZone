import json

EMPTY = 0
X = 1
O = 2

# This class represents a game of tic-tac-toe
class Game:

    def __init__(self):
        self.outcome = ""
        self.x_turn = True
        self.board = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]]

    # trys to make the current players move at x, y
    # if illegal, raise ValueError
    # after the move is made, checks the games outcome
    # and updates it if the game has ended
    def move(self, x, y):

        # checks if game is already over
        if self.outcome != "":
            raise ValueError("Game is already over.")
        # check if move is inbounds
        if not (0 <= x <= 2) or not (0 <= y <= 2):
            raise ValueError("Move is out of bounds.")
        # check if move is in empty space
        if self.board[y][x] != EMPTY:
            raise ValueError("Space is already occupied.")

        # takes move, flips turn, checks if game is over now
        self.board[y][x] = X if self.x_turn else O
        self.x_turn = not self.x_turn
        self.check_outcome()

    # checks if the game has ended due to win or draw
    # updates self.outcome if over
    def check_outcome(self):       
        # for both players... 
        for p in [X,O]:
            # check rows
            for row in self.board:
                if row == [p,p,p]:
                    self.outcome = self.val_str(p)
                    return

            # check columns
            for c in range(3):
                col = [row[c] for row in self.board]
                if col == [p,p,p]:
                    self.outcome = self.val_str(p)
                    return

            # check diags
            b = self.board
            if b[0][0]==b[1][1]==b[2][2]==p:
                self.outcome = self.val_str(p)
                return

            if b[0][2]==b[1][1]==b[2][0]==p:
                self.outcome = self.val_str(p)
                return

        # check for remaining possible moves
        for row in self.board:
            if 0 in row:
                return
        
        # otherwise game is a draw
        self.outcome = "draw"
        return

    # return a dict representation of the gamestate
    def to_dict(self):
        res = dict()
        res["outcome"] = self.outcome
        res["turn"] = self.val_str(X) if self.x_turn else self.val_str(O)
        res["board"] = self.__str__()
        return res

    # return a string representation 
    # of the current game state
    def __str__(self):
        return '\n'.join([' '.join([Game.val_str(item) for item in row]) for row in self.board])

    # returns a string representation of a value on the board
    # used to create a pretty representation of the board with X's and O's
    @staticmethod
    def val_str(val):
        return {EMPTY: "_", X: "X", O: "O"}[val]

# Change this to true and run this module
# to test the game in your console
DEBUG_TEST=False
if DEBUG_TEST:
    import warnings
    import sys
    warnings.warn("WARNING: In Debug Mode")
    g = Game()
    print(f"Object size: {str(sys.getsizeof(g))} bytes")
    print(f"json:\n{g.__json__()}")
    while g.outcome == "":
        print(g)
        try:
            mv = input("r c:").split(" ")
            g.move(int(mv[1]), int(mv[0]))
        except Exception as e:
            print("illegal move: "  + e.__str__())

    print(g)
    print("outcome: " + g.outcome)
    print(f"json:\n{g.__json__()}")


    
