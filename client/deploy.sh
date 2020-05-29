echo "DEPLOYING LOCALLY"

docker rm -f gamezone_client

docker run  \
-d \
-p 3000:3000 \
--name gamezone_client \
--network customNet \
viviancarolinehua/gamezone_client

echo "Done!"