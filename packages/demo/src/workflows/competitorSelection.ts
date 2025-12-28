/**
 * Competitor Selection Workflow
 * Demonstrates X-Ray SDK with a 3-step decision pipeline
 */
import { XRaySession } from "@xray/sdk";
// @ts-ignore - Workspace import
import { SQLiteStore } from "../../../server/src/store/SQLiteStore";
import { generateKeywords } from "../steps/keywordGeneration";
import { searchCandidates } from "../steps/candidateSearch";
import { filterAndRank } from "../steps/filterAndRank";
import { referenceProduct, type Product } from "../data/mockProducts";

export async function runCompetitorSelection(
  executionName: string = "competitor_selection"
): Promise<Product | null> {
  // Initialize X-Ray session with SQLite store
  const store = new SQLiteStore();
  const xray = new XRaySession({
    name: executionName,
    store,
  });

  try {
    console.log(`\n🚀 Starting execution: ${executionName}`);
    console.log(`Reference Product: ${referenceProduct.title}`);

    // Step 1: Generate keywords
    console.log("\n📝 Step 1: Generating search keywords...");
    const keywords = await generateKeywords(xray, referenceProduct);
    console.log(`   Generated keywords: ${keywords.join(", ")}`);

    // Step 2: Search candidates
    console.log("\n🔍 Step 2: Searching for candidate products...");
    const candidates = await searchCandidates(xray, keywords, 50);
    console.log(`   Found ${candidates.length} candidates`);

    // Step 3: Filter and rank
    console.log("\n⚖️  Step 3: Filtering and ranking candidates...");
    const selected = await filterAndRank(xray, candidates, referenceProduct);

    if (selected) {
      console.log(`\n✅ Selected competitor: ${selected.title}`);
      console.log(`   Price: $${selected.price}, Rating: ${selected.rating}★, Reviews: ${selected.reviews}`);
    } else {
      console.log("\n❌ No qualified competitor found");
    }

    // Complete the execution
    await xray.complete();
    console.log("\n✅ Execution completed and saved to database");
    console.log(`   Execution ID: ${xray.getId()}`);

    return selected;
  } catch (error) {
    console.error("\n❌ Error in workflow:", error);
    await xray.complete(); // Still save partial execution
    throw error;
  }
}

