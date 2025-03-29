import { ParsedReadme, GeneratorOptions, GenerationResult, SourceFile, AppType } from '../types/index.js';
import { CodeWriter } from './codewriter.js';
import path from 'path';

/**
 * Main code generator class that handles the generation of application code
 * based on a parsed README file.
 */
export class CodeGenerator {
  private codeWriter: CodeWriter;

  constructor() {
    this.codeWriter = new CodeWriter();
  }

  /**
   * Generate code from a parsed README
   * @param parsed The parsed README
   * @param options Generator options
   */
  public async generateCode(
    parsed: ParsedReadme,
    options: GeneratorOptions = {}
  ): Promise<GenerationResult> {
    try {
      // Determine application type and structure
      const appType = parsed.appType || AppType.WEB_APP;
      
      // Generate source files based on the application type
      const files = this.generateSourceFiles(parsed, options);

      // Determine the main file to run
      const mainFile = this.determineMainFile(files, appType);
      
      // Determine command to run the application
      const commandToRun = this.determineCommandToRun(appType, mainFile);

      // If an output format is specified, handle it
      let outputPath: string | undefined;
      if (options.outputFormat === 'zip') {
        // Create a temporary directory
        const tempDir = await this.codeWriter.createTempDirectory();
        
        // Write files to the temporary directory
        await this.codeWriter.writeFiles(files, tempDir);
        
        // Create a zip archive
        outputPath = path.join(process.cwd(), 'generated_app.zip');
        await this.codeWriter.createZipArchive(files, outputPath);
        
        // Clean up temporary directory
        await this.codeWriter.cleanupTemp(tempDir);
      } else if (options.outputFormat === 'files') {
        // Write files to the output directory
        outputPath = path.join(process.cwd(), 'generated_app');
        await this.codeWriter.writeFiles(files, outputPath);
      }

      return {
        files,
        outputPath,
        appType,
        mainFile,
        commandToRun
      };
    } catch (error) {
      throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate source files based on the parsed README
   * @param parsed The parsed README
   * @param options Generator options
   */
  private generateSourceFiles(
    parsed: ParsedReadme,
    options: GeneratorOptions
  ): SourceFile[] {
    // This is where we would use templates and the parsed README
    // to generate actual application code
    
    // For a simple implementation, we'll just create some basic files based on the app type
    const files: SourceFile[] = [];
    
    if (parsed.appType === AppType.WEB_APP) {
      // Basic web app structure
      files.push({
        path: 'index.html',
        content: this.generateHtmlContent(parsed),
        language: 'html' as any
      });
      
      files.push({
        path: 'style.css',
        content: this.generateCssContent(parsed),
        language: 'css' as any
      });
      
      files.push({
        path: 'app.js',
        content: this.generateJsContent(parsed),
        language: 'javascript' as any
      });
    } else if (parsed.appType === AppType.CLI_APP) {
      // Basic CLI app structure
      files.push({
        path: 'index.js',
        content: this.generateCliContent(parsed),
        language: 'javascript' as any
      });
      
      files.push({
        path: 'package.json',
        content: this.generatePackageJson(parsed),
        language: 'javascript' as any
      });
    }
    
    // In a more complete implementation, we would analyze the README in detail
    // and generate much more sophisticated code
    
    return files;
  }

  /**
   * Determine the main file to run for the application
   */
  private determineMainFile(files: SourceFile[], appType: AppType): string | undefined {
    switch (appType) {
      case AppType.WEB_APP:
        return files.find(f => f.path === 'index.html')?.path;
      case AppType.CLI_APP:
        return files.find(f => f.path === 'index.js')?.path;
      case AppType.API_SERVER:
        return files.find(f => f.path === 'server.js' || f.path === 'index.js')?.path;
      default:
        return undefined;
    }
  }

  /**
   * Determine the command to run the application
   */
  private determineCommandToRun(appType: AppType, mainFile?: string): string | undefined {
    if (!mainFile) return undefined;
    
    switch (appType) {
      case AppType.WEB_APP:
        return `open ${mainFile}`;
      case AppType.CLI_APP:
        return `node ${mainFile}`;
      case AppType.API_SERVER:
        return `node ${mainFile}`;
      default:
        return undefined;
    }
  }

  /**
   * Generate HTML content for a web application
   */
  private generateHtmlContent(parsed: ParsedReadme): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${parsed.title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${parsed.title}</h1>
    </header>
    <main>
        <p>${parsed.description}</p>
        <div id="app"></div>
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} Generated from Zero Source README</p>
    </footer>
    <script src="app.js"></script>
</body>
</html>`;
  }

  /**
   * Generate CSS content for a web application
   */
  private generateCssContent(parsed: ParsedReadme): string {
    return `/* Styles for ${parsed.title} */

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
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
}`;
  }

  /**
   * Generate JavaScript content for a web application
   */
  private generateJsContent(parsed: ParsedReadme): string {
    return `// Main application code for ${parsed.title}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Application initialized');
    initApp();
});

function initApp() {
    const appElement = document.getElementById('app');
    if (!appElement) return;
    
    appElement.innerHTML = '<p>Application successfully generated from Zero Source README!</p>';
}`;
  }

  /**
   * Generate CLI application content
   */
  private generateCliContent(parsed: ParsedReadme): string {
    return `#!/usr/bin/env node

console.log('${parsed.title}');
console.log('${parsed.description}');
console.log('');
console.log('This CLI application was generated from a Zero Source README.');`;
  }

  /**
   * Generate package.json for a JavaScript application
   */
  private generatePackageJson(parsed: ParsedReadme): string {
    return JSON.stringify({
      name: parsed.title.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: parsed.description,
      main: 'index.js',
      scripts: {
        start: 'node index.js'
      },
      author: '',
      license: 'MIT'
    }, null, 2);
  }
}
