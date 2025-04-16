# พื้นฐานสำหรับทั้ง build และ production
FROM node:18-alpine AS base
WORKDIR /app

# ติดตั้ง dependencies เพิ่มเติมที่จำเป็นสำหรับ Alpine Linux
RUN apk add --no-cache libc6-compat && \
    apk update

# ขั้นตอนการติดตั้ง dependencies
FROM base AS dependencies
COPY package.json package-lock.json* ./
# ติดตั้ง dependencies ใช้ ci เพื่อความเร็วและความแน่นอน
RUN npm ci

# ขั้นตอนการ build แอปพลิเคชัน
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# สร้างไฟล์ .env.production เพื่อกำหนดค่า environment ที่ใช้ใน Docker
RUN echo "NEXT_PUBLIC_API_URL=http://host.docker.internal:8080" > .env.production

# สร้าง production build ของแอปพลิเคชัน
RUN npm run build

# ขั้นตอนสำหรับ production
FROM base AS runner
WORKDIR /app

# สร้างผู้ใช้ที่ไม่ใช่ root เพื่อความปลอดภัย
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ตั้งค่า environment เป็น production
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://host.docker.internal:8080

# คัดลอกไฟล์ที่จำเป็นจากขั้นตอนการ build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ติดตั้ง sharp สำหรับการ optimize รูปภาพ
RUN npm install --production=false sharp

# เปลี่ยนผู้ใช้เป็น nextjs
USER nextjs

# เปิด port 3001 สำหรับเข้าถึงแอปพลิเคชัน
EXPOSE 3000

# ตัวแปรสภาพแวดล้อมที่ใช้โดย Next.js
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# คำสั่งเริ่มต้นเซิร์ฟเวอร์
CMD ["node", "server.js"] 