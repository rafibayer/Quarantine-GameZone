export DOCKERUSER=rbayer

./build.sh

docker push $DOCKERUSER/gamezone_client

ssh -i ~/.ssh/aws ec2-user@rafibayer.me << EOF
    docker pull $DOCKERUSER/gamezone_client

    docker rm -f gamezone_client

    docker run  \
    -d \
    -p 80:80 \
    --name gamezone_client \
    $DOCKERUSER/gamezone_client

EOF