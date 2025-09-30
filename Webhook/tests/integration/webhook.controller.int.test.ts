import request from "supertest";

import * as publishEventModule from "../../src/service/webhook.service";
const publishSpy = jest
  .spyOn(publishEventModule, "publishEventToQueue")
  .mockResolvedValue({ isValid: true });

import app from "../../src";

afterEach(() => {
  jest.clearAllMocks();
  publishSpy.mockClear();
});

describe("POST /webhook/contracts", () => {
  const url = "/webhook/contracts";

  it("returns 400 for missing body", async () => {
    const res = await request(app).post(url).send("");
    expect(res.status).toBe(400);
    expect(res.body.errorType).toBe("bad-request");
  });

  it("returns 400 for invalid event type", async () => {
    const res = await request(app).post(url).send({ event: "invalid.type" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Missing or invalid");
  });

  it("returns 400 for schema errors", async () => {
    const res = await request(app)
      .post(url)
      .send({ event: "contract.created", contract: { id: "c1" } }); // missing fields
    expect(res.status).toBe(400);
    expect(res.body.message).toMatchObject({
      event: "contract.created",
      issues: [
        {
          code: "invalid_type",
          message: "Invalid input: expected string, received undefined",
          path: "contract.title",
        },
        {
          code: "invalid_value",
          message: 'Invalid option: expected one of "Draft"|"In Review"|"Done"',
          path: "contract.status",
        },
        {
          code: "invalid_type",
          message: "Invalid input: expected string, received undefined",
          path: "contract.createdAt",
        },
        {
          code: "invalid_type",
          message: "Invalid input: expected array, received undefined",
          path: "contract.users",
        },
      ],
    });
  });

  it("returns 200 for valid contract.created", async () => {
    const payload = {
      event: "contract.created",
      contract: {
        id: "c1",
        title: "Master Service Agreement",
        status: "Draft",
        createdAt: new Date().toISOString(),
        users: [{ id: "u1", name: "Alice", role: "Owner" }],
        comments: [],
      },
    };
    const res = await request(app).post(url).send(payload);
    expect(res.status).toBe(200);
    expect(res.body.event).toBe("contract.created");
  });

  it("returns 200 for valid contract.status_updated", async () => {
    const payload = {
      event: "contract.status_updated",
      contractId: "c1",
      status: "In Review",
      updatedAt: new Date().toISOString(),
    };
    const res = await request(app).post(url).send(payload);
    expect(res.status).toBe(200);
    expect(res.body.event).toBe("contract.status_updated");
  });
});
