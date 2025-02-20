const request = require("supertest");
const { client } = require("../server");
const app = require("../server");

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.close();
});

describe("GET /api/quiz/latest", () => {
  it("should return the latest quiz code", async () => {
    const response = await request(app).get("/api/quiz/latest");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("quizCode");
    expect(response.body).toHaveProperty("expiresAt");
  });

  it("should return 404 if no quiz code is found", async () => {
    const db = client.db("questions");
    const quizCodesCollection = db.collection("quizcodes");

    await quizCodesCollection.deleteMany({});

    const response = await request(app).get("/api/quiz/latest");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No active quiz code found");
  });
});
