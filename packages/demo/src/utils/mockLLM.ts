/**
 * Mock LLM utility for simulating keyword generation
 */

export function mockLLMGenerateKeywords(
  productTitle: string,
  category: string
): string[] {
  // Extract key terms from title
  const titleWords = productTitle.toLowerCase().split(/\s+/);
  const keywords: string[] = [];

  // Generate variations
  if (titleWords.includes("water") && titleWords.includes("bottle")) {
    keywords.push("stainless steel water bottle insulated");
    keywords.push("vacuum insulated bottle 32oz");
  }
  if (titleWords.includes("steel") || titleWords.includes("stainless")) {
    keywords.push("stainless steel insulated water bottle");
  }
  if (titleWords.includes("32oz") || titleWords.includes("32")) {
    keywords.push("32oz water bottle");
  }
  if (titleWords.includes("insulated")) {
    keywords.push("insulated water bottle");
  }

  // Add category-based keywords
  if (category.includes("Water Bottles")) {
    keywords.push("water bottle");
    keywords.push("drink bottle");
  }

  // Remove duplicates and return
  return Array.from(new Set(keywords));
}

export function mockLLMReasoning(productTitle: string): string {
  const titleWords = productTitle.toLowerCase();
  
  if (titleWords.includes("stainless steel")) {
    return "Extracted key product attributes: material (stainless steel), capacity (32oz), feature (insulated)";
  }
  
  return "Generated keywords based on product title and category analysis";
}

