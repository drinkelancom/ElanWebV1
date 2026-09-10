# ÉLAN op Orbit (NEXUS-WORKS).
#
# GitHub Actions bouwt dit image en zet het op ghcr.io; de NAS haalt het op.
# De NAS bouwt zelf niets — een Vite-build zou die machine te zwaar vallen.
#
# Twee stappen: eerst de site bouwen met alle dev-gereedschap erbij, daarna een
# schoon image waar alleen de uitkomst, de api-map en de server in zitten.

FROM node:20-alpine AS build
WORKDIR /app

# Eerst alleen de manifesten: zolang die niet wijzigen hergebruikt Docker de
# installatielaag en duurt een build seconden in plaats van minuten.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# vite build + prerender.mjs. De prerender zoekt normaal in git naar de datum
# van elke pagina; .git zit niet in het image, dus valt hij terug op de
# builddatum en zegt dat er ook bij in de sitemap.
RUN npm run build


FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Alleen de productie-afhankelijkheden. Uit het lockfile, zodat het image
# dezelfde versies draait als de build.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY api ./api
COPY server.mjs ./

# Niet als root draaien; het node-image heeft daar al een gebruiker voor.
USER node

# Moet gelijk zijn aan de --port waarmee de app op de NAS is aangemaakt.
ENV PORT=3000
EXPOSE 3000

# /healthz komt uit server.mjs en raakt de opslag niet aan, dus deze check
# zegt alleen of de container zelf nog luistert.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
