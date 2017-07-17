FROM node:6.11.0
# docker maintainer
MAINTAINER James Kwok
ADD . /code
WORKDIR /code
RUN npm install
CMD ["npm", "start"]
