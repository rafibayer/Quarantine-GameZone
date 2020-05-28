package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCors(t *testing.T) {

	cases := []struct {
		name   string
		method string
	}{
		{
			"method options",
			http.MethodOptions,
		},
		{
			"other method",
			http.MethodGet,
		},
	}

	for _, c := range cases {
		respRec := httptest.NewRecorder()
		req, _ := http.NewRequest(c.method, "localhost/test", nil)

		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Hello, world!"))
			if w.Header().Get("Access-Control-Allow-Origin") != "*" {
				t.Error("Missing Access-Control-Allow-Origin: * header")
			}
			if w.Header().Get("Access-Control-Allow-Methods") != "GET, PUT, POST, PATCH, DELETE" {
				t.Error("Missing Access-Control-Allow-Methods: GET, PUT, POST, PATCH, DELETE header")
			}
			if w.Header().Get("Access-Control-Allow-Headers") != "Content-Type, Authorization" {
				t.Error("Missing Access-Control-Allow-Headers: Content-Type, Authorization header")
			}
			if w.Header().Get("Access-Control-Expose-Headers") != "Authorization" {
				t.Error("Missing Access-Control-Expose-Headers: Authorization header")
			}
			if w.Header().Get("Access-Control-Max-Age") != "600" {
				t.Error("Missing Access-Control-Max-Age: 600 header")
			}
		})
		test := NewCorsHandler(handler)
		test.ServeHTTP(respRec, req)
	}

}
