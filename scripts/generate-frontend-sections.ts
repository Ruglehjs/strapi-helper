import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Function to prompt user input
const askQuestion = (query: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  }));
};

export const generateFrontendSections = async (): Promise<void> => {
  console.log();
  console.log('🚀 Running the frontend-sections.json Generator Script!');
  const projectName = await askQuestion('👉 Enter the project name: ');
  if (!projectName) {
    console.error('Error: Project name cannot be empty.'); 
    process.exit(1);
  }

  const aggregatorServiceName = `custom-${projectName.replace(/\s+/g, '-').toLowerCase()}-api`;
  console.log(`✅ Project Name: ${projectName}`);
  console.log(`✅ Aggregator Service Name: ${aggregatorServiceName}`);

  const appDir = await askQuestion('👉 Enter the path to the React project (e.g., /path/to/project): ');
  if (!appDir || !fs.existsSync(appDir)) {
    console.error('Error: Invalid path provided or the directory does not exist.');
    process.exit(1);
  }

  const dataDir = path.join(appDir, 'src', 'data-init');
  if (!fs.existsSync(dataDir)) {
    console.error(`Error: The directory "${dataDir}" does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.error(`Error: No JSON files found in the directory "${dataDir}".`);
    process.exit(1);
  }

  const appFilePath = path.join(appDir, 'src', 'App.tsx');
  if (!fs.existsSync(appFilePath)) {
    console.error(`Error: App.tsx not found at "${appFilePath}".`);
    process.exit(1);
  }

  const appContent = fs.readFileSync(appFilePath, 'utf8');
  const componentRegex = /<([A-Z][a-zA-Z0-9]*)\s*\/>/g;

  let match: RegExpExecArray | null;
  const componentOrder: string[] = [];
  while ((match = componentRegex.exec(appContent)) !== null) {
    const componentName = match[1];
    componentOrder.push(componentName);
  }

  function extractFields(jsonData: any, fields: { name: string; type: string; value: any }[]): void {
    if (!jsonData || typeof jsonData !== 'object') return;
  
    // Check if the `fields` key exists and is an array
    if (Array.isArray(jsonData.fields)) {
      jsonData.fields.forEach((field: any) => {
        if (field.field_name && field.field_type) {
          fields.push({
            name: field.field_name,
            type: field.field_type,
            value: field.value ?? null, // Add the value if present
          });
        }
      });
    }
  }
  
  const allSections: Record<string, any> = {};
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const baseName = path.basename(file, '.json');
    const endpoint = `/${baseName}`;
    const controllerName = baseName;
    const serviceMethod = baseName;
    const serviceName = baseName;
    const model = baseName;

    const fields: { name: string; type: string; value: any }[] = [];
    extractFields(jsonData, fields);

    allSections[baseName] = {
      endpoint,
      controllerName,
      serviceMethod,
      serviceName,
      model,
      fields,
      kind: 'singleType',
    };
  }

  const orderedSections: Record<string, any> = {};
  let index = 1;

  for (const compName of componentOrder) {
    const baseName = compName.toLowerCase();
    if (allSections[baseName]) {
      const section = allSections[baseName];
      const capitalizedName = compName.charAt(0).toUpperCase() + compName.slice(1).toLowerCase();
      section.displayName = `${index}- ${capitalizedName}`;
      orderedSections[baseName] = section;
      index++;
    }
  }

  for (const [baseName, section] of Object.entries(allSections)) {
    if (!orderedSections[baseName]) {
      section.displayName = section.model.charAt(0).toUpperCase() + section.model.slice(1).toLowerCase();
      orderedSections[baseName] = section;
    }
  }

  const frontendSections = {
    projectName,
    aggregatorServiceName,
    sections: orderedSections,
  };

  const outputPath = path.join(process.cwd(), 'frontend-sections.json');
  fs.writeFileSync(outputPath, JSON.stringify(frontendSections, null, 2), 'utf8');

  console.log(`✅ Success! frontend-sections.json generated at: ${outputPath}`);
};
