import request from "supertest";
import app from "../../src";

jest.mock("../../src/service/webhook.service", () => ({
  getEventRouter: () => ({
    "contract.created": jest.fn(async () => ({
      isValid: true,
      data: { ok: true },
    })),
  }),
}));

describe("Backend webhook route", () => {
  it("returns 400 for unknown event", async () => {
    const res = await request(app)
      .post("/webhook")
      .send({ event: "unknown.event" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("No handler for event");
  });

  it("returns 200 for handled event", async () => {
    const res = await request(app)
      .post("/webhook")
      .send({
        event: "contract.created",
        contract: {
          id: "c1",
          title: "Test",
          status: "Draft",
          createdAt: new Date().toISOString(),
          users: [],
          comments: [],
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.processed).toBe(true);
  });
});
