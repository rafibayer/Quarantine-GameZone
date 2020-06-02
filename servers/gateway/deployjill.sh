#pls ignore for a bit

docker rm -f rabbit
docker run -d \
  --name rabbit \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management