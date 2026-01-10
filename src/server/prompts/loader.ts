import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LengthCategory } from './taxonomy';

/**
 * Variables available for template interpolation.
 */
export interface TemplateVariables {
  title: string;
  channel: string;
  duration: string;
  publishedAt: string;
  lengthCategory: LengthCategory;
  transcript?: string;
  formattingRules: string;
}

// Cache templates after first load
const templateCache = new Map<string, string>();

/**
 * Load a prompt template from the templates directory.
 * Templates are cached after first load for performance.
 *
 * @param name - Template name without extension (e.g., "standard", "longform")
 * @returns Template content as string
 * @throws Error if template file not found
 */
export function loadTemplate(name: string): string {
  // Check cache first
  if (templateCache.has(name)) {
    return templateCache.get(name)!;
  }

  // Resolve template path relative to this file
  const templatePath = resolve(__dirname, 'templates', `${name}.prompt.md`);

  try {
    const content = readFileSync(templatePath, 'utf-8');
    templateCache.set(name, content);
    return content;
  } catch (error) {
    throw new Error(`Failed to load prompt template "${name}": ${(error as Error).message}`);
  }
}

/**
 * Interpolate template variables into a template string.
 * Supports:
 * - Simple variables: {{variable}}
 * - Conditional blocks: {{#variable}}content{{/variable}} (shown if variable is truthy)
 *
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns Interpolated string
 */
export function interpolate(template: string, variables: TemplateVariables): string {
  let result = template;

  // Handle conditional blocks first: {{#key}}content{{/key}}
  // If the variable is truthy, include the content; otherwise remove the block
  result = result.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_, key, content) => {
      const value = variables[key as keyof TemplateVariables];
      return value ? content : '';
    }
  );

  // Handle simple variable substitution: {{key}}
  result = result.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => {
      const value = variables[key as keyof TemplateVariables];
      return value !== undefined ? String(value) : '';
    }
  );

  // Clean up any resulting double blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Clear the template cache. Useful for development/testing.
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}
