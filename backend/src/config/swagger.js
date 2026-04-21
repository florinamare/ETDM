const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ETDM — Architecture Discovery API',
      version: '1.0.0',
      description: 'Backend API for the AR-based architectural discovery app focused on Bucharest landmarks.',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5001}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Building: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            year: { type: 'number' },
            architect: { type: 'string' },
            style: { type: 'string' },
            tag: { type: 'string' },
            facts: { type: 'array', items: { type: 'string' } },
            blurb: { type: 'string' },
            coordinates: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
              },
            },
            wikipediaUrl: { type: 'string' },
            imageUrl: { type: 'string' },
            rating: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
