import { describe, expect, it } from "vitest";
import {
  descriptionDocumentToText,
  descriptionTextToDocument,
} from "@/lib/shirtDescription";

describe("shirt descriptions", () => {
  it("converts admin text into Contentful rich text", () => {
    const document = descriptionTextToDocument(
      "First paragraph.\n\nSecond paragraph.",
    );

    expect(document?.nodeType).toBe("document");
    expect(document?.content).toHaveLength(2);
    expect(descriptionDocumentToText(document ?? undefined)).toBe(
      "First paragraph.\n\nSecond paragraph.",
    );
  });

  it("stores an empty description as null", () => {
    expect(descriptionTextToDocument("   ")).toBeNull();
  });
});
