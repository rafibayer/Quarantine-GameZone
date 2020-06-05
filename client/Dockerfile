FROM nginx
COPY ./build /usr/share/nginx/html
EXPOSE 80
ADD default.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
