#generate standard nodejs docker file 
FROM node:20.3.1

RUN mkdir -p /usr/src/app

#set working directory
WORKDIR /usr/src/app

#copy package.json to working directory
COPY . .

#install dependencies
RUN npm install 

#set environment to production
ENV NODE_ENV development

#expose port 2022
EXPOSE 2022

#run the app
CMD ["npm", "start"]

