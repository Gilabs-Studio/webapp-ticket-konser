package upload

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

func extensionFromContentType(contentType string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(contentType)) {
	case "image/jpeg", "image/jpg":
		return ".jpg", true
	case "image/png":
		return ".png", true
	case "image/webp":
		return ".webp", true
	default:
		return "", false
	}
}

func randomHex(bytesLength int) (string, error) {
	b := make([]byte, bytesLength)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// GenerateImageFilename returns a server-controlled filename for an image upload.
// The extension is derived from the sniffed content-type.
func GenerateImageFilename(contentType string) (string, error) {
	ext, ok := extensionFromContentType(contentType)
	if !ok {
		return "", fmt.Errorf("unsupported image content-type: %s", contentType)
	}

	token, err := randomHex(16)
	if err != nil {
		return "", fmt.Errorf("failed to generate random filename: %w", err)
	}

	return fmt.Sprintf("%d_%s%s", time.Now().Unix(), token, ext), nil
}
