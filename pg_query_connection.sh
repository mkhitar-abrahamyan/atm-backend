#!/bin/bash

CONTAINER_NAME=atm_postgres
DB_NAME=atm
DB_USER=postgres

echo "Connecting to PostgreSQL in container: $CONTAINER_NAME ..."
docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME

# Path to script
# cd /mnt/c/Users/mxosa/OneDrive/'Рабочий стол'/Projects/atm-backend