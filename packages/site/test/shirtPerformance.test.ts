import { describe, expect, it } from "vitest";
import { resolveShirtKitCode } from "@/lib/shirts";
import { ShirtColor, ShirtUsageType, type Shirt } from "@/lib/types";

function shirt(overrides: Partial<Shirt> = {}): Shirt {
  return {
    id: "shirt-1",
    slug: "2014-home-shirt",
    name: "2014 Home Shirt",
    price: "",
    manufacturer: "",
    imagesCollection: { items: [] },
    description: null,
    variants: [],
    use: ShirtUsageType.Home,
    seasons: ["2014"],
    color: ShirtColor.White,
    decade: "2010s",
    ...overrides,
  };
}

describe("shirt performance kit mapping", () => {
  it("uses the kit embedded in an avatar-builder URL", () => {
    expect(
      resolveShirtKitCode(
        shirt({
          avatarImageUrl:
            "https://www.tranmere-web.com/builder/1997gk/simple/cccccc/none/cccccc/cccccc/none/cccccc",
        }),
      ),
    ).toBe("1997gk");
  });

  it("maps standard shirt usages to their avatar kit suffix", () => {
    expect(
      resolveShirtKitCode(
        shirt({
          slug: "2014-away-shirt",
          use: ShirtUsageType.Away,
        }),
      ),
    ).toBe("2014A");
  });

  it("finds the spanning avatar kit for a shirt without an exact year asset", () => {
    expect(
      resolveShirtKitCode(
        shirt({
          slug: "1973-home-shirt",
          name: "1973 Home Shirt",
          seasons: ["1973"],
          decade: "1970s",
        }),
      ),
    ).toBe("1972");
  });
});
