import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ticketing SaaS API',
      version: '1.0.0',
      description:
        'Complete API documentation for the Ticketing SaaS platform with MercadoPago integration',
      contact: {
        name: 'API Support',
        email: 'support@ticketing-saas.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT || 3000}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.ticketing-saas.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login or /auth/register',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'object',
              nullable: true,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '60d0fe4f5311236168a109ca',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'organizer', 'admin'],
              example: 'user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            title: {
              type: 'string',
              example: 'Tech Conference 2024',
            },
            description: {
              type: 'string',
              example: 'Annual technology conference',
            },
            date: {
              type: 'string',
              format: 'date-time',
            },
            organizerId: {
              type: 'string',
            },
            ticketTypes: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TicketType',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        TicketType: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'General Admission',
            },
            price: {
              type: 'number',
              example: 50.0,
            },
            quantity: {
              type: 'integer',
              example: 100,
            },
            quantityAvailable: {
              type: 'integer',
              example: 85,
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            eventId: {
              type: 'string',
            },
            tickets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ticketType: {
                    type: 'string',
                  },
                  quantity: {
                    type: 'integer',
                  },
                },
              },
            },
            total: {
              type: 'number',
              example: 150.0,
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'cancelled'],
              example: 'pending',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            code: {
              type: 'string',
            },
            orderId: {
              type: 'string',
            },
            eventId: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['valid', 'used'],
              example: 'valid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            orderId: {
              type: 'string',
            },
            amount: {
              type: 'number',
              example: 150.0,
            },
            status: {
              type: 'string',
              example: 'approved',
            },
            paymentMethod: {
              type: 'string',
              example: 'credit_card',
            },
            externalId: {
              type: 'string',
              nullable: true,
            },
            webhookProcessed: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required or token invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'No token provided',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Access denied. Required roles: organizer',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Resource not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: {
                  field: 'Field validation error message',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration',
      },
      {
        name: 'Events',
        description: 'Event management operations',
      },
      {
        name: 'Orders',
        description: 'Order creation and management',
      },
      {
        name: 'Payments',
        description: 'Payment processing with MercadoPago',
      },
      {
        name: 'Tickets',
        description: 'Ticket management and validation',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
    ],
  },
  // Look for JSDoc comments in these files
  apis: ['./src/modules/*/**.routes.ts', './src/modules/*/**.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
