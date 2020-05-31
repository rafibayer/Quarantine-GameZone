package gamesessions

import (
	"encoding/json"
	"log"
	"time"

	"github.com/go-redis/redis"
)

//RedisStore represents a session.Store backed by redis.
type RedisStore struct {
	//Redis client used to talk to redis server.
	Client *redis.Client
	//Used for key expiry time on redis.
	SessionDuration time.Duration
}

const hash string = "hash"

//NewRedisStore constructs a new RedisStore
func NewRedisStore(client *redis.Client, sessionDuration time.Duration) *RedisStore {
	//initialize and return a new RedisStore struct

	return &RedisStore{
		Client:          client,
		SessionDuration: sessionDuration,
	}
}

//Store implementation

//Save saves the provided `SessionState` and associated SessionID to the store.
//The `SessionState` parameter is typically a pointer to a struct containing
//all the data you want to associated with the given SessionID.
func (rs *RedisStore) Save(sid GameSessionID, GameLobbyState interface{}) error {

	// convert the session state into jsom
	json, err := json.Marshal(GameLobbyState)
	if err != nil {
		return err
	}

	// save the session id and state in the redis store
	rs.Client.Set(sid.getRedisKey(), json, rs.SessionDuration)
	//rs.Client.HSet(hash, sid.getRedisKey(), json)
	return nil
}

//Get populates `SessionState` with the data previously saved
//for the given SessionID
func (rs *RedisStore) Get(sid GameSessionID, GameLobbyState interface{}) error {

	// open a connection to redis
	pipe := rs.Client.Pipeline()

	// queue both the get and expire commands
	getResp := pipe.Get(sid.getRedisKey())
	expireResp := pipe.Expire(sid.getRedisKey(), rs.SessionDuration)

	// execute both and get results
	pipe.Exec()
	val, err := getResp.Result()

	// close connection
	pipe.Close()

	if err == redis.Nil {
		return ErrStateNotFound
	}

	if err := expireResp.Err(); err != nil {
		return err
	}

	err = json.Unmarshal([]byte(val), GameLobbyState)
	if err != nil {
		return err
	}

	return nil
}

//Delete deletes all state data associated with the SessionID from the store.
func (rs *RedisStore) Delete(sid GameSessionID) error {

	// delete the session from the redis store
	result := rs.Client.Del(sid.getRedisKey())
	if err := result.Err(); err != nil {
		return err
	}

	return nil
}

// GetAll returns all state data
func (rs *RedisStore) GetAll(GameLobbyStates []interface{}) error {
	//get all keys with prefix
	keys, err := rs.Client.Keys("lid:*").Result()
	if err != nil {
		return err
	}

	// values := rs.Client.HGetAll(hash)
	// results := make([]*redis.StringCmd, 0)
	// var lobby interface{}
	// err := json.Unmarshal(values.Bytes(), lobby)
	// if err != nil {
	// 	return err
	// }
	// log.Print("inside reddis store, printing values")
	// log.Println(values)

	log.Print("inside reddis store, printing keys")
	log.Println(keys)

	pipe := rs.Client.Pipeline()

	results := make([]*redis.StringCmd, 0)

	// get all values for those keys
	for _, key := range keys {
		log.Print("inside reddis store, printing each key")
		log.Println(key)
		str := []byte("[")
		if key[0] != str[0] {
			results = append(results, rs.Client.Get(key))
		}
	}

	_, err = pipe.Exec()
	if err != nil {
		return err
	}

	// close connection
	pipe.Close()

	log.Print("inside reddis store, printing results")
	log.Println(results)

	// Unmarshal and append to interface
	for _, val := range results {
		var lobby interface{}
		// bytes, err := val.Bytes()
		// if err != nil {
		// 	return err
		// }
		log.Println("143")
		values, err := val.Result()
		if err == redis.Nil {
			return ErrStateNotFound
		}
		log.Println("150")
		log.Println(values)

		bytes := []byte(values)
		err = json.Unmarshal(bytes, &lobby)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		log.Println("150")
		log.Println(lobby)
		var lobbyStates []interface{}
		lobbyStates = append(lobbyStates, lobby)
		log.Println("150")
		log.Println(lobbyStates)
		// err = json.Unmarshal([]byte((fmt.Sprintf("%v", (lobbyStates)))), &GameLobbyStates)
		// if err != nil {
		// 	log.Println(err.Error())
		// 	return err
		// }

		GameLobbyStates = lobbyStates
		log.Println("151")
		log.Println(GameLobbyStates)

	}

	log.Print("prints gamelobbystate")
	log.Println(GameLobbyStates)
	return nil

}

//getRedisKey() returns the redis key to use for the SessionID
func (gid GameSessionID) getRedisKey() string {
	//convert the SessionID to a string and add the prefix "sid:" to keep
	//SessionID keys separate from other keys that might end up in this
	//redis instance
	return "lid:" + gid.String()
}

//either continue with the get all keys method or use the hash to get all
// the problem is though that the hash
