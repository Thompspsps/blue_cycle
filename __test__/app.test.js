const request=require("supertest");
const app=require("../app");

describe("test for express application",()=>{
    test("app should be defined",()=>{
        expect(app).toBeDefined();
    });

    test("GET / should return status 200",async ()=>{
        app.get("/",(req,res)=>res.sendStatus(200));
  
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });
});