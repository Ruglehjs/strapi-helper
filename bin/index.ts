#!/usr/bin/env node

import readline from 'readline';
import { generateFrontendSections } from '../scripts/generate-frontend-sections';
import fs from 'fs';
import path from 'path';

const menu = (): void => {
  console.log();
  console.log('🚀 Strapi Helper Menu:');
  console.log('1️⃣  Generate frontend-sections.json');
  console.log('2️⃣  Generate Strapi controllers');
  console.log('0️⃣  Exit');
  console.log();
};

const askQuestion = (query: string): Promise<string> =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  let isProcessing = false;

  (async () => {
    let exit = false;
  
    while (!exit) {
      if (isProcessing) continue;
  
      menu();
      const choice = await askQuestion('👉 Select an option: ');
  
      isProcessing = true;
  
      switch (choice) {
        case '1':
          await generateFrontendSections();
          break;
  
          case '2': {
            const configPath = path.join(process.cwd(), 'frontend-sections.json');
            if (!fs.existsSync(configPath)) {
              console.log('❌ frontend-sections.json not found in the current directory.');
              console.log('👉 Please run option 1 (Generate frontend-sections.json) first.');
            } else {
              console.log('Loading generateStrapiControllers script...');
              const { generateStrapiControllers } = await import('../scripts/generate-strapi-controllers');
              console.log('Executing generateStrapiControllers...');
              await generateStrapiControllers();
            }
            break;
          }
          
  
        case '0':
          exit = true;
          console.log('👋 Exiting Strapi Helper. Goodbye!');
          break;
  
        default:
          console.log('❌ Invalid option. Please try again.');
      }
  
      isProcessing = false;
    }
  })();
  
