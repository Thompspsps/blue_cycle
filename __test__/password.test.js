const {User}=require("../models/bc.models");
const resetPassword=require("../controllers/password.controller");
const mongoose=require("mongoose");
const {transporter}=require("../scripts/emailSender");
const bcrypt=require("bcrypt");

const saltRounds=parseInt(process.env.SALT_ROUNDS)||10;

jest.mock("bcrypt");
jest.mock("../models/bc.models");
jest.mock("../scripts/emailSender",()=>({
    transporter:{
        sendMail:jest.fn()  //non mi interessa testare l'invio mail
    }
}));


describe("Password Controller Tester",()=>{
    let mockReq,mockRes,mockNext;

    const userId=new mongoose.Types.ObjectId();
    const mockName="Mario Rossi";
    const mockEmail="mario.rossi@example.com";

    const mockUser={
        _id: userId,
        email: mockEmail,
        name: mockName,
        password: {
            // content: 'hashed_tmp_password',
            temporary:false
        },
        toObject:function(){
            return{
                email:this.email,
                name: this.name,
                password:this.password,
                self: `/api/v1/users/${this._id}`
            };
        }
    };

    beforeEach(()=>{
        mockReq={
            body:{
                email:mockEmail
            }
        };
        mockRes={
            locals:{},
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe("resetPassword (POST /api/v1/forgotPassword )",()=>{
        it("should reset user's password",async()=>{
        
            // const mockExec=jest.fn().mockResolvedValue(mockUser);
            // const mockSelect=jest.fn().mockReturnValue({exec:mockExec});
            // User.findOneAndUpdate=jest.fn().mockReturnValue({
            //     select:mockSelect
            // });



            User.findOneAndUpdate.mockImplementation(()=>{
                select:jest.fn().mockResolvedValue(mockUser)
            });

            // Mock bcrypt per il pre-hook
            // bcrypt.hash.mockResolvedValue('hashed_tmp_password');

            await resetPassword(mockReq,mockRes,mockNext);

            // Verifica la chiamata a findOneAndUpdate
            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                {email:mockEmail},
                { 
                    password:{
                        content:expect.any(String),
                        temporary:true
                    }
                }
            );

            // Verifica che select sia chiamato correttamente
            // expect(mockSelect).toHaveBeenCalledWith("-__v -password._id");

            // Verifica che il pre-hook sia stato attivato
            // expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), saltRounds);

            // Verifica la risposta
            expect(mockRes.locals.response).toEqual({
                status: 200,
                success: true,
                message: "OK",
                data: {
                    email: mockEmail,
                    name: mockName,
                    password:{temporary:true},
                    self:`/api/v1/users/${userId}`
                }
            });
        });

        it("should return 404 if user not found",async()=>{
            const mockExec=jest.fn().mockResolvedValue(null);
            const mockSelect=jest.fn().mockReturnValue({exec:mockExec});
            User.findOneAndUpdate=jest.fn().mockReturnValue({
                select:mockSelect
            });

            await resetPassword(mockReq, mockRes, mockNext);

            expect(mockRes.locals.response).toEqual({
                status: 404,
                success: false,
                message: "User not found",
                data: null
            });
        });
    });
});