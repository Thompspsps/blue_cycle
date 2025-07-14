const {Machine}=require("../models/bc.models");
const {authenticateToken}=require("../scripts/tokenChecker");
const {getMachines}=require("../controllers/machine.controller");
const mongoose=require("mongoose");
const qs=require("qs");

jest.mock("../models/bc.models");
jest.mock("../scripts/tokenChecker");
jest.mock("qs");

describe("Machine Controller Tester",()=>{
    let mockReq,mockRes,mockNext;

    const mockMachines=[
        {
            _id:new mongoose.Types.ObjectId(),
            position:{
                latitude:87.3223423,
                longitude:34.324243
            },
            available:true,
            description:"description_1",
            toObject:function(){
                return{
                    _id: this._id,
                    position: this.position,
                    available: this.available,
                    description: this.description
                };
            }
        },
        {
            _id: new mongoose.Types.ObjectId(),
            position: {
                latitude: 64.234234,
                longitude: 21.213123
            },
            available:false,
            description:"description_2",
            toObject: function(){
                return {
                    _id: this._id,
                    position:this.position,
                    available:this.available,
                    description:this.description
                };
            }
        }
    ];

    beforeEach(()=>{
        mockReq={
            query:{},
            params:{}
        };
        mockRes={
            locals:{}
        };

        mockNext=jest.fn();
        jest.clearAllMocks();

        authenticateToken.mockResolvedValue(true);
        Machine.find.mockReturnThis(()=>({
            select:jest.fn().mockReturnThis(),
            exec:jest.fn().mockResolvedValue(mockMachines)
        }));
    });

    it("should return a complete list of machines", async () => {
        await getMachines(mockReq,mockRes,mockNext);

        expect(mockRes.locals.response).toEqual({
            status:200,
            success:true,
            message:"OK",
            data:mockMachines.map(machine => ({
                self:`/api/v1/machines/${machine._id}`,
                position:machine.position,
                available:machine.available,
                description:machine.description
            }))
        });
    });

    it("should filter by availability (true)", async () => {
        mockReq.query.available = "true";
        
        await getMachines(mockReq, mockRes, mockNext);

        expect(Machine.find).toHaveBeenCalledWith({ available: true });
    });

    it("should filter by availability (false)",async()=>{
        mockReq.query.available="false";
        
        await getMachines(mockReq,mockRes,mockNext);

        expect(Machine.find).toHaveBeenCalledWith({available:false});
    });

    it("should handle proximity filter", async () => {
        mockReq.query.proximity="range=10&from[latitude]=40&from[longitude]=-74";
        qs.parse.mockReturnValue({
            range: "10",
            from:{latitude:"40",longitude:"-74"}
        });

        await getMachines(mockReq,mockRes,mockNext);

        expect(Machine.find).toHaveBeenCalledWith({
            position:{
                $geoWithin:{
                    $centerSphere:[[40,-74],10/6371]
                }
            }
        });
    });
});