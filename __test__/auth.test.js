const {User,Admin}=require("../models/bc.models");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mongoose=require("mongoose");
const {userAuth,adminAuth}=require("../controllers/auth.controller");

jest.mock("../models/bc.models");
jest.mock("bcrypt");

// const KEY=process.env.SECRET_KEY || "another-secret-key";

describe("Authentication Controller Tester",()=>{
    let mockReq,mockRes,mockNext;

    const userId=new mongoose.Types.ObjectId;
    // const token=jwt.sign({id:userId,role:"user"},KEY,{expiresIn:"1h"});

    const mockEmail="mario.rossi@example.com";
    const mockPassword="98owjine2b34";

    beforeEach(()=>{
        mockReq={
            body:{
                email:mockEmail,
                password:mockPassword
            }
        };
        mockRes={
            locals:{}
        };
        mockNext=jest.fn();
        jest.clearAllMocks();
    });

    describe("userAuth ( POST /api/v1/userAuth )",()=>{
        it("should authenticate with correct credentials",async()=>{
            User.findOne.mockResolvedValue({
                _id:userId,
                email:mockEmail,
                password:{
                    content:"gibberish_string",
                    temporary:false
                }
            });
            bcrypt.compare.mockResolvedValue(true);

            await userAuth(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response.status).toBe(200);
        });

        it("should not authenticate with incorrect credentials (wrong password)",async()=>{
            User.findOne.mockResolvedValue({
                _id:userId,
                email:mockEmail,
                password:{
                    content:"gibberish_string",
                    temporary:false
                }
            });
            bcrypt.compare.mockResolvedValue(false);

            await userAuth(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null});
        });

        it("should not authenticate with incorrect credentials (wrong email)",async()=>{
            User.findOne.mockResolvedValue(null);

            await userAuth(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:404,
                success:false,
                message:"Not found",
                data:null
            });
        });

        it("should not authenticate with missing parameters (missing email)",async()=>{
            mockReq.body.email=null;

            await userAuth(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should not authenticate with missing parameters (missing password)",async()=>{
            mockReq.body.password=null;

            await userAuth(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });
    });
});


//same tests can be run for admin users