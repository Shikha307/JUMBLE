#!/bin/bash
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export JAVA_HOME=/opt/homebrew/opt/openjdk

echo "Starting Redis..."
cd swipe-match-service || exit
docker compose up -d redis
cd ..

echo "Starting User-Job Service..."
nohup ./mvnw spring-boot:run > user-job.log 2>&1 &
echo $! > user-job.pid

echo "Starting Swipe-Match Service..."
cd swipe-match-service || exit
nohup ../mvnw spring-boot:run > swipe-match.log 2>&1 &
echo $! > swipe-match.pid
cd ..

echo "Starting ML Worker..."
cd ml || exit
python3 -m pip install pymongo sentence-transformers torch --break-system-packages
nohup python3 matcher.py > ml-worker.log 2>&1 &
echo $! > ml-worker.pid
cd ..

echo "Starting Frontend..."
cd client || exit
npm install
nohup npm run dev > frontend.log 2>&1 &
echo $! > frontend.pid
cd ..

echo "All services started!"
