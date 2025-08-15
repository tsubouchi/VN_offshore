import fs from 'fs';
import path from 'path';

describe('UI-DB Contract Validation', () => {
  const contractsDir = path.join(process.cwd(), 'types', 'contracts');
  let uiContract: any;
  let dbContract: any;

  beforeAll(() => {
    // Load contracts
    const uiPath = path.join(contractsDir, 'ui.json');
    const dbPath = path.join(contractsDir, 'db.json');
    
    if (fs.existsSync(uiPath)) {
      uiContract = JSON.parse(fs.readFileSync(uiPath, 'utf-8'));
    }
    
    if (fs.existsSync(dbPath)) {
      dbContract = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
  });

  it('should have UI and DB contracts', () => {
    expect(uiContract).toBeDefined();
    expect(dbContract).toBeDefined();
  });

  it('should have matching timestamps within reasonable time', () => {
    if (!uiContract || !dbContract) return;
    
    const uiTime = new Date(uiContract.timestamp).getTime();
    const dbTime = new Date(dbContract.timestamp).getTime();
    const diff = Math.abs(uiTime - dbTime);
    
    // Contracts should be generated within 5 minutes of each other
    expect(diff).toBeLessThan(5 * 60 * 1000);
  });

  describe('Type Consistency', () => {
    it('should have corresponding DB tables for UI types', () => {
      if (!uiContract || !dbContract) return;
      
      const uiTypes = Object.keys(uiContract.types);
      const dbTables = Object.keys(dbContract.tables);
      
      uiTypes.forEach(typeName => {
        const expectedTableName = typeName + 's';
        const hasTable = dbTables.includes(expectedTableName) || dbTables.includes(typeName);
        
        if (typeName === 'company') {
          // Known issue: companies table in DB
          expect(dbTables).toContain('companies');
        } else {
          expect(hasTable).toBe(true);
        }
      });
    });

    it('should have compatible property types', () => {
      if (!uiContract || !dbContract) return;
      
      Object.entries(uiContract.types).forEach(([typeName, uiType]: any) => {
        const tableName = typeName + 's';
        const dbTable = dbContract.tables[tableName];
        
        if (!dbTable) return;
        
        Object.entries(uiType.properties).forEach(([propName, propType]: any) => {
          const dbColumn = dbTable.columns[propName];
          
          if (dbColumn) {
            // Check basic type compatibility
            const isOptional = propType.endsWith('?');
            const baseType = propType.replace('?', '');
            
            if (baseType === 'string') {
              expect(['text', 'varchar', 'uuid', 'timestamptz']).toContain(dbColumn.type);
            } else if (baseType === 'number') {
              expect(['integer', 'numeric', 'bigint', 'real']).toContain(dbColumn.type);
            } else if (baseType === 'boolean') {
              expect(dbColumn.type).toBe('boolean');
            }
          }
        });
      });
    });
  });

  describe('Enum Consistency', () => {
    it('should have matching enum values', () => {
      if (!uiContract || !dbContract) return;
      
      const uiEnums = uiContract.enums || {};
      const dbEnums = dbContract.enums || {};
      
      Object.entries(uiEnums).forEach(([enumName, values]: any) => {
        const dbEnumName = enumName.replace(/([A-Z])/g, '_$1').toLowerCase();
        const dbValues = dbEnums[dbEnumName] || dbEnums[enumName];
        
        if (dbValues) {
          expect(values.sort()).toEqual(dbValues.sort());
        }
      });
    });
  });

  describe('Contract Report', () => {
    it('should generate validation report', () => {
      const reportPath = path.join(contractsDir, 'validation-report.json');
      
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        
        expect(report).toHaveProperty('timestamp');
        expect(report).toHaveProperty('summary');
        expect(report).toHaveProperty('issues');
        
        // Log summary for visibility
        console.log('Contract Validation Summary:', report.summary);
        
        // Critical errors should be fixed
        if (report.summary.errors > 0) {
          console.warn(`Found ${report.summary.errors} contract errors that need attention`);
        }
      }
    });
  });
});