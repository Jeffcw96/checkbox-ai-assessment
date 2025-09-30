import { handleNewContractCreation } from "../../src/service/contract.service";

jest.mock("../../src/db/client", () => ({
  db: {
    transaction: jest.fn(),
  },
}));

describe("contract.service handleNewContractCreation", () => {
  it("rejects invalid payload (missing contract)", async () => {
    const res = await handleNewContractCreation({
      eventId: "evt_123",
      event: "contract.created",
      // no contract object
    } as any);
    expect(res.isValid).toBe(false);
    if (res.isValid === false) {
      const parsed = JSON.parse(res.error || "");
      expect(parsed.event).toBe("contract.created");
      expect(parsed.issues[0].path).toContain("contract");
    }
  });

  it("rejects contract with missing required fields", async () => {
    const res = await handleNewContractCreation({
      event: "contract.created",
      contract: { id: "c1" }, // incomplete
    } as any);
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      const parsed = JSON.parse(res.error || "");
      const paths = parsed.issues.map((i: any) => i.path);
      expect(paths).toEqual(expect.arrayContaining(["contract.title"]));
    }
  });
});
