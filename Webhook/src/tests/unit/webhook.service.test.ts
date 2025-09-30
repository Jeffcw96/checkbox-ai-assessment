import {
  validateEvent,
  validateSchemaPayload,
} from "../../service/webhook.service";

describe("webhook.service validateEvent", () => {
  it("rejects non-string event", () => {
    // @ts-expect-error testing invalid
    expect(validateEvent(123).isValid).toBe(false);
  });

  it("rejects unsupported event", () => {
    expect(validateEvent("unknown.event").isValid).toBe(false);
  });

  it("accepts supported event", () => {
    expect(validateEvent("contract.created").isValid).toBe(true);
  });
});

describe("webhook.service validateSchemaPayload", () => {
  it("rejects payload with missing required fields", () => {
    const result = validateSchemaPayload({
      event: "contract.created",
      // missing contract object
    } as any);
    expect(result.isValid).toBe(false);
    expect(result.isValid ? "" : result.error).toContain("contract");
  });

  it("accepts valid contract.created payload", () => {
    const payload = {
      event: "contract.created",
      contract: {
        id: "c1",
        title: "Agreement",
        status: "Draft",
        createdAt: new Date().toISOString(),
        users: [{ id: "u1", name: "Alice", role: "Owner" }],
      },
    };
    const result = validateSchemaPayload(payload);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.data.contract.title).toBe("Agreement");
    }
  });

  it("accepts valid contract.status_updated payload", () => {
    const payload = {
      event: "contract.status_updated",
      contractId: "c1",
      status: "Done",
      updatedAt: new Date().toISOString(),
    };
    const result = validateSchemaPayload(payload);
    expect(result.isValid).toBe(true);
  });

  it("accepts valid contract.comment_added payload", () => {
    const payload = {
      event: "contract.comment_added",
      contractId: "c1",
      comment: {
        id: "cm1",
        author: "Bob",
        message: "Looks good",
        createdAt: new Date().toISOString(),
      },
    };
    const result = validateSchemaPayload(payload);
    expect(result.isValid).toBe(true);
  });
});
