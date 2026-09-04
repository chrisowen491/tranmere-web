import { BLOCKS, type Document } from "@contentful/rich-text-types";

export function descriptionTextToDocument(value: string): Document | null {
  const text = value.trim();
  if (!text) return null;

  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: text.split(/\n\s*\n/).map((paragraph) => ({
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [
        {
          nodeType: "text",
          value: paragraph.trim(),
          marks: [],
          data: {},
        },
      ],
    })),
  };
}

export function descriptionDocumentToText(document: Document | undefined) {
  if (!document) return "";

  return document.content
    .map((node) =>
      "content" in node
        ? node.content
            .map((child) => ("value" in child ? child.value : ""))
            .join("")
        : "",
    )
    .filter(Boolean)
    .join("\n\n");
}
