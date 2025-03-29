import { 
  ParsedReadme, 
  AppType, 
  SourceFile, 
  ProgrammingLanguage 
} from '../types/index.js';

/**
 * Responsible for defining the architecture of the generated application.
 * Creates the structure of directories and files based on the app type.
 */
export class ArchitectureGenerator {
  /**
   * Generate the basic architecture of the application
   * @param parsed Parsed README data
   * @returns Array of source files representing the application architecture
   */
  public generateArchitecture(parsed: ParsedReadme): SourceFile[] {
    const files: SourceFile[] = [];
    
    // Determine which architecture generator to use based on app type
    switch (parsed.appType) {
      case AppType.WEB_APP:
        return this.generateWebAppArchitecture(parsed);
      case AppType.MOBILE_APP:
        return this.generateMobileAppArchitecture(parsed);
      case AppType.CLI_APP:
        return this.generateCliAppArchitecture(parsed);
      case AppType.DESKTOP_APP:
        return this.generateDesktopAppArchitecture(parsed);
      case AppType.API_SERVER:
        return this.generateApiServerArchitecture(parsed);
      default:
        // Default to web app
        return this.generateWebAppArchitecture(parsed);
    }
  }

  /**
   * Generate architecture for a web application
   * @param parsed Parsed README data
   * @returns Array of source files
   */
  private generateWebAppArchitecture(parsed: ParsedReadme): SourceFile[] {
    const files: SourceFile[] = [];
    const useTypeScript = parsed.languages?.includes(ProgrammingLanguage.TYPESCRIPT) || false;
    const fileExt = useTypeScript ? 'ts' : 'js';
    
    // Add HTML file
    files.push({
      path: 'index.html',
      content: this.generateHtmlTemplate(parsed),
      language: ProgrammingLanguage.HTML
    });
    
    // Add CSS file
    files.push({
      path: 'styles/main.css',
      content: this.generateCssTemplate(parsed),
      language: ProgrammingLanguage.CSS
    });
    
    // Add main JavaScript/TypeScript file
    files.push({
      path: `scripts/main.${fileExt}`,
      content: this.generateMainScript(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add data model file if needed
    const hasDataModel = this.hasDataModelSection(parsed);
    if (hasDataModel) {
      files.push({
        path: `scripts/models.${fileExt}`,
        content: this.generateDataModelScript(parsed, useTypeScript),
        language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
      });
    }
    
    return files;
  }

  /**
   * Generate architecture for a mobile application
   * @param parsed Parsed README data
   * @returns Array of source files
   */
  private generateMobileAppArchitecture(parsed: ParsedReadme): SourceFile[] {
    // This is a simplified mobile app structure
    // In a real implementation, we would generate platform-specific code
    const files: SourceFile[] = [];
    const useTypeScript = parsed.languages?.includes(ProgrammingLanguage.TYPESCRIPT) || false;
    const fileExt = useTypeScript ? 'ts' : 'js';
    
    // Add package.json for React Native
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: parsed.title.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        scripts: {
          start: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web'
        },
        dependencies: {
          'expo': '^47.0.0',
          'expo-status-bar': '~1.4.2',
          'react': '18.1.0',
          'react-dom': '18.1.0',
          'react-native': '0.70.5'
        },
        devDependencies: {
          '@babel/core': '^7.19.3',
          '@types/react': '~18.0.24',
          '@types/react-native': '~0.70.6',
          'typescript': '~4.6.3'
        }
      }, null, 2),
      language: ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add App.tsx or App.js
    files.push({
      path: `App.${fileExt}`,
      content: this.generateMobileAppEntryPoint(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add components directory with basic components
    files.push({
      path: `components/MainScreen.${fileExt}`,
      content: this.generateMobileMainScreen(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add styles
    files.push({
      path: `styles/styles.${fileExt}`,
      content: this.generateMobileStyles(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    return files;
  }

  /**
   * Generate architecture for a CLI application
   * @param parsed Parsed README data
   * @returns Array of source files
   */
  private generateCliAppArchitecture(parsed: ParsedReadme): SourceFile[] {
    const files: SourceFile[] = [];
    const useTypeScript = parsed.languages?.includes(ProgrammingLanguage.TYPESCRIPT) || false;
    const fileExt = useTypeScript ? 'ts' : 'js';
    
    // Add package.json
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: parsed.title.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: parsed.description,
        main: useTypeScript ? 'dist/index.js' : 'src/index.js',
        bin: {
          [parsed.title.toLowerCase().replace(/\s+/g, '-')]: useTypeScript ? 'dist/index.js' : 'src/index.js'
        },
        scripts: {
          start: useTypeScript ? 'ts-node src/index.ts' : 'node src/index.js',
          build: useTypeScript ? 'tsc' : 'echo "No build step needed"',
          test: 'echo "Error: no test specified" && exit 1'
        },
        keywords: [],
        author: '',
        license: 'ISC',
        dependencies: {
          'commander': '^9.0.0',
          'chalk': '^5.0.0'
        },
        devDependencies: useTypeScript ? {
          'typescript': '^4.6.3',
          'ts-node': '^10.7.0',
          '@types/node': '^17.0.23'
        } : {}
      }, null, 2),
      language: ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add main file
    files.push({
      path: `src/index.${fileExt}`,
      content: this.generateCliMainFile(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add commands directory with basic commands
    files.push({
      path: `src/commands/index.${fileExt}`,
      content: this.generateCliCommands(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add utils directory
    files.push({
      path: `src/utils/index.${fileExt}`,
      content: this.generateCliUtils(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add TypeScript config if needed
    if (useTypeScript) {
      files.push({
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', '**/*.test.ts']
        }, null, 2),
        language: ProgrammingLanguage.JAVASCRIPT
      });
    }
    
    return files;
  }

  /**
   * Generate architecture for a desktop application
   * @param parsed Parsed README data
   * @returns Array of source files
   */
  private generateDesktopAppArchitecture(parsed: ParsedReadme): SourceFile[] {
    // In a real implementation, we'd determine which desktop platform to target
    // For now, we'll use Electron as it's cross-platform
    const files: SourceFile[] = [];
    const useTypeScript = parsed.languages?.includes(ProgrammingLanguage.TYPESCRIPT) || false;
    const fileExt = useTypeScript ? 'ts' : 'js';
    
    // Add package.json
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: parsed.title.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: parsed.description,
        main: useTypeScript ? 'dist/main.js' : 'src/main.js',
        scripts: {
          start: useTypeScript ? 'tsc && electron .' : 'electron .',
          build: useTypeScript ? 'tsc' : 'echo "No build step needed"',
          package: 'electron-builder'
        },
        keywords: [],
        author: '',
        license: 'ISC',
        dependencies: {
          'electron-store': '^8.0.1'
        },
        devDependencies: {
          'electron': '^18.0.3',
          'electron-builder': '^22.14.13',
          ...(useTypeScript ? {
            'typescript': '^4.6.3',
            '@types/node': '^17.0.23'
          } : {})
        },
        build: {
          appId: `com.example.${parsed.title.toLowerCase().replace(/\s+/g, '-')}`,
          productName: parsed.title,
          directories: {
            output: 'dist'
          },
          mac: {
            category: 'public.app-category.utilities'
          },
          win: {
            target: 'nsis'
          },
          linux: {
            target: 'AppImage'
          }
        }
      }, null, 2),
      language: ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add main process file
    files.push({
      path: `src/main.${fileExt}`,
      content: this.generateDesktopMainProcess(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add renderer process (HTML)
    files.push({
      path: 'src/index.html',
      content: this.generateDesktopHtml(parsed),
      language: ProgrammingLanguage.HTML
    });
    
    // Add renderer JavaScript
    files.push({
      path: `src/renderer.${fileExt}`,
      content: this.generateDesktopRenderer(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add styles
    files.push({
      path: 'src/styles.css',
      content: this.generateDesktopStyles(parsed),
      language: ProgrammingLanguage.CSS
    });
    
    // Add TypeScript config if needed
    if (useTypeScript) {
      files.push({
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', '**/*.test.ts']
        }, null, 2),
        language: ProgrammingLanguage.JAVASCRIPT
      });
    }
    
    return files;
  }

  /**
   * Generate architecture for an API server
   * @param parsed Parsed README data
   * @returns Array of source files
   */
  private generateApiServerArchitecture(parsed: ParsedReadme): SourceFile[] {
    const files: SourceFile[] = [];
    const useTypeScript = parsed.languages?.includes(ProgrammingLanguage.TYPESCRIPT) || false;
    const fileExt = useTypeScript ? 'ts' : 'js';
    
    // Add package.json
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: parsed.title.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: parsed.description,
        main: useTypeScript ? 'dist/index.js' : 'src/index.js',
        scripts: {
          start: useTypeScript ? 'node dist/index.js' : 'node src/index.js',
          dev: useTypeScript ? 'ts-node-dev --respawn src/index.ts' : 'nodemon src/index.js',
          build: useTypeScript ? 'tsc' : 'echo "No build step needed"',
          test: 'echo "Error: no test specified" && exit 1'
        },
        keywords: [],
        author: '',
        license: 'ISC',
        dependencies: {
          'express': '^4.17.3',
          'cors': '^2.8.5',
          'dotenv': '^16.0.0',
          'helmet': '^5.0.2',
          'morgan': '^1.10.0'
        },
        devDependencies: {
          'nodemon': '^2.0.15',
          ...(useTypeScript ? {
            'typescript': '^4.6.3',
            'ts-node-dev': '^1.1.8',
            '@types/node': '^17.0.23',
            '@types/express': '^4.17.13',
            '@types/cors': '^2.8.12',
            '@types/morgan': '^1.9.3'
          } : {})
        }
      }, null, 2),
      language: ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add main file
    files.push({
      path: `src/index.${fileExt}`,
      content: this.generateApiServerIndex(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add routes directory
    files.push({
      path: `src/routes/index.${fileExt}`,
      content: this.generateApiRoutes(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add controllers directory
    files.push({
      path: `src/controllers/index.${fileExt}`,
      content: this.generateApiControllers(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add models directory
    files.push({
      path: `src/models/index.${fileExt}`,
      content: this.generateApiModels(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add middleware directory
    files.push({
      path: `src/middleware/index.${fileExt}`,
      content: this.generateApiMiddleware(parsed, useTypeScript),
      language: useTypeScript ? ProgrammingLanguage.TYPESCRIPT : ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add .env file
    files.push({
      path: '.env.example',
      content: [
        'PORT=3000',
        'NODE_ENV=development',
        '# Add other environment variables here'
      ].join('\n'),
      language: ProgrammingLanguage.JAVASCRIPT
    });
    
    // Add TypeScript config if needed
    if (useTypeScript) {
      files.push({
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', '**/*.test.ts']
        }, null, 2),
        language: ProgrammingLanguage.JAVASCRIPT
      });
    }
    
    return files;
  }

  /**
   * Check if the README has a data model section
   */
  private hasDataModelSection(parsed: ParsedReadme): boolean {
    const technicalSection = parsed.sections.find(s => s.title === 'Technical Implementation');
    if (!technicalSection) return false;
    
    return !!technicalSection.subsections.find(
      s => s.title === 'Data Model' || 
           s.title === 'Data Structures' || 
           s.title === 'Models'
    );
  }

  /**
   * Generate HTML template based on README data
   */
  private generateHtmlTemplate(parsed: ParsedReadme): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${parsed.title}</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <header>
        <h1>${parsed.title}</h1>
    </header>
    <main>
        <!-- Main content will be dynamically generated by JavaScript -->
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${parsed.title}</p>
    </footer>
    <script src="scripts/main.js"></script>
</body>
</html>`;
  }

  /**
   * Generate CSS template based on README data
   */
  private generateCssTemplate(parsed: ParsedReadme): string {
    return `/* 
 * Styles for ${parsed.title}
 */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

header {
    background-color: #f4f4f4;
    text-align: center;
    padding: 1rem;
    margin-bottom: 2rem;
}

main {
    min-height: 70vh;
}

footer {
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
    background-color: #f4f4f4;
}

/* Add more specific styles here based on application requirements */
`;
  }

  /**
   * Generate main JavaScript/TypeScript file
   */
  private generateMainScript(parsed: ParsedReadme, useTypeScript: boolean): string {
    // This is a simplified implementation
    // In a real scenario, we would analyze the README and generate more specific code
    return useTypeScript ? 
      `/**
 * Main application script for ${parsed.title}
 */

// Import any necessary modules
${this.hasDataModelSection(parsed) ? "import { initializeData } from './models';" : ""}

/**
 * Initialize the application
 */
function initApp(): void {
    console.log('Initializing ${parsed.title}');
    setupEventListeners();
    ${this.hasDataModelSection(parsed) ? "initializeData();" : ""}
    renderApp();
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
    // Add event listeners here
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded');
    });
}

/**
 * Render the application UI
 */
function renderApp(): void {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    
    mainElement.innerHTML = \`
        <div class="app-container">
            <h2>Welcome to ${parsed.title}</h2>
            <p>${parsed.description}</p>
            <div id="app-content"></div>
        </div>
    \`;
}

// Initialize the application
initApp();
` : 
      `/**
 * Main application script for ${parsed.title}
 */

// Import any necessary modules
${this.hasDataModelSection(parsed) ? "import { initializeData } from './models';" : ""}

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing ${parsed.title}');
    setupEventListeners();
    ${this.hasDataModelSection(parsed) ? "initializeData();" : ""}
    renderApp();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Add event listeners here
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded');
    });
}

/**
 * Render the application UI
 */
function renderApp() {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    
    mainElement.innerHTML = \`
        <div class="app-container">
            <h2>Welcome to ${parsed.title}</h2>
            <p>${parsed.description}</p>
            <div id="app-content"></div>
        </div>
    \`;
}

// Initialize the application
initApp();
`;
  }

  /**
   * Generate data model script
   */
  private generateDataModelScript(parsed: ParsedReadme, useTypeScript: boolean): string {
    // Simplified data model generation
    // In a real implementation, we would analyze the README to extract data model details
    return useTypeScript ? 
      `/**
 * Data models for ${parsed.title}
 */

/**
 * Initialize data for the application
 */
export function initializeData(): void {
    console.log('Initializing data');
    // Load data from storage or initialize defaults
}

/**
 * Example data interface
 */
export interface DataItem {
    id: string;
    name: string;
    createdAt: Date;
}

/**
 * Data storage and management
 */
export class DataStore {
    private items: DataItem[] = [];
    
    constructor() {
        this.loadFromStorage();
    }
    
    public getAll(): DataItem[] {
        return [...this.items];
    }
    
    public add(item: Omit<DataItem, 'id' | 'createdAt'>): DataItem {
        const newItem: DataItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date()
        };
        
        this.items.push(newItem);
        this.saveToStorage();
        return newItem;
    }
    
    public update(id: string, data: Partial<DataItem>): DataItem | null {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        this.items[index] = {
            ...this.items[index],
            ...data,
        };
        
        this.saveToStorage();
        return this.items[index];
    }
    
    public delete(id: string): boolean {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);
        
        if (initialLength !== this.items.length) {
            this.saveToStorage();
            return true;
        }
        
        return false;
    }
    
    private generateId(): string {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    private saveToStorage(): void {
        localStorage.setItem('appData', JSON.stringify(this.items));
    }
    
    private loadFromStorage(): void {
        const storedData = localStorage.getItem('appData');
        if (storedData) {
            try {
                this.items = JSON.parse(storedData).map((item: any) => ({
                    ...item,
                    createdAt: new Date(item.createdAt)
                }));
            } catch (error) {
                console.error('Failed to load data from storage', error);
                this.items = [];
            }
        }
    }
}

// Export singleton instance
export const dataStore = new DataStore();
` : 
      `/**
 * Data models for ${parsed.title}
 */

/**
 * Initialize data for the application
 */
export function initializeData() {
    console.log('Initializing data');
    // Load data from storage or initialize defaults
}

/**
 * Data storage and management
 */
export class DataStore {
    constructor() {
        this.items = [];
        this.loadFromStorage();
    }
    
    getAll() {
        return [...this.items];
    }
    
    add(item) {
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date()
        };
        
        this.items.push(newItem);
        this.saveToStorage();
        return newItem;
    }
    
    update(id, data) {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        this.items[index] = {
            ...this.items[index],
            ...data,
        };
        
        this.saveToStorage();
        return this.items[index];
    }
    
    delete(id) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);
        
        if (initialLength !== this.items.length) {
            this.saveToStorage();
            return true;
        }
        
        return false;
    }
    
    generateId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    saveToStorage() {
        localStorage.setItem('appData', JSON.stringify(this.items));
    }
    
    loadFromStorage() {
        const storedData = localStorage.getItem('appData');
        if (storedData) {
            try {
                this.items = JSON.parse(storedData).map(item => ({
                    ...item,
                    createdAt: new Date(item.createdAt)
                }));
            } catch (error) {
                console.error('Failed to load data from storage', error);
                this.items = [];
            }
        }
    }
}

// Export singleton instance
export const dataStore = new DataStore();
`;
  }

  // Other private methods for generating specific application components would be implemented here
  // For brevity, I'm including stubs for these methods with simple implementations

  private generateMobileAppEntryPoint(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import React from 'react';
import MainScreen from './components/MainScreen';

export default function App() {
  return <MainScreen />;
}` : 
      `import React from 'react';
import MainScreen from './components/MainScreen';

export default function App() {
  return <MainScreen />;
}`;
  }

  private generateMobileMainScreen(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles/styles';

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${parsed.title}</Text>
      <Text style={styles.description}>${parsed.description}</Text>
    </View>
  );
}` : 
      `import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/styles';

export default function MainScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${parsed.title}</Text>
      <Text style={styles.description}>${parsed.description}</Text>
    </View>
  );
}`;
  }

  private generateMobileStyles(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});` : 
      `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});`;
  }

  private generateCliMainFile(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `#!/usr/bin/env node
import { Command } from 'commander';
import * as commands from './commands';
import * as utils from './utils';

const program = new Command();

program
  .name('${parsed.title.toLowerCase().replace(/\s+/g, '-')}')
  .description('${parsed.description}')
  .version('1.0.0');

// Add commands here
program
  .command('start')
  .description('Start the application')
  .action(() => {
    console.log('Starting application...');
    commands.start();
  });

program.parse(process.argv);
` : 
      `#!/usr/bin/env node
const { Command } = require('commander');
const commands = require('./commands');
const utils = require('./utils');

const program = new Command();

program
  .name('${parsed.title.toLowerCase().replace(/\s+/g, '-')}')
  .description('${parsed.description}')
  .version('1.0.0');

// Add commands here
program
  .command('start')
  .description('Start the application')
  .action(() => {
    console.log('Starting application...');
    commands.start();
  });

program.parse(process.argv);
`;
  }

  /**
   * Generate CLI command files
   */
  private generateCliCommands(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `/**
 * Commands for ${parsed.title} CLI
 */

/**
 * Start command implementation
 */
export function start(): void {
  console.log('${parsed.title} started successfully!');
  // Implement start logic here
}

/**
 * Other commands would be implemented here
 */
` : 
      `/**
 * Commands for ${parsed.title} CLI
 */

/**
 * Start command implementation
 */
exports.start = function() {
  console.log('${parsed.title} started successfully!');
  // Implement start logic here
};

/**
 * Other commands would be implemented here
 */
`;
  }

  /**
   * Generate CLI utility functions
   */
  private generateCliUtils(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `/**
 * Utility functions for ${parsed.title} CLI
 */

/**
 * Example utility function
 */
export function formatOutput(message: string): string {
  return `[${parsed.title}] ${message}`;
}

/**
 * Other utility functions would be implemented here
 */
` : 
      `/**
 * Utility functions for ${parsed.title} CLI
 */

/**
 * Example utility function
 */
exports.formatOutput = function(message) {
  return \`[${parsed.title}] \${message}\`;
};

/**
 * Other utility functions would be implemented here
 */
`;
  }

  /**
   * Generate desktop app main process
   */
  private generateDesktopMainProcess(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
` : 
      `const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;
  }

  /**
   * Generate desktop app HTML
   */
  private generateDesktopHtml(parsed: ParsedReadme): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self';">
    <title>${parsed.title}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>${parsed.title}</h1>
        <p>${parsed.description}</p>
        <div id="app"></div>
    </div>
    <script src="renderer.js"></script>
</body>
</html>`;
  }

  /**
   * Generate desktop app renderer script
   */
  private generateDesktopRenderer(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `/**
 * Renderer process for ${parsed.title} desktop application
 */

// DOM Elements
const appElement = document.getElementById('app');

function renderApp(): void {
  if (!appElement) return;
  
  appElement.innerHTML = '<p>Application initialized successfully!</p>';
}

// Initialize the renderer
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer initialized');
  renderApp();
});
` : 
      `/**
 * Renderer process for ${parsed.title} desktop application
 */

// DOM Elements
const appElement = document.getElementById('app');

function renderApp() {
  if (!appElement) return;
  
  appElement.innerHTML = '<p>Application initialized successfully!</p>';
}

// Initialize the renderer
document.addEventListener('DOMContentLoaded', () => {
  console.log('Renderer initialized');
  renderApp();
});
`;
  }

  /**
   * Generate desktop app styles
   */
  private generateDesktopStyles(parsed: ParsedReadme): string {
    return `/* Styles for ${parsed.title} */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 16px;
  color: #333;
}

p {
  color: #666;
  line-height: 1.5;
}

#app {
  margin-top: 20px;
  min-height: 200px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 20px;
}`;
  }

  /**
   * Generate API server index file
   */
  private generateApiServerIndex(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router } from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(port, () => {
  console.log(\`${parsed.title} API server running on port \${port}\`);
});

export default app;
` : 
      `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { router } = require('./routes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(port, () => {
  console.log(\`${parsed.title} API server running on port \${port}\`);
});

module.exports = app;
`;
  }

  /**
   * Generate API routes
   */
  private generateApiRoutes(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import express from 'express';
import * as controllers from '../controllers/index.js';

export const router = express.Router();

// Define routes
router.get('/items', controllers.getAllItems);
router.post('/items', controllers.createItem);
router.get('/items/:id', controllers.getItemById);
router.put('/items/:id', controllers.updateItem);
router.delete('/items/:id', controllers.deleteItem);

export default router;
` : 
      `const express = require('express');
const controllers = require('../controllers');

const router = express.Router();

// Define routes
router.get('/items', controllers.getAllItems);
router.post('/items', controllers.createItem);
router.get('/items/:id', controllers.getItemById);
router.put('/items/:id', controllers.updateItem);
router.delete('/items/:id', controllers.deleteItem);

module.exports = { router };
`;
  }

  /**
   * Generate API controllers
   */
  private generateApiControllers(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import { Request, Response, NextFunction } from 'express';
import * as models from '../models/index.js';

// Get all items
export const getAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await models.getAll();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// Create a new item
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newItem = await models.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// Get item by ID
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await models.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedItem = await models.update(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// Delete an item
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await models.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
` : 
      `// Get all items
exports.getAllItems = async (req, res, next) => {
  try {
    const items = await models.getAll();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// Create a new item
exports.createItem = async (req, res, next) => {
  try {
    const newItem = await models.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// Get item by ID
exports.getItemById = async (req, res, next) => {
  try {
    const item = await models.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
exports.updateItem = async (req, res, next) => {
  try {
    const updatedItem = await models.update(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// Delete an item
exports.deleteItem = async (req, res, next) => {
  try {
    const deleted = await models.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const models = require('../models');
`;
  }

  /**
   * Generate API models
   */
  private generateApiModels(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `/**
 * Data models for ${parsed.title} API
 */

// Example item interface
export interface Item {
  id: string;
  name: string;
  createdAt: Date;
  [key: string]: any;
}

// In-memory storage (replace with actual database in production)
const items: Item[] = [];

// Get all items
export async function getAll(): Promise<Item[]> {
  return [...items];
}

// Get item by ID
export async function getById(id: string): Promise<Item | undefined> {
  return items.find(item => item.id === id);
}

// Create a new item
export async function create(data: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
  const newItem: Item = {
    ...data,
    id: generateId(),
    createdAt: new Date()
  };
  
  items.push(newItem);
  return newItem;
}

// Update an item
export async function update(id: string, data: Partial<Item>): Promise<Item | undefined> {
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  
  items[index] = {
    ...items[index],
    ...data,
  };
  
  return items[index];
}

// Delete an item
export async function remove(id: string): Promise<boolean> {
  const initialLength = items.length;
  const newItems = items.filter(item => item.id !== id);
  
  if (initialLength === newItems.length) {
    return false;
  }
  
  items.splice(0, items.length, ...newItems);
  return true;
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
` : 
      `/**
 * Data models for ${parsed.title} API
 */

// In-memory storage (replace with actual database in production)
const items = [];

// Get all items
exports.getAll = async () => {
  return [...items];
};

// Get item by ID
exports.getById = async (id) => {
  return items.find(item => item.id === id);
};

// Create a new item
exports.create = async (data) => {
  const newItem = {
    ...data,
    id: generateId(),
    createdAt: new Date()
  };
  
  items.push(newItem);
  return newItem;
};

// Update an item
exports.update = async (id, data) => {
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  
  items[index] = {
    ...items[index],
    ...data,
  };
  
  return items[index];
};

// Delete an item
exports.remove = async (id) => {
  const initialLength = items.length;
  const newItems = items.filter(item => item.id !== id);
  
  if (initialLength === newItems.length) {
    return false;
  }
  
  items.splice(0, items.length, ...newItems);
  return true;
};

// Generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
`;
  }

  /**
   * Generate API middleware
   */
  private generateApiMiddleware(parsed: ParsedReadme, useTypeScript: boolean): string {
    return useTypeScript ?
      `import { Request, Response, NextFunction } from 'express';

/**
 * Example middleware for request validation
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  
  next();
}

/**
 * Example authentication middleware
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }
  
  // In a real implementation, validate the token/credentials
  // For now, we'll just let all requests through
  
  next();
}

/**
 * Request logger middleware
 */
export function logRequest(req: Request, res: Response, next: NextFunction): void {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
}
` : 
      `/**
 * Example middleware for request validation
 */
exports.validateRequest = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  
  next();
};

/**
 * Example authentication middleware
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }
  
  // In a real implementation, validate the token/credentials
  // For now, we'll just let all requests through
  
  next();
};

/**
 * Request logger middleware
 */
exports.logRequest = (req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
};
`;
  }
