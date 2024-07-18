FROM node:14

WORKDIR /usr/src/gateway

# Copy the entire current directory to the WORKDIR in the container
COPY . .

RUN  npm install

EXPOSE 4000

# Run addToWallet.js followed by submitDonation.js
CMD ["node", "addToWallet.js"] 
ENTRYPOINT ["node","submitDonation.js"]