FROM node:14

WORKDIR /usr/src/web-application-backend

# Copy the entire current directory to the WORKDIR in the container
COPY . .

RUN  npm install

EXPOSE 3001

CMD ["node","app.js"]