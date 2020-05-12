import tictactoe
import random
import string


# Game Lobby model:
# lobbyID: str[LOBBY_ID_LENGTH]
# xPlayerID: int? (depends on DB)
# oPlayerID: int? (depends on DB)
# game: Tic-tac-toe game

LOBBY_ID_LENGTH=8

# this class can manage multiple
# simultaneous games of tic tac toe
class Manager:

    def __init__(self):
        self.games = dict()


    # creates a new lobby in memory and returns
    # an object representation according to the model above
    # returns the lobbyID of the new lobby
    def new_lobby(self, xPlayerID, oPlayerID):
        # generate a new ID for the lobby
        lobbyID = Manager.new_lobby_id(LOBBY_ID_LENGTH)

        # create a new game
        lobby = dict()
        lobby["xPlayerID"] = str(xPlayerID)
        lobby["oPlayerID"] = str(oPlayerID)
        lobby["game"] = tictactoe.Game()

        # store the game
        self.games[lobbyID] = lobby
        return lobbyID

    # deletes the lobby with the given
    # lobbyID if it exists, otherwise raises KeyError
    def del_lobby(self, lobbyID):
        if lobbyID in self.games:
            del self.games[lobbyID]
        else:
            raise KeyError(f"No lobby found with id: {lobbyID}")

    # returns a reference to the lobby with the given
    # lobbyID if it exists, otherwise raises KeyError
    def get_lobby(self, lobbyID):
        if lobbyID in self.games:
            return self.games[lobbyID]
        else:
            raise KeyError(f"No lobby found with id: {lobbyID}")


    # return a new random lobby ID of given length
    @staticmethod
    def new_lobby_id(length):
        usable = string.ascii_lowercase + string.digits
        return ''.join(random.choice(usable) for _ in range(length))


DEBUG_TEST=False
if DEBUG_TEST:
    import time
    import warnings
    import sys
    warnings.warn("WARNING: In Debug Mode")
    n_lobbies=100000
    m = Manager()
    t_start = time.time()
    for _ in range(n_lobbies):
        m.new_lobby("abc", "123")
    print(f"Created {n_lobbies} lobbies in {time.time()-t_start} seconds")
    print(f"space used: ~{sys.getsizeof(m.games)/1000000} MB")

