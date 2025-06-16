FROM node:20-alpine As development
WORKDIR /usr/src/app

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY --chown=node:node . .
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build
WORKDIR /usr/src/app

COPY --chown=node:node package.json pnpm-lock.yaml ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN corepack enable pnpm && pnpm build

# Verify the build output
RUN ls -la dist/

# Set NODE_ENV environment variable
ENV NODE_ENV production

RUN pnpm install --frozen-lockfile --prod && pnpm store prune

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine As production

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Verify the files exist
RUN ls -la && ls -la dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE ${PORT}

# Use non-root user
USER node

# Use the same command as your start:prod script
CMD ["node", "dist/main"]