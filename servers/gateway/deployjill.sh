echo "DEPLOYING LOCALLY"

./buildjill.sh

docker rm -f gamezone_gateway
docker rm -f gamezone_redis
docker rm -f gamezone_tictactoe
docker rm -f gamezone_rabbit

export REDISADDR=gamezone_redis:6379
export TLSKEY=LOCALDEPLOY
export TSLCERT=LOCALDEPLOY
export SESSKEY=mysesskey
export RABBITADDR=amqp://gamezone_rabbit:5672
export RABBITNAME="gamezone_rabbit"

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
  janguy/gamezone_tictactoe

docker run -d \
  --name gamezone_rabbit \
  --network customNet \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

docker run -d -p 80:80 \
  -e ADDR=:80 \
  -e REDISADDR=gamezone_redis:6379 \
  -e TLSKEY=$TLSKEY \
  -e TLSCERT=$TLSCERT \
  -e SESSIONKEY=$SESSKEY \
  -e RABBITADDR=$RABBITADDR \
  -e RABBITNAME=$RABBITNAME \
  --name gamezone_gateway \
  --network customNet \
  --restart unless-stopped \
  janguy/gamezone_gateway

docker logs gamezone_gateway

echo "Done!"