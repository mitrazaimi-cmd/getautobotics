import { describe, expect, it } from "vitest";
import { csvCell, neutralizeFormula, toCsv } from "@/lib/csv";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("CSV export safety", () => {
  it("neutralizes spreadsheet formulas", () => {
    for (const payload of ["=HYPERLINK(\"http://x\")", "+1+1", "-2+3", "@SUM(A1)", "\tcmd"]) {
      expect(neutralizeFormula(payload).startsWith("'")).toBe(true);
    }
    expect(neutralizeFormula("Normal text")).toBe("Normal text");
  });

  it("quotes cells with commas, quotes, and newlines", () => {
    expect(csvCell('He said "hi", then\nleft')).toBe('"He said ""hi"", then\nleft"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01T00:00:00.000Z");
  });

  it("builds a UTF-8 BOM CSV with CRLF rows", () => {
    const csv = toCsv(["a", "b"], [["=1", "x"]]);
    expect(csv).toBe("\uFEFFa,b\r\n'=1,x\r\n");
  });
});

describe("admin password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(hash).not.toContain("$");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("anything", "plaintext-password")).toBe(false);
    expect(await verifyPassword("anything", "scrypt:0:8:1:abc:def")).toBe(false);
  });
});
