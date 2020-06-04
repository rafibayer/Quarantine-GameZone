echo "DEPLOYING LOCALLY"

./build.sh

docker rm -f gamezone_gateway
docker rm -f gamezone_redis
docker rm -f gamezone_tictactoe


export REDISADDR=gamezone_redis:6379
export TLSKEY=LOCALDEPLOY
export TSLCERT=LOCALDEPLOY
export SESSKEY=mysesskey

docker network rm customNet
docker network create customNet


docker run -d \
--name gamezone_redis \
--network customNet \
redis

docker run -d \
-e ADDR=:80 \
-e REDISADDR=gamezone_redis:6379 \
--name gamezone_tictactoe \
--network customNet \
rbayer/gamezone_tictactoe

docker run -d -p 80:80 \
-e ADDR=:80 \
-e REDISADDR=gamezone_redis:6379 \
-e TLSKEY=$TLSKEY \
-e TLSCERT=$TLSCERT \
-e SESSIONKEY=$SESSKEY \
--name gamezone_gateway \
--network customNet \
rbayer/gamezone_gateway

docker logs gamezone_gateway

echo "Done!"