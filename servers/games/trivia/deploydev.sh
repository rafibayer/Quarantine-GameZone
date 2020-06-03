docker rm -f mongo_server
docker run -d -p 27017:27017 --name mongo_server mongo 
