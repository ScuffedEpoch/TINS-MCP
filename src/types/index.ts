/**
 * Core types for the TINS (There Is No Software) MCP server.
 * These types define the structure of parsed README files and generated applications.
 */

/**
 * Supported application types that can be generated
 */
export enum AppType {
  WEB_APP = 'web-app',
  MOBILE_APP = 'mobile-app',
  CLI_APP = 'cli-app',
  DESKTOP_APP = 'desktop-app',
  API_SERVER = 'api-server',
  UNKNOWN = 'unknown'
}

/**
 * Supported programming languages for code generation
 */
export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  HTML = 'html',
  CSS = 'css',
  PYTHON = 'python',
  JAVA = 'java',
  CSHARP = 'csharp',
  GO = 'go'
}

/**
 * Represents a section of the README file
 */
export interface ReadmeSection {
  title: string;
  content: string;
  subsections: ReadmeSection[];
  level: number;
}

/**
 * Structure of the parsed README file
 */
export interface ParsedReadme {
  title: string;
  description: string;
  sections: ReadmeSection[];
  metadata: Record<string, string>;
  appType?: AppType;
  languages?: ProgrammingLanguage[];
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Validator result for README file validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Represents a source code file to be generated
 */
export interface SourceFile {
  path: string;
  content: string;
  language: ProgrammingLanguage;
}

/**
 * Options for the code generator
 */
export interface GeneratorOptions {
  preferredLanguage?: ProgrammingLanguage;
  outputFormat?: 'files' | 'zip' | 'tarball';
  includeComments?: boolean;
  styleFramework?: string;
}

/**
 * Result of the code generation process
 */
export interface GenerationResult {
  files: SourceFile[];
  outputPath?: string;
  appType: AppType;
  mainFile?: string;
  commandToRun?: string;
}

/**
 * Template for generating code based on application type
 */
export interface CodeTemplate {
  name: string;
  appType: AppType;
  languages: ProgrammingLanguage[];
  files: TemplateFile[];
}

/**
 * Template file with placeholders
 */
export interface TemplateFile {
  path: string;
  template: string;
  language: ProgrammingLanguage;
}
