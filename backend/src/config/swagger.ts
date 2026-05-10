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
            coverImageUrl: {
              type: 'string',
              nullable: true,
              description: 'Relative path to cover image (resolved by frontend)',
              example: '/uploads/events/1715270400000-a1b2c3d4e5f6.jpg',
            },
            coverImageAlt: {
              type: 'string',
              nullable: true,
              description: 'Alt text for cover image (accessibility)',
              example: 'Tech Conference 2024 banner',
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
              description: 'Payment ID',
              example: '6a00e1234567890abcdef123',
            },
            orderId: {
              type: 'string',
              description: 'Associated order ID',
              example: '6a00df362608c2a32d66923b',
            },
            amount: {
              type: 'number',
              description: 'Payment amount in local currency',
              example: 150.0,
            },
            status: {
              type: 'string',
              description: 'Payment status from MercadoPago',
              enum: ['pending', 'approved', 'rejected', 'cancelled', 'in_process'],
              example: 'approved',
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method used',
              example: 'credit_card',
            },
            externalId: {
              type: 'string',
              nullable: true,
              description: 'MercadoPago payment ID',
              example: '1234567890',
            },
            webhookProcessed: {
              type: 'boolean',
              description: 'Whether webhook has been processed',
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
        UploadResponse: {
          type: 'object',
          description: 'File upload response',
          properties: {
            url: {
              type: 'string',
              description: 'Relative path to uploaded file',
              example: '/uploads/events/1715270400000-abc123def456.jpg',
            },
            filename: {
              type: 'string',
              description: 'Generated filename (unique)',
              example: '1715270400000-abc123def456.jpg',
            },
            originalName: {
              type: 'string',
              description: 'Original filename from upload',
              example: 'concert-poster.jpg',
            },
            mimetype: {
              type: 'string',
              description: 'File MIME type',
              example: 'image/jpeg',
            },
            size: {
              type: 'number',
              description: 'File size in bytes',
              example: 2048576,
            },
          },
        },
        PaymentPreference: {
          type: 'object',
          description: 'MercadoPago payment preference response',
          properties: {
            preferenceId: {
              type: 'string',
              description: 'MercadoPago preference ID',
              example: '1234567890-abc123def456',
            },
            initPoint: {
              type: 'string',
              format: 'uri',
              description: 'URL to redirect user for payment',
              example: 'https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=1234567890-abc123',
            },
            payment: {
              $ref: '#/components/schemas/Payment',
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
        description: 'User authentication and registration endpoints',
      },
      {
        name: 'Events',
        description: 'Event management operations (CRUD)',
      },
      {
        name: 'Orders',
        description: 'Order creation and management',
      },
      {
        name: 'Payments',
        description: 'Payment processing with MercadoPago integration',
      },
      {
        name: 'Tickets',
        description: 'Ticket management and validation',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Upload',
        description: 'File upload operations for event cover images',
      },
      {
        name: 'Static Files',
        description: 'Public static file serving (images)',
      },
    ],
    paths: {
      '/uploads/events/{filename}': {
        get: {
          tags: ['Static Files'],
          summary: 'Get uploaded event image',
          description: 'Serves uploaded event cover images. No authentication required - images are publicly accessible.',
          parameters: [
            {
              name: 'filename',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Image filename (e.g., 1715270400000-abc123.jpg)',
              example: '1715270400000-abc123def456.jpg',
            },
          ],
          responses: {
            '200': {
              description: 'Image file',
              content: {
                'image/jpeg': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                'image/png': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                'image/webp': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
            '404': {
              description: 'Image not found',
            },
          },
        },
      },
    },
  },
  // Look for JSDoc comments in these files
  apis: ['./src/modules/*/**.routes.ts', './src/modules/*/**.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
