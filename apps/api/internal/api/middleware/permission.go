package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/role"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/errors"
)

// RequirePermission creates a middleware that checks if the user's role has the required permission
func RequirePermission(permissionCode string, roleRepo role.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleID, exists := c.Get("role_id")
		if !exists {
			errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
				"reason": "Role ID not found in context",
			}, nil)
			c.Abort()
			return
		}

		roleIDStr, ok := roleID.(string)
		if !ok || roleIDStr == "" {
			errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
				"reason": "Invalid role ID",
			}, nil)
			c.Abort()
			return
		}

		hasPermission, err := roleRepo.HasPermission(roleIDStr, permissionCode)
		if err != nil {
			errors.InternalServerErrorResponse(c, "")
			c.Abort()
			return
		}

		if !hasPermission {
			errors.ErrorResponse(c, "FORBIDDEN", map[string]interface{}{
				"required_permission": permissionCode,
				"reason":             "Insufficient permissions",
			}, nil)
			c.Abort()
			return
		}

		c.Next()
	}
}




