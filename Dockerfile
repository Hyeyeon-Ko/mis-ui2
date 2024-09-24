# 단계 1: 빌드 단계
FROM node:14-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치를 위한 패키지 파일 복사
COPY package.json ./

# package-lock.json 파일이 있는 경우 삭제
RUN rm -f package-lock.json

# 환경 변수 설정: ESLint 경고/오류 무시
ENV ESLINT_NO_DEV_ERRORS=true
ENV CI=false

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . ./

# 애플리케이션 빌드 (PUBLIC_URL 설정)
ENV PUBLIC_URL=http://172.16.250.87
RUN npm run build

# 단계 2: 프로덕션 단계
FROM nginx:alpine

# 빌드된 애플리케이션을 Nginx의 기본 웹 서버 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 컨테이너가 수신 대기할 포트 설정
EXPOSE 3000

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
