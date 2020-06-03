./build.sh
docker rm -f gamezone_trivia
docker run -d \
--network customNet \
--name gamezone_trivia \
amitgal17/gamezone_trivia