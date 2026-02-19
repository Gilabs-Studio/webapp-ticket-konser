package middleware

import (
	"bytes"

	"github.com/gin-gonic/gin"
)

type bodyCaptureWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func newBodyCaptureWriter(w gin.ResponseWriter) *bodyCaptureWriter {
	return &bodyCaptureWriter{ResponseWriter: w, body: &bytes.Buffer{}}
}

func (w *bodyCaptureWriter) Write(b []byte) (int, error) {
	_, _ = w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func (w *bodyCaptureWriter) WriteString(s string) (int, error) {
	_, _ = w.body.WriteString(s)
	return w.ResponseWriter.WriteString(s)
}

func (w *bodyCaptureWriter) BodyBytes() []byte {
	if w.body == nil {
		return nil
	}
	return w.body.Bytes()
}
