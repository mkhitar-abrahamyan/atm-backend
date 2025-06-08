#!/bin/bash
docker-compose up -d
echo "Waiting for Postgres to be ready..."
sleep 5
docker exec -i atm_postgres psql -U postgres -d atm < scripts/init.sql
echo "DB initialized!"
