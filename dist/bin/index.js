#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const generate_frontend_sections_1 = require("../scripts/generate-frontend-sections");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const menu = () => {
    console.log();
    console.log('🚀 Strapi Helper Menu:');
    console.log('1️⃣  Generate frontend-sections.json');
    console.log('2️⃣  Generate Strapi controllers');
    console.log('0️⃣  Exit');
    console.log();
};
const askQuestion = (query) => new Promise((resolve) => {
    const rl = readline_1.default.createInterface({
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
        if (isProcessing)
            continue;
        menu();
        const choice = await askQuestion('👉 Select an option: ');
        isProcessing = true;
        switch (choice) {
            case '1':
                await (0, generate_frontend_sections_1.generateFrontendSections)();
                break;
            case '2': {
                const configPath = path_1.default.join(process.cwd(), 'frontend-sections.json');
                if (!fs_1.default.existsSync(configPath)) {
                    console.log('❌ frontend-sections.json not found in the current directory.');
                    console.log('👉 Please run option 1 (Generate frontend-sections.json) first.');
                }
                else {
                    console.log('Loading generateStrapiControllers script...');
                    const { generateStrapiControllers } = await Promise.resolve().then(() => __importStar(require('../scripts/generate-strapi-controllers')));
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
