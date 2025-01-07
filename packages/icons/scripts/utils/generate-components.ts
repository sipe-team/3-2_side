import fs from 'node:fs/promises';
import path from 'node:path';
import type { GenerateResult } from '../../src/types';
import { optimizeSvg } from './optimize-svg';
import { PATHS } from './paths';

function validateFileName(fileName: string): void {
  const isKebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fileName);

  if (!isKebabCase) {
    throw new Error(
      `Invalid file name: ${fileName}. File names must be in kebab-case (e.g., my-icon)`
    );
  }
}

function validateSvgContent(content: string, fileName: string): void {
  if (!content.includes('viewBox')) {
    throw new Error(`Missing viewBox in ${fileName}`);
  }
}

function toComponentName(fileName: string): string {
  const pascalCase = fileName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return `${pascalCase}Icon`;
}

function createComponentTemplate(componentName: string, svgContent: string): string {
  return `\
import * as React from 'react';
import type { IconProps } from '../types';

export const ${componentName} = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color, size = 24, ...props }, ref) => {
    return ${svgContent};
  }
);

${componentName}.displayName = '${componentName}';
`;
}

export async function generateComponents(): Promise<GenerateResult[]> {
  // 1. Create components directory if it doesn't exist
  await fs.mkdir(PATHS.COMPONENTS_DIR, { recursive: true });

  // 2. Get all SVG files
  const files = await fs.readdir(PATHS.ICONS_DIR);
  const svgFiles = files.filter(file => file.endsWith('.svg'));

  // 3. Generate components in parallel
  const results = await Promise.all(
    svgFiles.map(async (file): Promise<GenerateResult> => {
      const fileName = path.basename(file, '.svg');
      const componentName = toComponentName(fileName);

      try {
        validateFileName(fileName);

        // Read and optimize SVG
        const svgContent = await fs.readFile(
          path.join(PATHS.ICONS_DIR, file),
          'utf-8'
        );

        validateSvgContent(svgContent, fileName);

        const optimizedSvg = await optimizeSvg(svgContent);

        // Generate component
        const componentContent = createComponentTemplate(componentName, optimizedSvg);

        // Write component file
        await fs.writeFile(
          path.join(PATHS.COMPONENTS_DIR, `${fileName}.tsx`),
          componentContent
        );

        return { fileName, componentName, success: true };
      } catch (error) {
        return {
          fileName,
          componentName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  // 4. Generate index file with successful components
  const successfulResults = results.filter(r => r.success);
  const componentExports = successfulResults
    .map(r => `export { ${r.componentName} } from './components/${r.fileName}';`)
    .join('\n');

  const indexContent = `\
export type { IconProps } from './types';

${componentExports}
`;
  await fs.writeFile(
    path.join(PATHS.COMPONENTS_DIR, '../index.ts'),
    indexContent
  );

  return results;
 }