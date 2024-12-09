"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStrapiControllers = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Cargamos la configuración
const configPath = path_1.default.join(process.cwd(), 'frontend-sections.json');
if (!fs_1.default.existsSync(configPath)) {
    console.error('❌ Error: frontend-sections.json not found in the current working directory.');
    console.error('👉 Please run the "Generate frontend-sections.json" option first.');
    process.exit(1);
}
const config = require(configPath);
const { projectName, aggregatorServiceName } = config;
const sections = config.sections;
const aggregatorApiDir = path_1.default.join(process.cwd(), 'src', 'api', aggregatorServiceName);
// Crea directorios si no existen
function ensureDirectoryExists(dir) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
function replacePlaceholders(template, replacements) {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}
// Genera schema.json para la sección
function generateSchemaJson(config, projectName) {
    const attributes = {};
    for (const field of config.fields) {
        if (field.type === 'media') {
            attributes[field.name] = {
                type: 'media',
                multiple: false,
                required: false,
                allowedTypes: ['images', 'files', 'videos'],
            };
        }
        else {
            attributes[field.name] = { type: field.type };
        }
    }
    const schema = {
        kind: config.kind,
        // Ajustamos la collectionName para que coincida con la convención
        collectionName: `${config.model}_${projectName}`.replace('-', '_'),
        info: {
            singularName: `${config.model}-${projectName}`,
            pluralName: `${config.model}-${projectName}s`,
            displayName: `${config.displayName}` || `${config.model.replace('-', ' ')} ${projectName}`,
            description: ''
        },
        options: {
            draftAndPublish: true
        },
        pluginOptions: {},
        attributes
    };
    return JSON.stringify(schema, null, 2);
}
// Genera el controller.ts usando factories
function generateCoreControllerTs(model) {
    return `/**
 * ${model} controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::${model}.${model}');
`;
}
// Genera el service.ts usando factories (para la sección individual)
function generateCoreServiceTs(model) {
    return `/**
 * ${model} service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::${model}.${model}');
`;
}
// Genera el route.ts usando factories (para la sección individual)
function generateCoreRouterTs(model) {
    return `/**
 * ${model} router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::${model}.${model}');
`;
}
// Genera lógica del aggregator (controller)
function generateAggregatorController(sections) {
    const methods = Object.entries(sections).map(([name, config]) => {
        return `
  ${config.controllerName}: async (ctx) => {
    try {
      let response = await strapi
        .service("api::${aggregatorServiceName}.${aggregatorServiceName}")
        .${config.serviceMethod}();
      return ctx.send(response);
    } catch (err) {
      return ctx.badImplementation(err.message);
    }
  },`;
    }).join('\n');
    return `"use strict";

module.exports = {${methods}
};
`;
}
// Genera lógica del aggregator (service)
// Aquí generamos inline el código similar al ejemplo proporcionado
function generateAggregatorService(sections) {
    const methods = Object.entries(sections).map(([name, config]) => {
        // Determinar campos a popular (solo media)
        const mediaFields = config.fields
            .filter((f) => f.type === 'media')
            .map((f) => f.name);
        const populateStr = mediaFields.length > 0 ? `populate: ["${mediaFields.join('","')}"],` : '';
        const formattedFields = config.fields
            .map((field) => {
            if (field.type === 'media') {
                return `${field.name}: data.${field.name}?.formats?.medium?.url || data.${field.name}?.url || null`;
            }
            return `${field.name}: data.${field.name} || null`;
        })
            .join(',\n        ');
        return `
  ${config.serviceMethod}: async () => {
    try {
      const data = await strapi.documents("api::${config.model}-${projectName}.${config.model}-${projectName}").findFirst({
        ${populateStr}
      });

      const formattedData = {
        ${formattedFields}
      };

      return formattedData;
    } catch (err) {
      strapi.log.error("Error in service ${config.serviceMethod}:", err);
      return null;
    }
  },`;
    }).join('\n');
    return `"use strict";

module.exports = {${methods}
};
`;
}
// Genera lógica del aggregator (routes)
function generateAggregatorRoutes(sections) {
    const routes = Object.entries(sections).map(([name, config]) => {
        return `{
      method: "GET",
      path: "${config.endpoint}",
      handler: "${aggregatorServiceName}.${config.controllerName}",
    },`;
    }).join('\n');
    return `module.exports = {
  routes: [
    ${routes}
  ],
};`;
}
let isRunning = false; // Flag to ensure single execution
async function generateFiles() {
    if (isRunning) {
        return;
    }
    isRunning = true;
    try {
        // Your existing logic
        ensureDirectoryExists(aggregatorApiDir);
        ensureDirectoryExists(path_1.default.join(aggregatorApiDir, 'controllers'));
        ensureDirectoryExists(path_1.default.join(aggregatorApiDir, 'services'));
        ensureDirectoryExists(path_1.default.join(aggregatorApiDir, 'routes'));
        const aggregatorControllerContent = generateAggregatorController(sections);
        const aggregatorServiceContent = generateAggregatorService(sections);
        const aggregatorRoutesContent = generateAggregatorRoutes(sections);
        fs_1.default.writeFileSync(path_1.default.join(aggregatorApiDir, 'controllers', `${aggregatorServiceName}.ts`), aggregatorControllerContent, 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(aggregatorApiDir, 'services', `${aggregatorServiceName}.ts`), aggregatorServiceContent, 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(aggregatorApiDir, 'routes', `${aggregatorServiceName}.ts`), aggregatorRoutesContent, 'utf8');
        console.log(`Aggregator files generated at: src/api/${aggregatorServiceName}/`);
        // Generate files for sections
        for (const [sectionName, c] of Object.entries(sections)) {
            const config = c;
            const sectionApiDir = path_1.default.join(process.cwd(), 'src', 'api', `${config.model}-${projectName}`);
            ensureDirectoryExists(sectionApiDir);
            const contentTypesDir = path_1.default.join(sectionApiDir, 'content-types', `${config.model}-${projectName}`);
            ensureDirectoryExists(contentTypesDir);
            const schemaJson = generateSchemaJson(config, projectName);
            fs_1.default.writeFileSync(path_1.default.join(contentTypesDir, 'schema.json'), schemaJson, 'utf8');
            const controllersDir = path_1.default.join(sectionApiDir, 'controllers');
            ensureDirectoryExists(controllersDir);
            fs_1.default.writeFileSync(path_1.default.join(controllersDir, `${config.model}-${projectName}.ts`), generateCoreControllerTs(`${config.model}-${projectName}`), 'utf8');
            const servicesDir = path_1.default.join(sectionApiDir, 'services');
            ensureDirectoryExists(servicesDir);
            fs_1.default.writeFileSync(path_1.default.join(servicesDir, `${config.model}-${projectName}.ts`), generateCoreServiceTs(`${config.model}-${projectName}`), 'utf8');
            const routesDir = path_1.default.join(sectionApiDir, 'routes');
            ensureDirectoryExists(routesDir);
            fs_1.default.writeFileSync(path_1.default.join(routesDir, `${config.model}-${projectName}.ts`), generateCoreRouterTs(`${config.model}-${projectName}`), 'utf8');
            console.log(`Files for section ${sectionName} generated at: src/api/${config.model}-${projectName}/`);
        }
        console.log('All sections generated successfully.');
    }
    catch (error) {
        console.error('❌ Error in generateFiles:', error);
    }
    finally {
        isRunning = false; // Reset flag after execution
    }
}
const generateStrapiControllers = async () => {
    console.log('🚀 Running generateStrapiControllers...');
    await generateFiles();
};
exports.generateStrapiControllers = generateStrapiControllers;
