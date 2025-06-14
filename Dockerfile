FROM node:20-alpine As development
WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --immutable --immutable-cache --check-cache 
COPY --chown=node:node . .
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build
WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN yarn build

# Verify the build output
RUN ls -la dist/

# Set NODE_ENV environment variable
ENV NODE_ENV production

RUN yarn install --immutable --immutable-cache --check-cache --production=true && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine As production

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY --chown=node:node package*.json yarn.lock ./

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