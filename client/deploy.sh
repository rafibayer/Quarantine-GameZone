sh ./build.sh

docker rm -f gamezone_client

docker run  \
-d \
-p 3000:80 \
--network customNet \
--name gamezone_client \
viviancarolinehua/gamezone_client