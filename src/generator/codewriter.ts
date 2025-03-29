import { SourceFile, ProgrammingLanguage } from '../types/index.js';
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';

/**
 * Handles the writing of generated code to files or archives.
 */
export class CodeWriter {
  /**
   * Write source files to the filesystem
   * @param files Array of source files to write
   * @param outputDir Directory to write files to
   * @returns Promise resolving to an array of written file paths
   */
  public async writeFiles(files: SourceFile[], outputDir: string): Promise<string[]> {
    const writtenPaths: string[] = [];
    
    try {
      // Ensure output directory exists
      await fs.ensureDir(outputDir);
      
      // Write each file
      for (const file of files) {
        const filePath = path.join(outputDir, file.path);
        const fileDir = path.dirname(filePath);
        
        // Ensure directory for this file exists
        await fs.ensureDir(fileDir);
        
        // Write file content
        await fs.writeFile(filePath, file.content);
        writtenPaths.push(filePath);
      }
      
      return writtenPaths;
    } catch (error) {
      throw new Error(`Failed to write files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a zip archive of the generated files
   * @param files Array of source files to include in the archive
   * @param outputPath Path to write the zip file to
   * @returns Promise resolving to the path of the created zip file
   */
  public async createZipArchive(files: SourceFile[], outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a file to stream archive data to
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
          zlib: { level: 9 } // Compression level
        });

        // Listen for events
        output.on('close', () => {
          resolve(outputPath);
        });

        archive.on('error', (err) => {
          reject(new Error(`Archive error: ${err.message}`));
        });

        // Pipe archive data to the file
        archive.pipe(output);

        // Add each file to the archive
        for (const file of files) {
          archive.append(file.content, { name: file.path });
        }

        // Finalize the archive
        archive.finalize();
      } catch (error) {
        reject(new Error(`Failed to create zip archive: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Creates a temporary directory for the generated files
   * @returns Promise resolving to the path of the created temporary directory
   */
  public async createTempDirectory(): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp', `generated_${Date.now()}`);
    await fs.ensureDir(tempDir);
    return tempDir;
  }

  /**
   * Clean up temporary files and directories
   * @param tempPath Path to the temporary directory to clean up
   */
  public async cleanupTemp(tempPath: string): Promise<void> {
    try {
      await fs.remove(tempPath);
    } catch (error) {
      console.error(`Failed to clean up temporary directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
