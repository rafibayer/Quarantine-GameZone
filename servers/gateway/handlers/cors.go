package handlers

import "net/http"

/*
  CORS Headers:

  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, PUT, POST, PATCH, DELETE
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Expose-Headers: Authorization
  Access-Control-Max-Age: 600
*/

// CorsHandler is a struct containing an HTTP handler
// it will add CORS headers to all requests that pass through
type CorsHandler struct {
	handler http.Handler
}

// ServeHTTP will add CORS headers to all requests
// and pass the request on to the handler
func (ch *CorsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Access-Control-Max-Age", "600")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	ch.handler.ServeHTTP(w, r)
}

// NewCorsHandler creates a new CorsHandler with a given
// HTTP handler
func NewCorsHandler(handler http.Handler) *CorsHandler {
	return &(CorsHandler{handler})
}
