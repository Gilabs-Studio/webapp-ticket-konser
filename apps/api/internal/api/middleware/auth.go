package middleware

import (
	"strings"

	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT token and sets user info in context
func AuthMiddleware(jwtManager *jwt.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			errors.UnauthorizedResponse(c, "token missing")
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			errors.UnauthorizedResponse(c, "invalid token format")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Validate token
		claims, err := jwtManager.ValidateToken(tokenString)
		if err != nil {
			if err == jwt.ErrExpiredToken {
				errors.ErrorResponse(c, "TOKEN_EXPIRED", nil, nil)
			} else {
				errors.ErrorResponse(c, "TOKEN_INVALID", nil, nil)
			}
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("role_id", claims.RoleID)

		c.Next()
	}
}
