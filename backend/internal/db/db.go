package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func Connect(dsn string) (*sql.DB, error) {
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	fmt.Printf("DEBUG: Connecting to: %s\n", dsn)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("cannot ping database: %v", err)
	}

	// Fix search_path
	_, err = db.Exec("SET search_path TO public")
	if err != nil {
		return nil, fmt.Errorf("cannot set search_path: %v", err)
	}

	// Cek database aktif
	var dbName, schemaName string
	db.QueryRow("SELECT current_database(), current_schema()").Scan(&dbName, &schemaName)
	fmt.Printf("DEBUG: Connected to database: %s, schema: %s\n", dbName, schemaName)

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}
