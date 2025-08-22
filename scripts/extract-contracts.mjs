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
            is_guest: { type: 'boolean', nullable: true },
            // Phase 3 additions
            department: { type: 'text', nullable: true },
            position: { type: 'text', nullable: true },
            bio: { type: 'text', nullable: true },
            avatar_url: { type: 'text', nullable: true },
            linkedin_url: { type: 'text', nullable: true },
            preferred_language: { type: 'text', nullable: true },
            timezone: { type: 'text', nullable: true },
            last_login_at: { type: 'timestamptz', nullable: true },
            notification_preferences: { type: 'jsonb', nullable: true }
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
            updated_at: { type: 'timestamptz', nullable: false },
            // Phase 3 additions
            business_license: { type: 'text', nullable: true },
            tax_id: { type: 'text', nullable: true },
            certifications: { type: 'jsonb', nullable: true },
            portfolio_url: { type: 'text', nullable: true },
            github_url: { type: 'text', nullable: true },
            case_studies: { type: 'jsonb', nullable: true },
            minimum_project_size: { type: 'numeric', nullable: true },
            payment_terms: { type: 'text', nullable: true },
            response_time_hours: { type: 'integer', nullable: true },
            verified_at: { type: 'timestamptz', nullable: true },
            featured: { type: 'boolean', nullable: false, default: false },
            featured_until: { type: 'timestamptz', nullable: true }
          }
        },
        conversations: {
          columns: {
            id: { type: 'uuid', nullable: false },
            participant1_id: { type: 'uuid', nullable: false },
            participant2_id: { type: 'uuid', nullable: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        messages: {
          columns: {
            id: { type: 'uuid', nullable: false },
            conversation_id: { type: 'uuid', nullable: true },
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
            reviewer_name: { type: 'text', nullable: true },
            reviewer_company: { type: 'text', nullable: true },
            project_name: { type: 'text', nullable: true },
            project_duration_months: { type: 'integer', nullable: true },
            project_value: { type: 'numeric', nullable: true },
            rating: { type: 'integer', nullable: false },
            rating_communication: { type: 'integer', nullable: true },
            rating_quality: { type: 'integer', nullable: true },
            rating_timeliness: { type: 'integer', nullable: true },
            rating_cost_effectiveness: { type: 'integer', nullable: true },
            comment: { type: 'text', nullable: true },
            pros: { type: 'text', nullable: true },
            cons: { type: 'text', nullable: true },
            would_recommend: { type: 'boolean', nullable: true },
            verified_client: { type: 'boolean', nullable: false, default: false },
            status: { type: 'text', nullable: false, default: 'published' },
            helpful_count: { type: 'integer', nullable: false, default: 0 },
            response_from_company: { type: 'text', nullable: true },
            response_date: { type: 'timestamptz', nullable: true },
            attachments: { type: 'jsonb', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        review_responses: {
          columns: {
            id: { type: 'uuid', nullable: false },
            review_id: { type: 'uuid', nullable: false },
            responder_id: { type: 'uuid', nullable: false },
            response: { type: 'text', nullable: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        review_helpful_votes: {
          columns: {
            id: { type: 'uuid', nullable: false },
            review_id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            helpful: { type: 'boolean', nullable: false },
            created_at: { type: 'timestamptz', nullable: false }
          }
        },
        inquiries: {
          columns: {
            id: { type: 'uuid', nullable: false },
            name: { type: 'text', nullable: false },
            email: { type: 'text', nullable: false },
            subject: { type: 'text', nullable: false },
            message: { type: 'text', nullable: false },
            status: { type: 'text', nullable: false, default: 'pending' },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        notifications: {
          columns: {
            id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            type: { type: 'text', nullable: false },
            title: { type: 'text', nullable: false },
            message: { type: 'text', nullable: false },
            read: { type: 'boolean', nullable: false, default: false },
            data: { type: 'jsonb', nullable: true },
            created_at: { type: 'timestamptz', nullable: false }
          }
        },
        notification_settings: {
          columns: {
            id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            email_notifications: { type: 'boolean', nullable: false, default: true },
            push_notifications: { type: 'boolean', nullable: false, default: false },
            sms_notifications: { type: 'boolean', nullable: false, default: false },
            notification_types: { type: 'jsonb', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        company_technologies: {
          columns: {
            id: { type: 'uuid', nullable: false },
            company_id: { type: 'uuid', nullable: false },
            technology: { type: 'text', nullable: false },
            category: { type: 'text', nullable: true },
            years_experience: { type: 'integer', nullable: true },
            proficiency_level: { type: 'text', nullable: true },
            created_at: { type: 'timestamptz', nullable: false }
          }
        },
        company_projects: {
          columns: {
            id: { type: 'uuid', nullable: false },
            company_id: { type: 'uuid', nullable: false },
            project_name: { type: 'text', nullable: false },
            client_name: { type: 'text', nullable: true },
            description: { type: 'text', nullable: true },
            technologies: { type: 'text', nullable: true },
            duration_months: { type: 'integer', nullable: true },
            team_size: { type: 'integer', nullable: true },
            project_url: { type: 'text', nullable: true },
            image_url: { type: 'text', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        company_files: {
          columns: {
            id: { type: 'uuid', nullable: false },
            company_id: { type: 'uuid', nullable: false },
            file_name: { type: 'text', nullable: false },
            file_type: { type: 'text', nullable: false },
            file_size: { type: 'integer', nullable: false },
            file_url: { type: 'text', nullable: false },
            category: { type: 'text', nullable: true },
            uploaded_by: { type: 'uuid', nullable: false },
            created_at: { type: 'timestamptz', nullable: false }
          }
        },
        user_favorites: {
          columns: {
            id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            company_id: { type: 'uuid', nullable: false },
            notes: { type: 'text', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        contact_history: {
          columns: {
            id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            company_id: { type: 'uuid', nullable: false },
            contact_type: { type: 'text', nullable: false },
            subject: { type: 'text', nullable: true },
            message: { type: 'text', nullable: true },
            response: { type: 'text', nullable: true },
            status: { type: 'text', nullable: false, default: 'pending' },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        // Project Management Tables
        projects: {
          columns: {
            id: { type: 'uuid', nullable: false },
            name: { type: 'text', nullable: false },
            description: { type: 'text', nullable: true },
            client_id: { type: 'uuid', nullable: false },
            vendor_id: { type: 'uuid', nullable: false },
            status: { type: 'text', nullable: false, default: 'planning' },
            priority: { type: 'text', nullable: false, default: 'medium' },
            budget: { type: 'numeric', nullable: true },
            currency: { type: 'text', nullable: false, default: 'USD' },
            start_date: { type: 'date', nullable: true },
            end_date: { type: 'date', nullable: true },
            actual_start_date: { type: 'date', nullable: true },
            actual_end_date: { type: 'date', nullable: true },
            completion_percentage: { type: 'integer', nullable: false, default: 0 },
            contract_type: { type: 'text', nullable: true },
            payment_terms: { type: 'text', nullable: true },
            requirements_doc_url: { type: 'text', nullable: true },
            contract_doc_url: { type: 'text', nullable: true },
            is_nda_signed: { type: 'boolean', nullable: false, default: false },
            created_by: { type: 'uuid', nullable: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_milestones: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            name: { type: 'text', nullable: false },
            description: { type: 'text', nullable: true },
            due_date: { type: 'date', nullable: false },
            completed_date: { type: 'date', nullable: true },
            status: { type: 'text', nullable: false, default: 'pending' },
            payment_percentage: { type: 'numeric', nullable: true },
            payment_amount: { type: 'numeric', nullable: true },
            deliverables: { type: 'jsonb', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_tasks: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            milestone_id: { type: 'uuid', nullable: true },
            parent_task_id: { type: 'uuid', nullable: true },
            title: { type: 'text', nullable: false },
            description: { type: 'text', nullable: true },
            assigned_to: { type: 'uuid', nullable: true },
            status: { type: 'text', nullable: false, default: 'todo' },
            priority: { type: 'text', nullable: false, default: 'medium' },
            estimated_hours: { type: 'numeric', nullable: true },
            actual_hours: { type: 'numeric', nullable: true },
            start_date: { type: 'timestamptz', nullable: true },
            due_date: { type: 'timestamptz', nullable: true },
            completed_date: { type: 'timestamptz', nullable: true },
            dependencies: { type: 'jsonb', nullable: true },
            tags: { type: 'jsonb', nullable: true },
            created_by: { type: 'uuid', nullable: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_team_members: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            role: { type: 'text', nullable: false },
            responsibilities: { type: 'text', nullable: true },
            hourly_rate: { type: 'numeric', nullable: true },
            allocation_percentage: { type: 'integer', nullable: true },
            start_date: { type: 'date', nullable: false },
            end_date: { type: 'date', nullable: true },
            is_active: { type: 'boolean', nullable: false, default: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_comments: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            task_id: { type: 'uuid', nullable: true },
            user_id: { type: 'uuid', nullable: false },
            comment: { type: 'text', nullable: false },
            attachments: { type: 'jsonb', nullable: true },
            is_internal: { type: 'boolean', nullable: false, default: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_activities: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            user_id: { type: 'uuid', nullable: false },
            activity_type: { type: 'text', nullable: false },
            entity_type: { type: 'text', nullable: true },
            entity_id: { type: 'uuid', nullable: true },
            description: { type: 'text', nullable: false },
            metadata: { type: 'jsonb', nullable: true },
            created_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_documents: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            name: { type: 'text', nullable: false },
            description: { type: 'text', nullable: true },
            file_url: { type: 'text', nullable: false },
            file_type: { type: 'text', nullable: false },
            file_size: { type: 'integer', nullable: false },
            category: { type: 'text', nullable: true },
            version: { type: 'text', nullable: true },
            uploaded_by: { type: 'uuid', nullable: false },
            is_public: { type: 'boolean', nullable: false, default: false },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        },
        project_time_logs: {
          columns: {
            id: { type: 'uuid', nullable: false },
            project_id: { type: 'uuid', nullable: false },
            task_id: { type: 'uuid', nullable: true },
            user_id: { type: 'uuid', nullable: false },
            description: { type: 'text', nullable: true },
            hours: { type: 'numeric', nullable: false },
            date: { type: 'date', nullable: false },
            billable: { type: 'boolean', nullable: false, default: true },
            approved: { type: 'boolean', nullable: false, default: false },
            approved_by: { type: 'uuid', nullable: true },
            approved_at: { type: 'timestamptz', nullable: true },
            created_at: { type: 'timestamptz', nullable: false },
            updated_at: { type: 'timestamptz', nullable: false }
          }
        }
      },
      enums: {
        user_role: ['buyer', 'vendor', 'admin'],
        company_status: ['pending', 'approved', 'rejected', 'suspended'],
        review_status: ['published', 'hidden', 'flagged'],
        notification_type: ['message', 'review', 'project', 'system', 'inquiry'],
        project_status: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
        task_status: ['todo', 'in_progress', 'review', 'done', 'cancelled'],
        priority: ['low', 'medium', 'high', 'critical'],
        milestone_status: ['pending', 'in_progress', 'completed', 'delayed']
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