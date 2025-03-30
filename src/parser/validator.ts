import { ValidationResult, ParsedReadme } from '../types/index.js';

/**
 * Validates a README file against the Zero Source specification.
 * Checks for required sections, proper formatting, and consistency.
 */
export class ReadmeValidator {
  /**
   * Validates a README string content against the Zero Source specification
   * @param content The README markdown content
   * @returns Validation result with any errors or warnings
   */
  public validateContent(content: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check if content is empty
    if (!content || content.trim() === '') {
      result.valid = false;
      result.errors.push('README content is empty');
      return result;
    }

    // Check for required title (level 1 heading)
    if (!this.hasProjectTitle(content)) {
      result.valid = false;
      result.errors.push('Missing project title (level 1 heading at the start)');
    }

    // Check for required sections
    const requiredSections = ['Description', 'Functionality', 'Technical Implementation'];
    const missingSections = this.findMissingSections(content, requiredSections);
    
    if (missingSections.length > 0) {
      result.valid = false;
      missingSections.forEach(section => {
        result.errors.push(`Missing required section: ${section}`);
      });
    }

    // Check for functionality subsections
    if (!this.hasFunctionalitySubsections(content)) {
      result.warnings.push('Functionality section may be missing detailed subsections (Core Features, User Interface, etc.)');
    }

    // Check for technical implementation subsections
    if (!this.hasTechnicalSubsections(content)) {
      result.warnings.push('Technical Implementation section may be missing detailed subsections (Architecture, Data Structures, etc.)');
    }

    // Check for contradictions or inconsistencies
    // This would require more sophisticated parsing and analysis

    return result;
  }

  /**
   * Validates a parsed README structure
   * @param parsed The parsed README structure
   * @returns Validation result with any errors or warnings
   */
  public validateParsed(parsed: ParsedReadme): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check for required fields
    if (!parsed.title) {
      result.valid = false;
      result.errors.push('Missing project title');
    }

    if (!parsed.description || parsed.description.trim() === '') {
      result.valid = false;
      result.errors.push('Missing or empty description');
    }

    // Check for required sections
    const requiredSections = ['Functionality', 'Technical Implementation'];
    const foundSections = new Set(parsed.sections.map(s => s.title));
    
    for (const required of requiredSections) {
      if (!foundSections.has(required)) {
        result.valid = false;
        result.errors.push(`Missing required section: ${required}`);
      }
    }

    // Check for metadata completeness
    if (Object.keys(parsed.metadata).length === 0) {
      result.warnings.push('No metadata tags found. Consider adding ZS:PLATFORM, ZS:LANGUAGE, etc.');
    }

    return result;
  }

  /**
   * Checks if the README has a project title (level 1 heading at the start)
   */
  private hasProjectTitle(content: string): boolean {
    const lines = content.split('\n');
    // Find the first non-empty line
    for (const line of lines) {
      if (line.trim() === '') continue;
      return line.startsWith('# ');
    }
    return false;
  }

  /**
   * Finds missing required sections in the README
   */
  private findMissingSections(content: string, requiredSections: string[]): string[] {
    const missing: string[] = [];
    // Simple regex to find level 2 headings
    const sectionRegex = /^## ([^\n#]+)/gm;
    const foundSections = new Set<string>();
    
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      foundSections.add(match[1].trim());
    }

    for (const section of requiredSections) {
      if (!foundSections.has(section)) {
        missing.push(section);
      }
    }

    return missing;
  }

  /**
   * Checks if the README has detailed subsections under Functionality
   */
  private hasFunctionalitySubsections(content: string): boolean {
    // Find the Functionality section
    const functionalityRegex = /## Functionality\s+([\s\S]*?)(?=^##|\Z)/m;
    const match = functionalityRegex.exec(content);
    
    if (!match) return false;
    
    // Check for level 3 headings within the section
    const subsectionRegex = /### ([^\n#]+)/g;
    const functionalityContent = match[1];
    
    return subsectionRegex.test(functionalityContent);
  }

  /**
   * Checks if the README has detailed subsections under Technical Implementation
   */
  private hasTechnicalSubsections(content: string): boolean {
    // Find the Technical Implementation section
    const technicalRegex = /## Technical Implementation\s+([\s\S]*?)(?=^##|\Z)/m;
    const match = technicalRegex.exec(content);
    
    if (!match) return false;
    
    // Check for level 3 headings within the section
    const subsectionRegex = /### ([^\n#]+)/g;
    const technicalContent = match[1];
    
    return subsectionRegex.test(technicalContent);
  }
}
