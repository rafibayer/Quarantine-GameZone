package gamesessions

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
)

//InvalidGameSessionID represents an empty, invalid session ID
const InvalidGameSessionID GameSessionID = ""

//idLength is the length of the ID portion
const idLength = 32

//signedLength is the full length of the signed session ID
//(ID portion plus signature)
const signedLength = idLength + sha256.Size

//GameSessionID represents a valid, digitally-signed session ID.
//This is a base64 URL encoded string created from a byte slice
//where the first `idLength` bytes are crytographically random
//bytes representing the unique session ID, and the remaining bytes
//are an HMAC hash of those ID bytes (i.e., a digital signature).
//The byte slice layout is like so:
//+-----------------------------------------------------+
//|...32 crypto random bytes...|HMAC hash of those bytes|
//+-----------------------------------------------------+
type GameSessionID string

//ErrInvalidID is returned when an invalid session id is passed to ValidateID()
var ErrInvalidID = errors.New("Invalid GameSession ID")

//NewSessionID creates and returns a new digitally-signed session ID,
//using `signingKey` as the HMAC signing key. An error is returned only
//if there was an error generating random bytes for the session ID
func NewSessionID(signingKey string) (GameSessionID, error) {

	// if `signingKey` is zero-length, return InvalidSessionID
	// and an error indicating that it may not be empty
	if len(signingKey) == 0 {
		return InvalidGameSessionID, errors.New("Signing key may not be empty")
	}

	// Generate a new digitally-signed SessionID that follows the spec of SessionID
	sessID := make([]byte, idLength)
	_, err := rand.Read(sessID)
	if err != nil {
		return InvalidGameSessionID, err
	}

	h := hmac.New(sha256.New, []byte(signingKey))
	h.Write(sessID)
	signature := h.Sum(nil)
	sessID = append(sessID, signature...)
	signedGameSessID := base64.URLEncoding.EncodeToString(sessID)

	return GameSessionID(signedGameSessID), nil
}

//ValidateID validates the string in the `id` parameter
//using the `signingKey` as the HMAC signing key
//and returns an error if invalid, or a SessionID if valid
func ValidateID(id string, signingKey string) (GameSessionID, error) {

	// decode the id string back into a byte-slice
	decodedID, err := base64.URLEncoding.DecodeString(id)
	if err != nil {
		return InvalidGameSessionID, err
	}

	// extract the id and the expected signautre
	sessID := decodedID[:idLength]
	expected := decodedID[idLength:]

	h := hmac.New(sha256.New, []byte(signingKey))

	_, writeErr := h.Write(sessID)
	if writeErr != nil {
		return InvalidGameSessionID, writeErr
	}

	// calculate the actual signature
	signature := h.Sum(nil)

	// compare the expected and actual signatures
	if hmac.Equal(expected, signature) {
		return GameSessionID(id), nil
	}

	// if they don't match, the signature is invalid
	return InvalidGameSessionID, ErrInvalidID
}

//String returns a string representation of the sessionID
func (sid GameSessionID) String() string {
	return string(sid)
}
