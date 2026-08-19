FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/domain/package*.json ./packages/domain/
COPY packages/auth/package*.json ./packages/auth/
COPY packages/validation/package*.json ./packages/validation/
COPY packages/audit/package*.json ./packages/audit/
COPY packages/documents/package*.json ./packages/documents/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "apps/api/src/index.ts"]
