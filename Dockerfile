FROM node:22-alpine AS builder
WORKDIR /app
# First install dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Then copy source files from both contexts
COPY core/ ./core/
COPY client/ ./client/

WORKDIR /app/client
# The .env.production is in client/ so Next.js natively parses it
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

COPY --from=builder /app/client/public ./public
COPY --from=builder /app/client/.next/standalone ./
COPY --from=builder /app/client/.next/static ./.next/static

# Safe user context
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
