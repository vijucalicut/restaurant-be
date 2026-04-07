const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Multi-Tenant Restaurant Booking API',
    version: '2.0.0',
    description: 'API for multi-restaurant table booking with WhatsApp integration, queue management, and OTP authentication',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Restaurant: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          isVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Table: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          restaurantId: { type: 'string' },
          tableNumber: { type: 'integer' },
          capacity: { type: 'integer' },
          seatCount: { type: 'integer' },
          location: { type: 'string' },
          bookingEnabled: { type: 'boolean' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      TimeSlot: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          restaurantId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          startTime: { type: 'string' },
          endTime: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          restaurantId: { type: 'string' },
          tableId: { type: 'string' },
          slotId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          numberOfGuests: { type: 'integer' },
          phone: { type: 'string' },
          status: { type: 'string', enum: ['confirmed', 'pending', 'completed', 'rejected'] },
          token: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      QueueEntry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          restaurantId: { type: 'string' },
          tableId: { type: 'string' },
          slotId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          numberOfGuests: { type: 'integer' },
          phone: { type: 'string' },
          position: { type: 'integer' },
          status: { type: 'string', enum: ['queued', 'confirmed'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      BookingWithDetails: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          restaurantId: { type: 'string' },
          tableId: { type: 'string' },
          slotId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          numberOfGuests: { type: 'integer' },
          phone: { type: 'string' },
          status: { type: 'string', enum: ['confirmed', 'pending', 'completed', 'rejected'] },
          token: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          table: { $ref: '#/components/schemas/Table' },
          slot: { $ref: '#/components/schemas/TimeSlot' },
          restaurant: { $ref: '#/components/schemas/Restaurant' }
        }
      },
      AdminBooking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          restaurantId: { type: 'string' },
          tableId: { type: 'string' },
          slotId: { type: 'string' },
          date: { type: 'string', format: 'date' },
          numberOfGuests: { type: 'integer' },
          phone: { type: 'string' },
          status: { type: 'string', enum: ['confirmed', 'pending', 'completed', 'rejected'] },
          token: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' }
            }
          },
          table: { $ref: '#/components/schemas/Table' },
          slot: { $ref: '#/components/schemas/TimeSlot' },
          restaurant: { $ref: '#/components/schemas/Restaurant' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/api/auth/signup': {
      post: {
        summary: 'User signup',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'name', 'phone'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  phone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          400: { description: 'User already exists or invalid input' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/auth/send-otp': {
      post: {
        summary: 'Send OTP to phone number',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'OTP sent successfully' },
          404: { description: 'User not found' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/auth/verify-otp': {
      post: {
        summary: 'Verify OTP and login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'otp'],
                properties: {
                  phone: { type: 'string' },
                  otp: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid or expired OTP' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/auth/admin-login': {
      post: {
        summary: 'Admin login with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Admin login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid credentials' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          401: { description: 'Access token required' },
          404: { description: 'User not found' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/admin/tables': {
      post: {
        summary: 'Create a new table',
        tags: ['Admin - Tables'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tableNumber', 'capacity'],
                properties: {
                  tableNumber: { type: 'integer' },
                  capacity: { type: 'integer' },
                  location: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Table created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Table' }
              }
            }
          },
          400: { description: 'Invalid input' },
          403: { description: 'Admin access required' },
          500: { description: 'Internal server error' }
        }
      },
      get: {
        summary: 'Get all tables',
        tags: ['Admin - Tables'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Tables retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tables: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Table' }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Admin access required' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/admin/tables/{id}': {
      put: {
        summary: 'Update table details',
        tags: ['Admin - Tables'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Table ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tableNumber: { type: 'integer' },
                  capacity: { type: 'integer' },
                  location: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Table updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Table' }
              }
            }
          },
          403: { description: 'Admin access required' },
          404: { description: 'Table not found' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/admin/slots/generate': {
      post: {
        summary: 'Generate time slots for a date',
        tags: ['Admin - Time Slots'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date', 'startTime', 'endTime'],
                properties: {
                  date: { type: 'string', format: 'date' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Time slots generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    slots: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TimeSlot' }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Admin access required' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/admin/slots/{id}': {
      put: {
        summary: 'Enable/disable time slot',
        tags: ['Admin - Time Slots'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Time slot ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Slot updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TimeSlot' }
              }
            }
          },
          403: { description: 'Admin access required' },
          404: { description: 'Slot not found' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/slots': {
      get: {
        summary: 'Get time slots for a date',
        tags: ['Time Slots'],
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date in YYYY-MM-DD format'
          }
        ],
        responses: {
          200: {
            description: 'Time slots retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    slots: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TimeSlot' }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Date is required' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/tables/available': {
      get: {
        summary: 'Get available tables for a slot',
        tags: ['Tables'],
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date in YYYY-MM-DD format'
          },
          {
            name: 'slotId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Time slot ID'
          }
        ],
        responses: {
          200: {
            description: 'Available tables retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tables: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Table' }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Date and slot ID are required' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/bookings': {
      post: {
        summary: 'Create a new booking',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tableId', 'slotId', 'date', 'numberOfGuests'],
                properties: {
                  tableId: { type: 'string' },
                  slotId: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  numberOfGuests: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Booking created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' }
              }
            }
          },
          400: { description: 'Invalid input or table not available' },
          401: { description: 'Access token required' },
          500: { description: 'Internal server error' }
        }
      },
      get: {
        summary: 'Get user bookings',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User bookings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bookings: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/BookingWithDetails' }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Access token required' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/bookings/{id}': {
      delete: {
        summary: 'Cancel a booking',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Booking ID'
          }
        ],
        responses: {
          200: { description: 'Booking cancelled successfully' },
          401: { description: 'Access token required' },
          403: { description: 'Not authorized to cancel this booking' },
          404: { description: 'Booking not found' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/admin/bookings': {
      get: {
        summary: 'Get all bookings (Admin only)',
        tags: ['Admin - Bookings'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All bookings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bookings: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AdminBooking' }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Admin access required' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/api/admin/users': {
      get: {
        summary: 'Get all users (Admin only)',
        tags: ['Admin - Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Admin access required' },
          500: { description: 'Internal server error' }
        }
      }
    }
  }
};

module.exports = swaggerDefinition;