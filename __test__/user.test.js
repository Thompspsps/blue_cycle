const{postUser,
    patchUserById,
    postUserByIdWishlistedCoupon,
    deleteUserByIdWishlistedCouponById,
    postUserByIdCoupon,
    getUserByIdCoupons}=require("../controllers/user.controller");
const {User,Coupon,WishlistedCoupon, CouponPrototype} = require("../models/bc.models");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {authenticateToken}=require("../scripts/tokenChecker");

jest.mock("../models/bc.models");
jest.mock("bcrypt");
jest.mock("../scripts/tokenChecker");

describe("User Controller Tester",()=>{
    let mockReq,mockRes,mockNext;

    const userId = new mongoose.Types.ObjectId();
    const passId = new mongoose.Types.ObjectId();
    const mockName = "Mario Rossi";
    const mockEmail = "mario.rossi@example.com";
    const mockCode = "0123456789";
    const mockHashedPassword = "hashed_gibberish";

    const mockUser=(data)=>{
        return{
            _id:userId,
            name:data.name,
            email:data.email,
            points:0,
            code:mockCode,
            password:{
                _id:passId,
                temporary:true,
                content:mockHashedPassword
            },
            save:jest.fn().mockImplementation(function(){
                return Promise.resolve({
                    ...this,
                    toObject:()=>({
                        _id:this._id,
                        name:this.name,
                        email: this.email,
                        points: this.points,
                        code: this.code,
                        password: {
                            temporary: this.password.temporary
                        },
                        __v: 0
                    })
                });
            })
        };
    };


    describe("postUser ( POST /api/v1/users )",()=>{
        beforeEach(() => {
            mockReq = {
                body: {
                    name: mockName,
                    email: mockEmail
                }
            };
            mockRes={
                locals:{},
            };
            mockNext=jest.fn();
            jest.clearAllMocks();
        });

        it("should create a new user",async()=>{
            User.mockImplementation(()=>mockUser(mockReq.body));
            User.findOne.mockResolvedValue(null);
            
            await postUser(mockReq,mockRes,mockNext);
            
            expect(mockRes.locals.response).toEqual({
                status:201,
                success:true,
                message:"New user registered",
                data:{
                    self:`/api/v1/users/${userId}`,
                    name:mockName,
                    email:mockEmail,
                    points:0,
                    code:mockCode,
                    password:{
                        temporary: true
                    }
                }
            });
        });

        it("should not allow creation of an existing user",async()=>{
            User.mockImplementation(()=>mockUser(mockReq.body));
            User.findOne.mockResolvedValue(true);
            await postUser(mockReq,mockRes,mockNext);
            expect(mockRes.locals.response).toEqual({
                data:null,
                message: "User already exists",
                status: 409,
                success:false
            });
        });

        it("should require missing parameter(email)",async ()=>{
            mockReq.body.email=null;
            await postUser(mockReq,mockRes,mockNext);
            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should require missing parameter(name)",async ()=>{
            mockReq.body.name=null;
            await postUser(mockReq,mockRes,mockNext);
            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should require missing parameters",async ()=>{
            mockReq.body={};
            await postUser(mockReq,mockRes,mockNext);
            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });
    });

    describe("patchUserById ( PATCH /api/v1/users/id )",()=>{
        beforeEach(() => {
            mockReq = {
                params: { id: userId.toString() },
                body: {
                    oldPassword: "old_password",
                    newPassword: "new_password"
                }
            };
            mockRes={
                locals:{},
            };
            mockNext=jest.fn();
            jest.clearAllMocks();
        });

        it("should change password",async()=>{
            // authenticateToken.mockResolvedvalue(true);
            const mockUserData={
                _id: userId,
                name: mockName,
                email: mockEmail,
                code: mockCode,
                points: 10,
                password: {
                    _id: passId,
                    content: "hashed_old_password",
                    temporary: false
                },
                save:jest.fn()
            };

            User.findById.mockResolvedValue(mockUserData);
            
            const updatedUser={
                ...mockUserData,
                password:{ content: "hashed_new_password", temporary: false },
                toObject:jest.fn().mockReturnValue({
                    _id:userId,
                    name:mockName,
                    email:mockEmail,
                    code:mockCode,
                    points:10,
                    password: {temporary: false}
                })
            };
            User.findByIdAndUpdate.mockResolvedValue(updatedUser);

            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue("hashed_new_password");

            await patchUserById(mockReq, mockRes, mockNext);
            
            expect(mockRes.locals.response).toEqual({
                status: 200,
                success: true,
                message: "Updated successfully",
                data:{
                    self: `/api/v1/users/${userId}`,
                    name: mockName,
                    email: mockEmail,
                    code: mockCode,
                    points: 10,
                    password: {temporary:false}
                }
            });
        });

        it("should return error if old_password is wrong",async()=>{
            bcrypt.compare.mockResolvedValue(false);

            await patchUserById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should return error if old_password is missing",async()=>{
            mockReq.body.oldPassword=null;

            await patchUserById(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should return error if new_password is missing",async()=>{
            mockReq.body.newPassword=null;

            await patchUserById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Bad request",
                data:null
            });
        });

        it("should find no user",async()=>{
            mockReq.params.id="fake_id";

            await patchUserById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Not valid id",
                data:null
            });
        });
    });

    describe("postUserByIdWishlistedCoupon",()=>{
        const mockCouponPrototypeId=new mongoose.Types.ObjectId();
        const mockWishlistedCouponId=new mongoose.Types.ObjectId();


        beforeEach(()=>{
            mockReq={
                params:{id:userId},
                body:{couponPrototype:`/api/v1/couponPrototypes/${mockCouponPrototypeId}`}
            };
            mockRes={
                locals:{}
            };
            mockNext = jest.fn();
            jest.clearAllMocks();
            authenticateToken.mockResolvedValue(true);
        });

        it("should create a new wishlisted coupon",async()=>{
            CouponPrototype.findById.mockResolvedValue({_id:mockCouponPrototypeId});
            User.findById.mockResolvedValue({_id:userId});
            WishlistedCoupon.findOne.mockResolvedValue(null);

            const mockWishlistedCoupon={
                _id:mockWishlistedCouponId,
                user:userId,
                couponPrototype: mockCouponPrototypeId,
                toObject:jest.fn().mockReturnValue({
                    _id:mockWishlistedCouponId,
                    user:userId,
                    couponPrototype:mockCouponPrototypeId
                }),
                save: jest.fn().mockResolvedValue(true)
            };

            WishlistedCoupon.mockImplementation(()=>mockWishlistedCoupon);

            await postUserByIdWishlistedCoupon(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:201,
                success:true,
                message:"Added",
                data:{
                    self:`/api/v1/users/${userId}/wishlistedCoupons/${mockWishlistedCouponId}`,
                    user:`/api/v1/users/${userId}`,
                    couponPrototype:`/api/v1/couponPrototypes/${mockCouponPrototypeId}`
                }
            });
        });

        it("should not add the same coupon twice",async()=>{
            CouponPrototype.findById.mockResolvedValue({_id:mockCouponPrototypeId});
            User.findById.mockResolvedValue({_id:userId});
            WishlistedCoupon.findOne.mockResolvedValue({_id:mockWishlistedCouponId});

            await postUserByIdWishlistedCoupon(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:209,
                success:false,
                message:"Conflict",
                data:null
            });
        });
    });

    describe("deleteUserByIdWishlistedCouponById",()=>{
        const mockWishlistedCouponId=new mongoose.Types.ObjectId();
        beforeEach(()=>{
            mockReq={
                params:{
                    userId:userId,
                    itemId:mockWishlistedCouponId
                }
            };
            mockRes={
                locals:{}
            };
            mockNext = jest.fn();
            jest.clearAllMocks();
            authenticateToken.mockResolvedValue(true);
        });

        it("should delete a wishlisted item",async()=>{
            User.findById.mockResolvedValue({_id:userId});
            WishlistedCoupon.findByIdAndDelete.mockResolvedValue({_id:mockWishlistedCouponId});

            await deleteUserByIdWishlistedCouponById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:200,
                success:true,
                message:"Deleted",
                data:null
            });
        });
    });
    
    describe("postUserByIdCoupon ( POST /api/v1/users/id/coupons )",()=>{
        const mockCouponPrototypeId=new mongoose.Types.ObjectId();
        const mockCouponId=new mongoose.Types.ObjectId();

        beforeEach(()=>{
            mockReq={
                params:{
                    id:userId
                },
                body:{
                    couponPrototype:`/api/v1/couponPrototypes/${mockCouponPrototypeId}`
                }
            };
            mockRes={
                locals:{}
            };
            mockNext=jest.fn();
            jest.clearAllMocks();
            authenticateToken.mockResolvedValue(true);
        });

        it("should add a new coupon to the user",async ()=>{
            User.findById.mockResolvedValue({_id:userId,points:100});
            CouponPrototype.findById.mockResolvedValue({_id:mockCouponPrototypeId,price:20});
            User.findByIdAndUpdate.mockResolvedValue({_id:userId,points:80});

            const mockCoupon={
                _id:mockCouponId,
                user:userId,
                toObject:jest.fn().mockReturnValue({
                    _id:mockCouponId,
                    user:userId,
                }),
                save:jest.fn().mockResolvedValue(true)
            };

            Coupon.mockImplementation(()=>mockCoupon);


            await postUserByIdCoupon(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:201,
                success:true,
                message:"Added",
                data:null
            });
        });

        it("should not add a new coupon if the user is poor",async()=>{
            User.findById.mockResolvedValue({_id:userId,points:100});
            CouponPrototype.findById.mockResolvedValue({_id:mockCouponPrototypeId,price:20});

            await postUserByIdCoupon(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:422,
                success:false,
                message:"Unprocessable Entity",
                data:null
            });
        });
    });

    describe("getUserByIdCoupons ( GET /api/v1/users/id/coupons )",()=>{

        const mockCoupons=[
            {
                _id:new mongoose.Types.ObjectId(),
                user:userId,
                code:"jn13lj123f",
                store:"store1",
                discount:10,
                description:"description_1",
                used:false,
                expiration:Math.floor(Date.now()/1000)+86400
            },
            {
                _id: new mongoose.Types.ObjectId(),
                user: userId,
                code: "CODE456",
                store: "Store B",
                discount: 20,
                description: "Discount 20%",
                used: true,
                expiration: Math.floor(Date.now() / 1000) - 86400
            }
        ];

        beforeEach(()=>{
            mockReq={
                params:{
                    userId:userId
                },
                query:{}
            };
            mockRes={
                locals:{}
            };
            mockNext = jest.fn();
            jest.clearAllMocks();
            authenticateToken.mockResolvedValue(true);
            User.findById.mockResolvedValue({_id:userId});
        });

        it("should return all coupons possessed",async()=>{
            Coupon.find.mockReturnValue({
                where:jest.fn().mockReturnThis(),
                exec:jest.fn().mockResolvedValue(mockCoupons)
            });
            
            // User.findById.mockResolvedValue({_id:userId});
            // Coupon.find.mockResolvedValue(mockCoupons);

            expect(mockRes.locals.response).toEqual({
                status: 200,
                success: true,
                message: "OK",
                data: mockCoupons.map(coupon => ({
                    self: `/api/v1/users/${userId}/coupons/${coupon._id}`,
                    user: `/api/v1/users/${userId}`,
                    code: coupon.code,
                    store: coupon.store,
                    discount: coupon.discount,
                    description: coupon.description,
                    used: coupon.used,
                    expiration: coupon.expiration
                }))
            });
        });

        it("should filter by used=true", async () => {
        mockReq.query.used = "true";
        const usedCoupons = mockCoupons.filter(c => c.used);

        Coupon.find.mockImplementation((filters) => ({
            where: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(usedCoupons)
        }));

        await getUserByIdCoupons(mockReq, mockRes, mockNext);

        expect(Coupon.find).toHaveBeenCalledWith({
            user: userId,
            used: true
        });
    });

    it("should filter by expired=true", async () => {
        mockReq.query.expired = "true";
        const expiredCoupons = mockCoupons.filter(c => c.expiration < Math.floor(Date.now() / 1000));

            Coupon.find.mockImplementation((filters)=>({
                where: jest.fn().mockImplementation(function(condition) {
                    const date = condition.$lt;
                    const filtered=mockCoupons.filter(c=>c.expiration<date);
                    return{
                        exec: jest.fn().mockResolvedValue(filtered)
                    };
                }),
                exec:jest.fn()
            }));

            await getUserByIdCoupons(mockReq,mockRes,mockNext);
        });
    });
});