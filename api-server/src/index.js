/*
  Entry point for the Express API server.
  - Connects to Postgres (for structured data like products, orders, users)
  - Connects to MongoDB (for flexible data like product reviews, events)
  - Sets up Passport.js strategies (local + JWT)
  - Registers API routes: /api/auth, /api/products, /api/orders
  - Exposes Swagger UI at /api/docs
*/

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const { initPostgres } = require('./lib/postgres');
const { initMongo } = require('./lib/mongo');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');

const app = express();

// Export the app so tests can import it without starting the server.
// A separate `server.js` file will start the listener when running the service normally.

const PORT = process.env.PORT || 4000;

// Basic middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Initialize DB connections and passport, but skip during tests so unit
// tests can run without external services.
if (process.env.NODE_ENV !== 'test') {
  initPostgres().catch(err => {
    console.error('Postgres init error', err);
    process.exit(1);
  });
  initMongo().catch(err => {
    console.error('Mongo init error', err);
    process.exit(1);
  });

  // Initialize passport (strategies defined in /lib/passport)
  require('./lib/passport')(passport);
  app.use(passport.initialize());
} else {
  // In test environment, we still want the routes to be registered but
  // skip external resource initialization.
  console.log('Running in test mode: skipping DB and passport initialization');
}

// Swagger setup (simple configuration) with bearerAuth security scheme
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Earth Betta Shop API',
      version: '0.1.0',
      description: 'Express scaffold for Earth Betta Shop — authentication, products, orders',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin','seller','customer'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
        PaginatedList: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: { type: 'object' } },
            page: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// Central error handler (last middleware)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;

