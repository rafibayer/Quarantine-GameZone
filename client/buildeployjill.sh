npm run build

docker build -t amitgal17/gamezone_client .

docker rm -f gamezone_client

docker run  \
  -d \
  -p 3000:80 \
  --network customNet \
  --name gamezone_client \
  amitgal17/gamezone_client