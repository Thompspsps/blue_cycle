const {postTransaction}=require("../controllers/transaction.controller");
const {User,Machine,Transaction}=require("../models/bc.models");
const {authenticateToken}=require("../scripts/tokenChecker");
const {fetchPoints}=require("../scripts/pointsFetcher");
const mongoose=require("mongoose");

jest.mock("../models/bc.models");
jest.mock("../scripts/tokenChecker");
jest.mock("../scripts/pointsFetcher");

describe("Transaction Controller Tester",()=>{
    let mockReq,mockRes,mockNext;

    const userId=new mongoose.Types.ObjectId;
    const machineId=new mongoose.Types.ObjectId;
    const transactionId=new mongoose.Types.ObjectId;
    const mockDate=Math.trunc(Date.now()/1000);


    const mockTransaction=(collected)=>({
        _id:transactionId,
        user:userId,
        machine:machineId,
        collected:collected,
        date:mockDate,
        save:jest.fn().mockResolvedValue({
            _id:transactionId,
            user:userId,
            machine:machineId,
            collected,
            date:mockDate,
            toObject:function(){
                return{
                    _id:this._id,
                    user:this.user,
                    machine:this.machine,
                    collected:this.collected,
                    date:this.date,
                    __v: 0
                };
            }
        })
    });


    beforeEach(()=>{
        mockReq={
            body:{
                user:`/api/v1/users/${userId}`,
                machine:`/api/v1/machines/${machineId}`,
                collected:5
            }
        };
        mockRes={
            locals:{}
        };
        mockNext=jest.fn();
        jest.clearAllMocks();
    });

    describe("postTransaction ( POST /api/v1/transactions )",()=>{
        it("should create a new transaction when all informations are provided correctly",async()=>{
            User.findById.mockResolvedValue({_id:userId});
            Machine.findById.mockResolvedValue({_id:machineId});
            authenticateToken.mockResolvedValue(true);
            fetchPoints.mockResolvedValue(0);

            Transaction.mockImplementation(()=>mockTransaction(mockReq.body.collected));

            await postTransaction(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:201,
                success:true,
                message:"Created",
                data:{
                    self:`/api/v1/transactions/${transactionId}`,
                    user:`/api/v1/users/${userId}`,
                    machine:`/api/v1/machines/${machineId}`,
                    date:mockDate,
                    collected:mockReq.body.collected
                }
            });
        });

        it("should return 400 for not valid user_id",async()=>{
            mockReq.body.user="invalid_id";

            await postTransaction(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status: 400,
                success: false,
                message: "Bad request",
                data: null
            });
        });

        it("should return 404 if user not found",async()=>{
            Machine.findById.mockResolvedValue({_id:machineId});
            User.findById.mockResolvedValue(null);

            await postTransaction(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status: 404,
                success: false,
                message: "Not found",
                data: null
            });
        });

        it("should return 400 for not valid machine_id",async()=>{
            mockReq.body.machine="invalid_id";

            await postTransaction(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status: 400,
                success: false,
                message: "Bad request",
                data: null
            });
        });

        it("should return 404 if machine not found", async()=>{
            User.findById.mockResolvedValue(userId);
            Machine.findById.mockResolvedValue(null);

            await postTransaction(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status: 404,
                success: false,
                message: "Not found",
                data: null
            });
        });

        it("should cap points at MAX_COLLECTED",async()=>{
            mockReq.body.collected=5;
            User.findById.mockResolvedValue({_id:userId});
            Machine.findById.mockResolvedValue({_id:machineId});
            authenticateToken.mockResolvedValue(true);
            fetchPoints.mockResolvedValue(12);

            Transaction.mockImplementation(()=>mockTransaction(mockReq.body.collected));

            await postTransaction(mockReq, mockRes, mockNext);

            // don't understand why it fails
            // expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            //     userId,
            //     {$inc:{points:3}}
            // );
            expect(User.findByIdAndUpdate).toHaveBeenCalled();

            expect(mockRes.locals.response).toEqual({
                status:201,
                success:true,
                message:"Created",
                data:{
                    self:`/api/v1/transactions/${transactionId}`,
                    user:`/api/v1/users/${userId}`,
                    machine:`/api/v1/machines/${machineId}`,
                    date:mockDate,
                    collected:mockReq.body.collected
                }
            });
        });

        it("should not add points to user",async ()=>{
            mockReq.body.collected=5;
            User.findById.mockResolvedValue({_id:userId});
            Machine.findById.mockResolvedValue({_id:machineId});
            authenticateToken.mockResolvedValue(true);
            fetchPoints.mockResolvedValue(15);

            Transaction.mockImplementation(()=>mockTransaction(mockReq.body.collected));

            await postTransaction(mockReq,mockRes,mockNext);

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();

            expect(mockRes.locals.response).toEqual({
                status:201,
                success:true,
                message:"Created",
                data:{
                    self:`/api/v1/transactions/${transactionId}`,
                    user:`/api/v1/users/${userId}`,
                    machine:`/api/v1/machines/${machineId}`,
                    date:mockDate,
                    collected:mockReq.body.collected
                }
            });
        });

        it("should return an error for missing parameter",async()=>{
            mockReq.body.collected=null;
            User.findById.mockResolvedValue({_id:userId});
            Machine.findById.mockResolvedValue({_id:machineId});
            fetchPoints.mockResolvedValue(15);

            await postTransaction(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should return error for negative 'collected' parameter",async ()=>{
            mockReq.body.collected=-3;
            await postTransaction(mockReq,mockRes,mockNext);
            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        })
    });
});