#!/bin/bash

# docker run -d --name timescaledb -p 5432:5432 -e POSTGRES_PASSWORD=password timescale/timescaledb-ha:pg17
# docker exec -it timescaledb psql -d "postgres://postgres:password@localhost/postgres"

# docker run -d --name myredis -p 6379:6379 redis
# docker exec -it myredis redis-cli

if [ "$1" = "timescale" ]; then 
    echo "Starting Timescale container..."
    sudo docker start f0ba7665e0c2
    sudo docker exec -it timescaledb psql -d "postgres://postgres:password@localhost/postgres"

elif [ "$1" = "redis" ]; then
    echo "Starting Redis container..."
    sudo docker start 4da4fc818d37
    sudo docker exec -it 4da4fc818d37 redis-cli

else
    echo "Usage: $0 [timescale|redis]"
fi
