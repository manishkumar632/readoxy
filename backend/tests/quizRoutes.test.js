const request = require("supertest");
const express = require("express");
const { client } = require("../server");
const quizRoutes = require("../routes/quizRoutes");

const app = express();
app.use(express.json());
app.use("/api/quiz", quizRoutes);

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.close();
});

describe("POST /api/quiz/verify", () => {
  it("should return 200 for a valid quiz code", async () => {
    const db = client.db("questions");
    const quizCodesCollection = db.collection("quizcodes");

    const validQuizCode = "CM3L9F";
    await quizCodesCollection.insertOne({ quizCode: validQuizCode });

    const response = await request(app)
      .post("/api/quiz/verify")
      .send({ quizCode: validQuizCode });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Valid quiz code");

    await quizCodesCollection.deleteMany({});
  });

  it("should return 400 for an invalid quiz code", async () => {
    const response = await request(app)
      .post("/api/quiz/verify")
      .send({ quizCode: "INVALID123" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired quiz code");
  });
});
