FROM node:18-alpine AS base
WORKDIR /app

RUN apk add --no-cache libc6-compat && \
    apk update

FROM base AS dependencies
COPY package.json package-lock.json* ./

RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN echo "NEXT_PUBLIC_API_URL=http://host.docker.internal:8080" > .env.production

RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://host.docker.internal:8080

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN npm install --production=false sharp

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 
