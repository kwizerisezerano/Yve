# Notification

The messaging engine of the Ingoga Communication Platform. A tenant calls one
intake API with the recipient number or numbers, the message, and its own api
key. The service authenticates the caller, decides the route, submits the
message through the Adapters service, tracks the message through its
lifecycle, retries on failure, ingests the delivery receipt, and calls the
tenant back by webhook.

It is independent from the other Ingoga services: its own PostgreSQL database,
its own tenants and api keys, no dependency on Core for authentication, price,
or wallet reservation. Its only neighbour is Adapters.

## What it does

* **Intake**: `POST /messages` accepts a recipient or list of recipients, the
  message text, and the tenant's api key, then queues one message per
  recipient.
* **Routing**: matches a message's country, operator, and type against active
  routing rules, picks a provider, and checks that provider's health through
  Adapters before committing to it.
* **Dispatch**: submits the routed message to the provider through Adapters
  and records the attempt.
* **Delivery receipt**: consumes the async receipt from Adapters and sets the
  message to delivered or failed.
* **Retry**: on a failed submission or a failed receipt, retries with
  exponential backoff up to a configured maximum, then dead letters.
* **Webhook**: calls the tenant's own webhook url back once a message reaches
  a terminal state (delivered or dead letter).
* **Tenants and api keys**: a tenant registers once and gets an api key back;
  there is no separate application layer, the tenant is the whole credential.

## Stack

* Node.js, TypeScript (strict), NestJS.
* PostgreSQL through Prisma.
* Redis for idempotency keys.
* RabbitMQ for lifecycle events and the delivery receipt.

## Prerequisites

* Node.js and npm.
* PostgreSQL reachable at the `DATABASE_URL` you configure.
* Redis reachable at `REDIS_URL`.
* RabbitMQ reachable at `RABBITMQ_URL`.
* The Adapters service reachable at `ADAPTERS_BASE_URL` (for routing health
  checks and message submission).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```
2. Create a `.env` file in the project root (see [Environment variables](#environment-variables)
   below).
3. Generate the Prisma client and apply migrations:

   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```
4. Start the service:

   ```bash
   npm run start:dev   # watch mode
   # or
   npm run build && npm run start:prod
   ```

The service listens on `PORT` (default `3000`). Swagger docs are served at
`/docs` once it is running.

## Environment variables

| Variable                            | Default                             | Purpose                                                                       |
| ----------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `PORT`                            | `3000`                            | HTTP port.                                                                    |
| `DATABASE_URL`                    | — required                         | PostgreSQL connection string for this service's own database.                 |
| `RABBITMQ_URL`                    | — required                         | RabbitMQ connection string.                                                   |
| `RABBITMQ_EXCHANGE`               | `notification.events`             | Exchange lifecycle events and the delivery receipt are published/consumed on. |
| `RABBITMQ_DEAD_LETTER_EXCHANGE`   | `notification.events.dead-letter` | Dead letter exchange.                                                         |
| `RABBITMQ_CONNECT_RETRIES`        | `5`                               | Connection retry attempts on startup.                                         |
| `RABBITMQ_CONNECT_RETRY_DELAY_MS` | `500`                             | Delay between connection retries.                                             |
| `ADAPTERS_BASE_URL`               | — required                         | Base url of the Adapters service.                                             |
| `ADAPTERS_TIMEOUT_MS`             | `5000`                            | Timeout for calls to Adapters.                                                |
| `ADAPTERS_MAX_RETRIES`            | `2`                               | Bounded retry count for calls to Adapters.                                    |
| `REDIS_URL`                       | `redis://127.0.0.1:6379`          | Redis connection string, used for idempotency keys.                           |
| `IDEMPOTENCY_KEY_TTL_SECONDS`     | `86400`                           | How long an idempotency key is remembered.                                    |
| `RETRY_MAX_ATTEMPTS`              | `3`                               | Max retries before a message is dead lettered.                                |
| `RETRY_BACKOFF_BASE_MS`           | `1000`                            | Base delay for the exponential retry backoff.                                 |
| `RETRY_BACKOFF_MAX_MS`            | `30000`                           | Cap on the retry backoff delay.                                               |
| `WEBHOOK_TIMEOUT_MS`              | `5000`                            | Timeout for calling a tenant's webhook.                                       |
| `WEBHOOK_MAX_RETRIES`             | `2`                               | Bounded retry count for a tenant webhook call.                                |

## Scripts

| Command                     | Purpose                                             |
| --------------------------- | --------------------------------------------------- |
| `npm run start:dev`       | Run with hot reload.                                |
| `npm run start:prod`      | Run the compiled build (`dist/main.js`).          |
| `npm run build`           | Compile TypeScript to`dist/`.                     |
| `npm run prisma:generate` | Regenerate the Prisma client after a schema change. |
| `npm run typecheck`       | Type check without emitting.                        |
| `npm test`                | Run unit tests.                                     |
| `npm run test:e2e`        | Run end to end tests.                               |

## Core flow, at a glance

```
tenant --POST /messages--> intake --queued--> routing --routed--> dispatch --submitted--> Adapters
                                                                                    |
                                                                            delivery.receipt
                                                                                    v
                                                                    delivered/failed --> retry (on failure)
                                                                                    |
                                                                            terminal state
                                                                                    v
                                                                              tenant webhook
```
