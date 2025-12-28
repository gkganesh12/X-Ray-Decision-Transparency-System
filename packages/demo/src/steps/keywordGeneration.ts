/**
 * Step 1: Keyword Generation (Mock LLM)
 */
import type { XRaySession } from "@xray/sdk";
import { mockLLMGenerateKeywords, mockLLMReasoning } from "../utils/mockLLM";
import type { Product } from "../data/mockProducts";

export async function generateKeywords(
  xray: XRaySession,
  product: Product
): Promise<string[]> {
  // Simulate LLM processing
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const keywords = mockLLMGenerateKeywords(product.title, product.category || "");
  const reasoning = mockLLMReasoning(product.title);

  await xray.step("keyword_generation", (step) => {
    step.input({
      product_title: product.title,
      category: product.category || "Unknown",
    });

    step.output({
      keywords,
      model: "gpt-4",
    });

    step.reasoning(reasoning);
  });

  return keywords;
}

