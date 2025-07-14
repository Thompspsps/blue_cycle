const {CouponPrototype} = require("../models/couponPrototype.model");
const {authenticateToken} = require("../scripts/tokenChecker");
const mongoose=require("mongoose");
const{
    getCouponPrototypes,
    getCouponPrototypeById
}=require("../controllers/couponPrototype.controller");

jest.mock("../models/couponPrototype.model");
jest.mock("../scripts/tokenChecker");

describe("Coupon Prototype Controller Tester",()=>{
    let mockReq, mockRes, mockNext;

    const mockCoupons=[
        {
            _id: new mongoose.Types.ObjectId(),
            store: "Store1",
            price: 10,
            discount: 2,
            description: "Test coupon 1"
        },
        {
            _id: new mongoose.Types.ObjectId(),
            store: "Store2",
            price: 20,
            discount: 5,
            description: "Test coupon 2"
        }
    ];


    beforeEach(()=>{
        mockReq={
            query:{},
            params:{}
        };
        mockRes={
            locals:{},
        };
        mockNext=jest.fn();
        jest.clearAllMocks();

        authenticateToken.mockResolvedValue(true);
        CouponPrototype.find.mockResolvedValue(mockCoupons);
    });

    describe("getCouponPrototypes",()=>{
        it("should return all coupon prototypes",async()=>{
            await getCouponPrototypes(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:200,
                success:true,
                message:"OK",
                data:mockCoupons.map(coupon=>({
                    self:`/api/v1/couponPrototypes/${coupon._id}`,
                    store:coupon.store,
                    discount:coupon.discount,
                    price:coupon.price,
                    description:coupon.description
                }))
            });
        });

        it("should filter by store",async()=>{
            mockReq.query.store="Store1";
            
            await getCouponPrototypes(mockReq,mockRes,mockNext);

            expect(CouponPrototype.find).toHaveBeenCalledWith({store:"Store1"});
        });

        it("should filter by price",async()=>{
            mockReq.query.price="10";
            
            await getCouponPrototypes(mockReq, mockRes, mockNext);

            expect(CouponPrototype.find).toHaveBeenCalledWith({price:{$lte:10}});
        });

        it("should filter by discount", async () => {
            mockReq.query.discount="5";
            
            await getCouponPrototypes(mockReq,mockRes,mockNext);

            expect(CouponPrototype.find).toHaveBeenCalledWith({discount:5});
        });

        // it("should handle authentication failure", async () => {
        //     authenticateToken.mockResolvedValue(false);
            
        //     await getCouponPrototypes(mockReq,mockRes,mockNext);

        //     // expect(mockNext).toHaveBeenCalled();
        //     expect(mockRes.locals.response).toEqual({
        //         status:401,
        //         success:false,
        //         message:"Unauthorized",
        //         data:null
        //     });
        // });

        // it("should handle database errors", async () => {
        //     CouponPrototype.find.mockRejectedValue(new Error("DB error"));
            
        //     await getCouponPrototypes(mockReq, mockRes, mockNext);

        //     expect(mockRes.locals.response).toEqual({
        //         status: 500,
        //         success: false,
        //         message: "Internal server error",
        //         data: null
        //     });
        // });
    });

    describe("getCouponPrototypeById", () => {
        const mockCoupon={
            _id:new mongoose.Types.ObjectId(),
            store:"Store1",
            price:10,
            discount:2,
            description:"test_coupon",
            toObject:jest.fn().mockReturnValue({
                store:"Store1",
                price:10,
                discount:2,
                description: "test_coupon"
            })
        };

        beforeEach(() => {
            CouponPrototype.findById.mockImplementation(()=>({
                select:jest.fn().mockResolvedValue(mockCoupon)
            }));
        });

        it("should return a coupon prototype",async()=>{
            mockReq.params.id=mockCoupon._id.toString();
            
            await getCouponPrototypeById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:200,
                success:true,
                message:"OK",
                data:{
                    self:`/api/v1/couponPrototypes/${mockCoupon._id}`,
                    store:mockCoupon.store,
                    discount:mockCoupon.discount,
                    price:mockCoupon.price,
                    description:mockCoupon.description
                }
            });
        });

        it("should return 400 for invalid id",async()=>{
            mockReq.params.id="invalid_id";
            
            await getCouponPrototypeById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:400,
                success:false,
                message:"Not valid id",
                data:null
            });
        });

        it("should return 404 if coupon not found", async () => {
            mockReq.params.id=new mongoose.Types.ObjectId().toString();
            CouponPrototype.findById.mockImplementation(()=>({
                select:jest.fn().mockResolvedValue(null)
            }));
            
            await getCouponPrototypeById(mockReq,mockRes,mockNext);

            expect(mockRes.locals.response).toEqual({
                status:404,
                success:false,
                message:"Not found",
                data:null
            });
        });

        // it("should handle authentication failure", async () => {
        //     mockReq.params.id = mockCoupon._id.toString();
        //     authenticateToken.mockResolvedValue(false);
            
        //     await getCouponPrototypeById(mockReq, mockRes, mockNext);

        //     expect(mockNext).toHaveBeenCalled();
        //     expect(mockRes.locals.response).toBeUndefined();
        // });

        // it("should handle database errors", async () => {
        //     mockReq.params.id = mockCoupon._id.toString();
        //     CouponPrototype.findById.mockImplementation(() => ({
        //         select: jest.fn().mockRejectedValue(new Error("DB error"))
        //     }));
            
        //     await getCouponPrototypeById(mockReq, mockRes, mockNext);

        //     expect(mockRes.locals.response).toEqual({
        //         status: 500,
        //         success: false,
        //         message: "Internal server error",
        //         data: null
        //     });
        // });
    });
});