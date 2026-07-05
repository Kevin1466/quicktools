FROM m.daocloud.io/docker.io/library/node:22-bookworm-slim

# 换源 + 安装编译依赖
RUN if [ -f /etc/apt/sources.list ]; then \
      sed -i \
        -e 's|http://deb.debian.org/debian|http://mirrors.aliyun.com/debian|g' \
        -e 's|http://deb.debian.org/debian-security|http://mirrors.aliyun.com/debian-security|g' \
        /etc/apt/sources.list; \
    elif [ -f /etc/apt/sources.list.d/debian.sources ]; then \
      sed -i \
        -e 's|http://deb.debian.org/debian|http://mirrors.aliyun.com/debian|g' \
        -e 's|http://deb.debian.org/debian-security|http://mirrors.aliyun.com/debian-security|g' \
        /etc/apt/sources.list.d/debian.sources; \
    fi \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build && npm run build:api && rm -rf node_modules && npm ci --omit=dev --registry=https://registry.npmmirror.com

ENV PORT=5175
ENV FEEDBACK_DB_PATH=/data/feedback.sqlite
VOLUME ["/data"]
EXPOSE 5175

CMD ["node", "server-dist/index.js"]
