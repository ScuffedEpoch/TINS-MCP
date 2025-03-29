import MarkdownIt from 'markdown-it';
import { ParsedReadme, ReadmeSection, AppType, ProgrammingLanguage } from '../types/index.js';

/**
 * Extracts structured information from a README file.
 * Parses the markdown content and converts it into a structured format.
 */
export class ReadmeExtractor {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt();
  }

  /**
   * Parse a README string and extract structured information
   * @param content The README markdown content
   * @returns Structured representation of the README
   */
  public extract(content: string): ParsedReadme {
    // Initialize the parsed readme structure
    const parsed: ParsedReadme = {
      title: '',
      description: '',
      sections: [],
      metadata: this.extractMetadata(content),
      complexity: 'MEDIUM' // Default complexity
    };

    // Extract title (first h1)
    const titleMatch = content.match(/^# (.*?)$/m);
    if (titleMatch && titleMatch[1]) {
      parsed.title = titleMatch[1].trim();
    }

    // Extract description (text between title and first h2)
    const descriptionMatch = content.match(/^# .*?\r?\n([\s\S]*?)(?=^## |\Z)/m);
    if (descriptionMatch && descriptionMatch[1]) {
      parsed.description = descriptionMatch[1].trim();
    }

    // Extract main sections (h2) and their subsections (h3+)
    parsed.sections = this.extractSections(content);

    // Determine application type and languages
    const typeAndLanguages = this.determineAppTypeAndLanguages(parsed);
    parsed.appType = typeAndLanguages.appType;
    parsed.languages = typeAndLanguages.languages;

    // Determine complexity from metadata or content analysis
    if (parsed.metadata['ZS:COMPLEXITY']) {
      if (parsed.metadata['ZS:COMPLEXITY'] === 'LOW' || 
          parsed.metadata['ZS:COMPLEXITY'] === 'MEDIUM' || 
          parsed.metadata['ZS:COMPLEXITY'] === 'HIGH') {
        parsed.complexity = parsed.metadata['ZS:COMPLEXITY'] as 'LOW' | 'MEDIUM' | 'HIGH';
      }
    } else {
      parsed.complexity = this.determineComplexity(parsed);
    }

    return parsed;
  }

  /**
   * Extract sections from the README content
   * @param content The README markdown content
   * @returns Array of sections with nested subsections
   */
  private extractSections(content: string): ReadmeSection[] {
    const sections: ReadmeSection[] = [];
    const lines = content.split('\n');
    
    let currentSection: ReadmeSection | null = null;
    let currentSubsection: ReadmeSection | null = null;
    let currentContent = '';
    
    // Helper to save accumulated content to the appropriate section
    const saveContent = () => {
      if (currentContent.trim() !== '') {
        if (currentSubsection) {
          currentSubsection.content += currentContent;
        } else if (currentSection) {
          currentSection.content += currentContent;
        }
        currentContent = '';
      }
    };

    for (const line of lines) {
      // Detect headings
      const h2Match = line.match(/^## (.*?)$/);
      const h3Match = line.match(/^### (.*?)$/);
      const h4Match = line.match(/^#### (.*?)$/);
      
      if (h2Match) {
        // Save any accumulated content
        saveContent();
        
        // Create a new top-level section
        currentSection = {
          title: h2Match[1].trim(),
          content: '',
          subsections: [],
          level: 2
        };
        sections.push(currentSection);
        currentSubsection = null;
      } else if (h3Match && currentSection) {
        // Save any accumulated content
        saveContent();
        
        // Create a new subsection
        currentSubsection = {
          title: h3Match[1].trim(),
          content: '',
          subsections: [],
          level: 3
        };
        currentSection.subsections.push(currentSubsection);
      } else if (h4Match && currentSubsection) {
        // Save any accumulated content
        saveContent();
        
        // Create a new sub-subsection
        const subSubsection: ReadmeSection = {
          title: h4Match[1].trim(),
          content: '',
          subsections: [],
          level: 4
        };
        currentSubsection.subsections.push(subSubsection);
        // We don't track sub-subsections as current, they just accumulate content
      } else {
        // Accumulate content
        currentContent += line + '\n';
      }
    }
    
    // Save any remaining content
    saveContent();
    
    return sections;
  }

  /**
   * Extract metadata tags from the README content
   * @param content The README markdown content
   * @returns Record of metadata key-value pairs
   */
  private extractMetadata(content: string): Record<string, string> {
    const metadata: Record<string, string> = {};
    const metadataRegex = /<!--\s*ZS:(\w+):(\w+)\s*-->/g;
    
    let match;
    while ((match = metadataRegex.exec(content)) !== null) {
      const key = match[1];
      const value = match[2];
      metadata[`ZS:${key}`] = value;
    }
    
    return metadata;
  }

  /**
   * Determine the application type and programming languages from the README content
   * @param parsed The parsed README
   * @returns Detected app type and languages
   */
  private determineAppTypeAndLanguages(parsed: ParsedReadme): { 
    appType: AppType; 
    languages: ProgrammingLanguage[] 
  } {
    let appType = AppType.UNKNOWN;
    const languages: ProgrammingLanguage[] = [];
    
    // First check metadata
    if (parsed.metadata['ZS:PLATFORM']) {
      switch (parsed.metadata['ZS:PLATFORM']) {
        case 'WEB':
          appType = AppType.WEB_APP;
          break;
        case 'MOBILE':
          appType = AppType.MOBILE_APP;
          break;
        case 'CLI':
          appType = AppType.CLI_APP;
          break;
        case 'DESKTOP':
          appType = AppType.DESKTOP_APP;
          break;
        case 'API':
          appType = AppType.API_SERVER;
          break;
      }
    }
    
    if (parsed.metadata['ZS:LANGUAGE']) {
      const lang = parsed.metadata['ZS:LANGUAGE'].toLowerCase();
      switch (lang) {
        case 'javascript':
          languages.push(ProgrammingLanguage.JAVASCRIPT);
          languages.push(ProgrammingLanguage.HTML);
          languages.push(ProgrammingLanguage.CSS);
          break;
        case 'typescript':
          languages.push(ProgrammingLanguage.TYPESCRIPT);
          languages.push(ProgrammingLanguage.HTML);
          languages.push(ProgrammingLanguage.CSS);
          break;
        case 'python':
          languages.push(ProgrammingLanguage.PYTHON);
          break;
        case 'java':
          languages.push(ProgrammingLanguage.JAVA);
          break;
        case 'csharp':
        case 'c#':
          languages.push(ProgrammingLanguage.CSHARP);
          break;
        case 'go':
          languages.push(ProgrammingLanguage.GO);
          break;
      }
    }
    
    // If metadata didn't provide enough info, try to infer from content
    if (appType === AppType.UNKNOWN || languages.length === 0) {
      // Check all content for keywords
      const fullText = [
        parsed.title,
        parsed.description,
        ...parsed.sections.map(s => s.title + ' ' + s.content + ' ' + 
          s.subsections.map(ss => ss.title + ' ' + ss.content).join(' '))
      ].join(' ').toLowerCase();
      
      // Detect app type from keywords
      if (fullText.includes('web') || fullText.includes('browser') || 
          fullText.includes('html') || fullText.includes('css') ||
          fullText.includes('javascript') || fullText.includes('frontend')) {
        appType = AppType.WEB_APP;
      } else if (fullText.includes('mobile') || fullText.includes('ios') || 
                fullText.includes('android') || fullText.includes('app')) {
        appType = AppType.MOBILE_APP;
      } else if (fullText.includes('cli') || fullText.includes('command line') || 
                fullText.includes('terminal') || fullText.includes('console')) {
        appType = AppType.CLI_APP;
      } else if (fullText.includes('desktop') || fullText.includes('electron') || 
                fullText.includes('gui') || fullText.includes('windows application')) {
        appType = AppType.DESKTOP_APP;
      } else if (fullText.includes('api') || fullText.includes('server') || 
                fullText.includes('rest') || fullText.includes('backend') ||
                fullText.includes('endpoint')) {
        appType = AppType.API_SERVER;
      }
      
      // Detect languages from keywords if not provided in metadata
      if (languages.length === 0) {
        if (fullText.includes('typescript')) {
          languages.push(ProgrammingLanguage.TYPESCRIPT);
        }
        if (fullText.includes('javascript')) {
          languages.push(ProgrammingLanguage.JAVASCRIPT);
        }
        if (fullText.includes('html')) {
          languages.push(ProgrammingLanguage.HTML);
        }
        if (fullText.includes('css')) {
          languages.push(ProgrammingLanguage.CSS);
        }
        if (fullText.includes('python')) {
          languages.push(ProgrammingLanguage.PYTHON);
        }
        if (fullText.includes('java ') || fullText.includes('java.')) {
          languages.push(ProgrammingLanguage.JAVA);
        }
        if (fullText.includes('c#') || fullText.includes('csharp') || fullText.includes('.net')) {
          languages.push(ProgrammingLanguage.CSHARP);
        }
        if (fullText.includes('golang') || fullText.includes(' go ')) {
          languages.push(ProgrammingLanguage.GO);
        }
      }
      
      // Default to web app with JavaScript if still unknown
      if (appType === AppType.UNKNOWN) {
        appType = AppType.WEB_APP;
      }
      
      if (languages.length === 0) {
        // For web apps, default to JavaScript, HTML, CSS
        if (appType === AppType.WEB_APP) {
          languages.push(ProgrammingLanguage.JAVASCRIPT);
          languages.push(ProgrammingLanguage.HTML);
          languages.push(ProgrammingLanguage.CSS);
        } else {
          // Default to JavaScript for other app types
          languages.push(ProgrammingLanguage.JAVASCRIPT);
        }
      }
    }
    
    return {
      appType,
      languages
    };
  }

  /**
   * Determine the complexity of the application from the README content
   * @param parsed The parsed README
   * @returns Estimated complexity level
   */
  private determineComplexity(parsed: ParsedReadme): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Count the number of features and technical details
    let featureCount = 0;
    let technicalDetailCount = 0;
    
    // Look for functionality section
    const functionalitySection = parsed.sections.find(s => s.title === 'Functionality');
    if (functionalitySection) {
      // Count features in subsections
      const featuresSection = functionalitySection.subsections.find(
        s => s.title.includes('Features') || s.title.includes('Capabilities')
      );
      
      if (featuresSection) {
        // Count bullet points as features
        featureCount = (featuresSection.content.match(/^[ \t]*[-*][ \t]/gm) || []).length;
      }
    }
    
    // Look for technical implementation section
    const technicalSection = parsed.sections.find(s => s.title === 'Technical Implementation');
    if (technicalSection) {
      // Count the number of subsections as technical details
      technicalDetailCount = technicalSection.subsections.length;
      
      // Also count code blocks as technical details
      const codeBlockCount = (technicalSection.content.match(/```/g) || []).length / 2;
      technicalDetailCount += codeBlockCount;
    }
    
    // Determine complexity based on counts
    const totalComplexityScore = featureCount + technicalDetailCount * 2;
    
    if (totalComplexityScore < 5) {
      return 'LOW';
    } else if (totalComplexityScore < 15) {
      return 'MEDIUM';
    } else {
      return 'HIGH';
    }
  }
}
