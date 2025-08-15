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

/**
 * Compare UI and DB contracts
 */
function validateContracts() {
  console.log('🔍 Validating UI-DB contracts...\n');
  
  const uiContractPath = path.join(CONTRACTS_DIR, 'ui.json');
  const dbContractPath = path.join(CONTRACTS_DIR, 'db.json');
  
  if (!fs.existsSync(uiContractPath) || !fs.existsSync(dbContractPath)) {
    console.log('📝 Contracts not found. Extracting...');
    return false;
  }
  
  const uiContract = JSON.parse(fs.readFileSync(uiContractPath, 'utf-8'));
  const dbContract = JSON.parse(fs.readFileSync(dbContractPath, 'utf-8'));
  
  const issues = [];
  
  // Validate each UI type against DB schema
  Object.entries(uiContract.types).forEach(([typeName, uiType]) => {
    // Handle special plural cases
    let tableName = typeName + 's';
    if (typeName === 'company') {
      tableName = 'companies';
    }
    const dbTable = dbContract.tables[tableName] || dbContract.tables[typeName];
    
    if (!dbTable) {
      issues.push({
        type: 'error',
        message: `UI type '${typeName}' has no corresponding DB table`
      });
      return;
    }
    
    // Check each property
    Object.entries(uiType.properties).forEach(([propName, propType]) => {
      const dbColumn = dbTable.columns[propName];
      
      if (!dbColumn) {
        // Check for naming convention differences (camelCase vs snake_case)
        const snakeCaseName = propName.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
        if (!dbTable.columns[snakeCaseName]) {
          issues.push({
            type: 'error',
            message: `Property '${typeName}.${propName}' not found in DB schema`
          });
        }
        return;
      }
      
      // Validate type compatibility
      const isOptional = propType.endsWith('?');
      const baseType = propType.replace('?', '');
      
      if (dbColumn.nullable !== isOptional && propName !== 'id') {
        issues.push({
          type: 'warning',
          message: `Nullability mismatch for '${typeName}.${propName}': UI=${isOptional}, DB=${dbColumn.nullable}`
        });
      }
      
      // Type mapping validation
      const typeMap = {
        'string': ['text', 'varchar', 'uuid', 'timestamptz'],
        'number': ['integer', 'numeric', 'bigint', 'real'],
        'boolean': ['boolean']
      };
      
      const expectedDbTypes = typeMap[baseType] || [];
      if (expectedDbTypes.length > 0 && !expectedDbTypes.includes(dbColumn.type)) {
        issues.push({
          type: 'warning',
          message: `Type mismatch for '${typeName}.${propName}': UI=${baseType}, DB=${dbColumn.type}`
        });
      }
    });
  });
  
  // Check for DB columns not in UI
  Object.entries(dbContract.tables).forEach(([tableName, table]) => {
    const uiTypeName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
    const uiType = uiContract.types[uiTypeName];
    
    if (!uiType) return;
    
    Object.keys(table.columns).forEach(columnName => {
      const camelCaseName = columnName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (!uiType.properties[camelCaseName] && !uiType.properties[columnName]) {
        issues.push({
          type: 'info',
          message: `DB column '${tableName}.${columnName}' not exposed in UI`
        });
      }
    });
  });
  
  return issues;
}

/**
 * Generate contract report
 */
function generateReport(issues) {
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const info = issues.filter(i => i.type === 'info');
  
  console.log('📊 Contract Validation Report');
  console.log('=============================\n');
  
  if (errors.length > 0) {
    console.log('❌ Errors:', errors.length);
    errors.forEach(e => console.log(`   - ${e.message}`));
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:', warnings.length);
    warnings.forEach(w => console.log(`   - ${w.message}`));
    console.log();
  }
  
  if (info.length > 0) {
    console.log('ℹ️  Info:', info.length);
    info.forEach(i => console.log(`   - ${i.message}`));
    console.log();
  }
  
  if (issues.length === 0) {
    console.log('✅ All contracts are valid!');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      info: info.length,
      total: issues.length
    },
    issues: issues
  };
  
  fs.writeFileSync(
    path.join(CONTRACTS_DIR, 'validation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  return errors.length === 0;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting UI-DB Contract Validation\n');
  
  try {
    // First extract contracts
    console.log('📤 Extracting contracts...');
    const { stdout } = await execAsync('node scripts/extract-contracts.mjs', {
      cwd: ROOT_DIR
    });
    console.log(stdout);
    
    // Then validate
    const issues = validateContracts();
    
    if (issues === false) {
      console.log('❌ Contract validation failed: contracts not found');
      process.exit(1);
    }
    
    const isValid = generateReport(issues);
    
    console.log('\n=============================');
    console.log(isValid ? 
      '✅ Contract validation passed!' : 
      '❌ Contract validation failed!'
    );
    
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Contract validation error:', error);
    process.exit(1);
  }
}

main();