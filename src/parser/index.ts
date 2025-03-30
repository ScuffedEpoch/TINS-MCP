import { ReadmeValidator } from './validator.js';
import { ReadmeExtractor } from './extractor.js';
import { ParsedReadme, ValidationResult } from '../types/index.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Main parser class that handles README file parsing and validation.
 */
export class ReadmeParser {
  private validator: ReadmeValidator;
  private extractor: ReadmeExtractor;

  constructor() {
    this.validator = new ReadmeValidator();
    this.extractor = new ReadmeExtractor();
  }

  /**
   * Parse a README file from a file path
   * @param filePath Path to the README.md file
   * @returns Structured representation of the README
   * @throws Error if the file cannot be read or parsed
   */
  public async parseFile(filePath: string): Promise<ParsedReadme> {
    try {
      // Check if file exists
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseContent(content);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse README file: ${error.message}`);
      } else {
        throw new Error('Failed to parse README file: Unknown error');
      }
    }
  }

  /**
   * Parse README content from a string
   * @param content The README markdown content
   * @returns Structured representation of the README
   */
  public parseContent(content: string): ParsedReadme {
    // Validate content first
    const validationResult = this.validator.validateContent(content);
    if (!validationResult.valid && validationResult.errors.length > 0) {
      throw new Error(`Invalid README format: ${validationResult.errors.join(', ')}`);
    }

    // Extract structured information
    return this.extractor.extract(content);
  }

  /**
   * Validate a README file against the Zero Source specification
   * @param filePath Path to the README.md file
   * @returns Validation result with any errors or warnings
   */
  public async validateFile(filePath: string): Promise<ValidationResult> {
    try {
      // Check if file exists
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        return {
          valid: false,
          errors: [`File not found: ${filePath}`],
          warnings: []
        };
      }

      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      return this.validator.validateContent(content);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to validate README file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }
}

export { ReadmeValidator, ReadmeExtractor };
