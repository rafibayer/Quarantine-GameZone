export DOCKERUSER=rbayer

export REDISADDR=gamezone_redis:6379
export TLSKEY=LOCALDEPLOY
export TSLCERT=LOCALDEPLOY
export SESSIONKEY=mysesskeyhehe

echo "OUTDATED: SERVERS CONFIGURED FOR HTTPS"
echo "exiting..."
exit

echo "DEPLOYING LIVE ON HTTP"

# gateway
./build.sh

# tic tac toe
cd ../games/tictactoe
./build.sh
# trivia
cd ../trivia
./build.sh

cd ../../gateway

docker push $DOCKERUSER/gamezone_gateway
docker push $DOCKERUSER/gamezone_tictactoe
docker push $DOCKERUSER/gamezone_trivia

ssh -i ~/.ssh/aws ec2-user@api.rafibayer.me << EOF

    
    echo "SSH SUCCEEDED"

    echo "REMOVING ALL CONTAINERS"
    docker rm -f gamezone_gateway
    docker rm -f gamezone_tictactoe
    docker rm -f gamezone_trivia
    docker rm -f gamezone_tictactoe
    docker rm -f gamezone_mongo
    docker rm -f gamezone_redis

    #echo "CLEANINING"
    #docker system prune -af

    docker pull $DOCKERUSER/gamezone_gateway
    docker pull $DOCKERUSER/gamezone_tictactoe
    docker pull $DOCKERUSER/gamezone_trivia
    

    docker network rm customNet
    docker network create customNet

    # redis
    docker run -d \
    --name gamezone_redis \
    --network customNet \
    redis

    # tictactoe
    docker run -d \
    -e ADDR=:80 \
    -e REDISADDR=gamezone_redis:6379 \
    --name gamezone_tictactoe \
    --network customNet \
    $DOCKERUSER/gamezone_tictactoe

    # mongodb
    docker run -d \
    --name gamezone_mongo \
    --network customNet \
    mongo

    # trivia
    docker run -d \
    --network customNet \
    --name gamezone_trivia \
    $DOCKERUSER/gamezone_trivia

    # gateway
    docker run -d -p 80:80 \
    -e ADDR=:80 \
    -e REDISADDR=gamezone_redis:6379 \
    -e TLSKEY=$TLSKEY \
    -e TLSCERT=$TLSCERT \
    -e SESSIONKEY=$SESSIONKEY \
    --name gamezone_gateway \
    --network customNet \
    $DOCKERUSER/gamezone_gateway

    docker logs gamezone_gateway

    echo "Done!"

EOF
