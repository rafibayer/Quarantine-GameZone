./build.sh

docker rm -f gamezone_mongo
docker run -d \
--name gamezone_mongo \
--network customNet \
mongo

docker rm -f gamezone_trivia
docker run -d \
--network customNet \
--name gamezone_trivia \
amitgal17/gamezone_trivia


