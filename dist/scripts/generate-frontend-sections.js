"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFrontendSections = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
// Function to prompt user input
const askQuestion = (query) => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
};
const generateFrontendSections = async () => {
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
    if (!appDir || !fs_1.default.existsSync(appDir)) {
        console.error('Error: Invalid path provided or the directory does not exist.');
        process.exit(1);
    }
    const dataDir = path_1.default.join(appDir, 'src', 'data-init');
    if (!fs_1.default.existsSync(dataDir)) {
        console.error(`Error: The directory "${dataDir}" does not exist.`);
        process.exit(1);
    }
    const files = fs_1.default.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error(`Error: No JSON files found in the directory "${dataDir}".`);
        process.exit(1);
    }
    const appFilePath = path_1.default.join(appDir, 'src', 'App.tsx');
    if (!fs_1.default.existsSync(appFilePath)) {
        console.error(`Error: App.tsx not found at "${appFilePath}".`);
        process.exit(1);
    }
    const appContent = fs_1.default.readFileSync(appFilePath, 'utf8');
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)\s*\/>/g;
    let match;
    const componentOrder = [];
    while ((match = componentRegex.exec(appContent)) !== null) {
        const componentName = match[1];
        componentOrder.push(componentName);
    }
    function extractFields(obj, fields) {
        if (!obj || typeof obj !== 'object')
            return;
        if (obj.hasOwnProperty('field_name') && obj.hasOwnProperty('field_type')) {
            fields.push({ name: obj.field_name, type: obj.field_type });
        }
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (Array.isArray(val)) {
                for (const item of val) {
                    extractFields(item, fields);
                }
            }
            else if (typeof val === 'object' && val !== null) {
                extractFields(val, fields);
            }
        }
    }
    const allSections = {};
    for (const file of files) {
        const filePath = path_1.default.join(dataDir, file);
        const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
        const baseName = path_1.default.basename(file, '.json');
        const endpoint = `/${baseName}`;
        const controllerName = baseName;
        const serviceMethod = baseName;
        const serviceName = baseName;
        const model = baseName;
        const fields = [];
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
    const orderedSections = {};
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
    const outputPath = path_1.default.join(process.cwd(), 'frontend-sections.json');
    fs_1.default.writeFileSync(outputPath, JSON.stringify(frontendSections, null, 2), 'utf8');
    console.log(`✅ Success! frontend-sections.json generated at: ${outputPath}`);
};
exports.generateFrontendSections = generateFrontendSections;
