FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.24.alpine

# 기본 설정 싹 지우기
RUN rm /etc.nginx/conf.d/default.conf

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 우리가 만든 nginx.conf만 넣기
COPY nginx.conf /etc/nginx/conf.d/nginx.conf