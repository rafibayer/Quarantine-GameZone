package sessions

import (
	"encoding/json"
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
func (rs *RedisStore) Save(sid SessionID, SessionState interface{}) error {

	// convert the session state into jsom
	json, err := json.Marshal(SessionState)
	if err != nil {
		return err
	}

	// save the session id and state in the redis store
	rs.Client.Set(sid.getRedisKey(), json, rs.SessionDuration)

	return nil
}

//Get populates `SessionState` with the data previously saved
//for the given SessionID
func (rs *RedisStore) Get(sid SessionID, SessionState interface{}) error {

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

	err = json.Unmarshal([]byte(val), SessionState)
	if err != nil {
		return err
	}

	return nil
}

//Delete deletes all state data associated with the SessionID from the store.
func (rs *RedisStore) Delete(sid SessionID) error {

	// delete the session from the redis store
	result := rs.Client.Del(sid.getRedisKey())
	if err := result.Err(); err != nil {
		return err
	}

	return nil
}

//getRedisKey() returns the redis key to use for the SessionID
func (sid SessionID) getRedisKey() string {
	//convert the SessionID to a string and add the prefix "sid:" to keep
	//SessionID keys separate from other keys that might end up in this
	//redis instance
	return "sid:" + sid.String()
}
