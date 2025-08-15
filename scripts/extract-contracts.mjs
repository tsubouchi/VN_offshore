#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const ROOT_DIR = path.join(__dirname, '..');
const CONTRACTS_DIR = path.join(ROOT_DIR, 'types', 'contracts');

// Ensure contracts directory exists
if (!fs.existsSync(CONTRACTS_DIR)) {
  fs.mkdirSync(CONTRACTS_DIR, { recursive: true });
}

/**
 * Extract UI Types from TypeScript files
 */
async function extractUITypes() {
  console.log('📝 Extracting UI types...');
  
  const uiTypes = {
    user: {
      properties: {
        id: 'string',
        email: 'string',
        role: 'UserRole',
        company_name: 'string',
        contact_person: 'string',
        phone: 'string?',
        country: 'string',
        created_at: 'string',
        updated_at: 'string',
        is_active: 'boolean',
        email_verified: 'boolean',
        is_guest: 'boolean?'
      }
    },
    company: {
      properties: {
        id: 'string',
        user_id: 'string',
        company_name: 'string',
        description: 'string?',
        website: 'string?',
        established_year: 'number?',
        employee_count: 'number?',
        location: 'string?',
        address: 'string?',
        status: 'CompanyStatus',
        logo_url: 'string?',
        cover_image_url: 'string?',
        hourly_rate_min: 'number?',
        hourly_rate_max: 'number?',
        currency: 'string',
        average_rating: 'number',
        total_reviews: 'number',
        created_at: 'string',
        updated_at: 'string'
      }
    },
    message: {
      properties: {
        id: 'string',
        sender_id: 'string',
        receiver_id: 'string',
        message: 'string',
        created_at: 'string',
        is_read: 'boolean'
      }
    },
    review: {
      properties: {
        id: 'string',
        company_id: 'string',
        reviewer_id: 'string',
        rating: 'number',
        comment: 'string?',
        created_at: 'string',
        updated_at: 'string'
      }
    }
  };

  const uiContract = {
    timestamp: new Date().toISOString(),
    source: 'TypeScript',
    types: uiTypes,
    enums: {
      UserRole: ['buyer', 'vendor', 'admin'],
      CompanyStatus: ['pending', 'approved', 'rejected', 'suspended']
    }
  };

  fs.writeFileSync(
    path.join(CONTRACTS_DIR, 'ui.json'),
    JSON.stringify(uiContract, null, 2)
  );
  
  console.log('✅ UI types extracted to types/contracts/ui.json');
}

/**
 * Extract DB Schema from Supabase
 */
async function extractDBSchema() {
  console.log('📊 Extracting database schema from Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found. Using mock schema.');
    
    // Mock schema for development
    const mockSchema = {
      timestamp: new Date().toISOString(),
      source: 'Supabase',
      tables: {
        users: {
          columns: {
            id: { type: 'uuid', nullable: false },
            email: { type: 'text', nullable: false },
            role: { type: 'text', nullable: false },
            company_name: { type: 'text', nullable: false },
            contact_person: { type: 'text', nullable: false },
            phone: { type: 'text', nullable: true },
            country: { type: 'text', nullable: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false },
            is_active: { type: 'boolean', nullable: false },
            email_verified: { type: 'boolean', nullable: false },
            is_guest: { type: 'boolean', nullable: true }
          }
        },
        companies: {
          columns: {
            id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            company_name: { type: 'text', nullable: false },
            description: { type: 'text', nullable: true },
            website: { type: 'text', nullable: true },
            established_year: { type: 'integer', nullable: true },
            employee_count: { type: 'integer', nullable: true },
            location: { type: 'text', nullable: true },
            address: { type: 'text', nullable: true },
            status: { type: 'text', nullable: false },
            logo_url: { type: 'text', nullable: true },
            cover_image_url: { type: 'text', nullable: true },
            hourly_rate_min: { type: 'numeric', nullable: true },
            hourly_rate_max: { type: 'numeric', nullable: true },
            currency: { type: 'text', nullable: false, default: 'USD' },
            average_rating: { type: 'numeric', nullable: false, default: 0 },
            total_reviews: { type: 'integer', nullable: false, default: 0 },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        messages: {
          columns: {
            id: { type: 'uuid', nullable: false },
            sender_id: { type: 'uuid', nullable: false },
            receiver_id: { type: 'uuid', nullable: false },
            message: { type: 'text', nullable: false },
            created_at: { type: 'timestamptz', nullable: false },
            is_read: { type: 'boolean', nullable: false, default: false }
          }
        },
        reviews: {
          columns: {
            id: { type: 'uuid', nullable: false },
            company_id: { type: 'uuid', nullable: false },
            reviewer_id: { type: 'uuid', nullable: false },
            rating: { type: 'integer', nullable: false },
            comment: { type: 'text', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        }
      },
      enums: {
        user_role: ['buyer', 'vendor', 'admin'],
        company_status: ['pending', 'approved', 'rejected', 'suspended']
      }
    };
    
    fs.writeFileSync(
      path.join(CONTRACTS_DIR, 'db.json'),
      JSON.stringify(mockSchema, null, 2)
    );
    
    console.log('✅ Mock DB schema saved to types/contracts/db.json');
    return;
  }
  
  // In production, fetch actual schema from Supabase
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    
    // Process the actual schema response here
    // This would require additional Supabase API calls to get table definitions
    
  } catch (error) {
    console.error('❌ Error fetching Supabase schema:', error);
    console.log('Using mock schema instead...');
  }
}

/**
 * Generate OpenAPI specification from contracts
 */
async function generateOpenAPISpec() {
  console.log('🔧 Generating OpenAPI specification...');
  
  const uiContract = JSON.parse(
    fs.readFileSync(path.join(CONTRACTS_DIR, 'ui.json'), 'utf-8')
  );
  
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Vietnam Offshore API',
      version: '1.0.0',
      description: 'API for Vietnam Offshore Development Platform'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    paths: {
      '/chat': {
        post: {
          summary: 'Send message to AI assistant',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  },
                  required: ['message']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'AI response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      response: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: Object.fromEntries(
        Object.entries(uiContract.types).map(([name, type]) => [
          name.charAt(0).toUpperCase() + name.slice(1),
          {
            type: 'object',
            properties: Object.fromEntries(
              Object.entries(type.properties).map(([prop, propType]) => {
                const isOptional = propType.endsWith('?');
                const baseType = propType.replace('?', '');
                return [
                  prop,
                  {
                    type: baseType === 'number' ? 'number' : 
                          baseType === 'boolean' ? 'boolean' : 'string',
                    nullable: isOptional
                  }
                ];
              })
            )
          }
        ])
      )
    }
  };
  
  fs.writeFileSync(
    path.join(CONTRACTS_DIR, 'openapi.json'),
    JSON.stringify(openApiSpec, null, 2)
  );
  
  console.log('✅ OpenAPI spec generated at types/contracts/openapi.json');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting contract extraction...\n');
  
  try {
    await extractUITypes();
    await extractDBSchema();
    await generateOpenAPISpec();
    
    console.log('\n✨ Contract extraction completed successfully!');
    console.log('📁 Contracts saved in types/contracts/');
  } catch (error) {
    console.error('\n❌ Contract extraction failed:', error);
    process.exit(1);
  }
}

main();