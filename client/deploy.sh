export DOCKERUSER=rbayer

./build.sh

docker push $DOCKERUSER/gamezone_client

ssh -i ~/.ssh/aws ec2-user@rafibayer.me << EOF
    docker pull $DOCKERUSER/gamezone_client

    docker rm -f gamezone_client

    docker run  \
    -d \
    -p 443:443 -p 80:80 \
    -v /etc/letsencrypt/:/etc/letsencrypt/:ro \
    --name gamezone_client \
    $DOCKERUSER/gamezone_client

EOF