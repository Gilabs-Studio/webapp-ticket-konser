package seeders

// SeedAll runs all seeders for auth
func SeedAll() error {
	// Seed roles first (required for users)
	if err := SeedRoles(); err != nil {
		return err
	}

	// Seed users (requires roles)
	if err := SeedUsers(); err != nil {
		return err
	}

	return nil
}
