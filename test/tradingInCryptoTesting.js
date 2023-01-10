const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20 Token contract",function()
{
    let Token;
    let TokenContract;
    let Trade;
    let TradeContract;
    let admin;
    let seller;
    let trader;
    let buyer;
    let user;
    let users;

    /*---------------------------------------------- Delopying Contract -----------------------------------------------------*/ 
    
    before(async function(){

        [admin,seller,trader,buyer,user,...users]=await ethers.getSigners();

        Token=await ethers.getContractFactory("tradeToken");
        TokenContract=await Token.deploy();
        await TokenContract.deployed();
        console.log("ERC20 Contract Deployed to : ",TokenContract.address)

        Trade=await ethers.getContractFactory("tradingInCrypto");
        TradeContract=await Trade.deploy("https://gateway.pinata.cloud/ipfs/");
        await TradeContract.deployed();
        console.log("Trading Contract Deployed to : ",TradeContract.address)
        
    });

    /*-------------------------------------------- ERC20 Contract Testing --------------------------------------------------*/

    describe("ERC20 Contract "+" : Positive Case",function(){
        
        it("Should Set the right Name & Symbol",async function(){

            assert.equal((await TokenContract.name()),"TRADE TOKEN");
            expect(await TokenContract.symbol()).to.equal("TRD");
            
        });
        
        it("Should Mint Successfully",async function(){

          await TokenContract.mint(admin.address,"10000000000000000000000");
          const ownerSupply=await TokenContract.balanceOf(admin.address)
          expect(await TokenContract.totalSupply()).to.equal(ownerSupply);

        });
        
        it("Admin Should deployed the contract", async function(){

            assert.equal((await TokenContract.owner()),admin.address);

        });
        
        it("Admin should transfer token to trader and seller", async function(){

            assert.equal((await TokenContract.balanceOf(trader.address)),"0");
            assert.equal((await TokenContract.balanceOf(buyer.address)),"0");
            assert.equal((await TokenContract.balanceOf(admin.address)),"10000000000000000000000");

            await TokenContract.transfer(trader.address,"5000000000000000000000");
            await TokenContract.transfer(buyer.address,"5000000000000000000000");
            assert.equal((await TokenContract.balanceOf(trader.address)),"5000000000000000000000");
            assert.equal((await TokenContract.balanceOf(buyer.address)),"5000000000000000000000");
            assert.equal((await TokenContract.balanceOf(admin.address)),"0");

        });

    });

    /*-------------------------------------------- Currency function testing -----------------------------------------------*/

    describe("Currency Function in Trading Contract "+" : Both Case",function(){

        it("Should only be added by Admin "+" : Negative Case",async function(){

         await expect(TradeContract.connect(seller).addCurrency("0x5452440000000000000000000000000000000000000000000000000000000000",TokenContract.address))
         .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
         await TradeContract.addCurrency("0x5452440000000000000000000000000000000000000000000000000000000000",TokenContract.address)
         
         assert.equal(await TradeContract.addressCurrency("0x5452440000000000000000000000000000000000000000000000000000000000"),TokenContract.address)
         expect(await TradeContract.allCurrenciesAllowed()).to.include("0x5452440000000000000000000000000000000000000000000000000000000000");
        
        });

        it("Should only be removed by Admin "+" : Negative Case", async function(){
         
         await expect(TradeContract.connect(seller).removeCurrency("0x5452440000000000000000000000000000000000000000000000000000000000"))
         .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
         await TradeContract.removeCurrency("0x5452440000000000000000000000000000000000000000000000000000000000")
         assert.equal(await TradeContract.addressCurrency("0x5452440000000000000000000000000000000000000000000000000000000000"),"0x0000000000000000000000000000000000000000")
        
        });

        it("Should add currency succesfully "+" : Positive Case", async function(){
         
         await TradeContract.addCurrency("0x5452440000000000000000000000000000000000000000000000000000000000",TokenContract.address)
         assert.equal(await TradeContract.addressCurrency("0x5452440000000000000000000000000000000000000000000000000000000000"),TokenContract.address)
        
        });

    });

    /*-------------------------------------------- Role function testing ---------------------------------------------------*/

    describe("Roles function in Trading Contract "+" : Both Cases",function(){
        
        it("Roles Should only be assign by Admin "+" : Negative Case",async function(){
        
         await expect(TradeContract.connect(seller).grantRole("0x43f25613eb2f15fb17222a5d424ca2655743e71265d98e4b93c05e5fb589ecde",seller.address))
         .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000")
        
        });

        it("Roles Should assign by Admin "+" : Positive Case", async function(){
         
         const sellerRole= await TradeContract.SELLER_ROLE();
         const traderRole=await TradeContract.TRADER_ROLE();
         const buyerRole=await TradeContract.BUYER_ROLE();
         await TradeContract.grantRole(sellerRole,seller.address)
         await TradeContract.grantRole(traderRole,trader.address)
         await TradeContract.grantRole(buyerRole,buyer.address)
         assert.equal(await TradeContract.hasRole(sellerRole,seller.address),true)
         assert.equal(await TradeContract.hasRole(traderRole,trader.address),true)
         assert.equal(await TradeContract.hasRole(buyerRole,buyer.address),true)
        
        });

    });

    /*----------------------------------------- CreateTrade function testing -----------------------------------------------*/

    describe("CreateTrade Function in Trading Contract "+" : Both Cases",function(){
        
        it("Only a correct role holder should be able to create a SellerToTrader trade "+" : Negative Case",async function(){
         
         await expect(TradeContract.connect(seller).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",user.address,"1000000000000000000000",1))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTrader");
         await expect(TradeContract.connect(user).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",1))
         .to.be.revertedWithCustomError(TradeContract,"InvalidSeller");
        
        });

        it("Only a correct role holder should be able to create a TraderToBuyer trade "+" : Negative Case", async function(){
         
         await expect(TradeContract.connect(trader).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",user.address,"1000000000000000000000",2))
         .to.be.revertedWithCustomError(TradeContract,"InvalidBuyer");
         await expect(TradeContract.connect(user).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",buyer.address,"1000000000000000000000",2))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTrader");
        
        });

        it("Only a correct role holder should be able to create a BuyerToTrader trade "+" : Negative Case", async function(){
         
         await expect(TradeContract.connect(buyer).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",user.address,"1000000000000000000000",3))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTrader");
         await expect(TradeContract.connect(user).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",3))
         .to.be.revertedWithCustomError(TradeContract,"InvalidBuyer");

        });

        it("Trades should only be created with correct currency."+" : Negative Case", async function(){
            
         await expect(TradeContract.connect(seller).createtrade(1,"Weat","0x5462440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",1))
         .to.be.revertedWithCustomError(TradeContract,"CurrencyNotAllowed");
        
        });

        it("Role holder should only create correct trades "+" : Negative Case", async function(){
            
         await expect(TradeContract.connect(seller).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",2))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTrader");
         await expect(TradeContract.connect(trader).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",buyer.address,"1000000000000000000000",3))
         .to.be.revertedWithCustomError(TradeContract,"InvalidBuyer");
         await expect(TradeContract.connect(buyer).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",1))
         .to.be.revertedWithCustomError(TradeContract,"InvalidSeller");

         await expect(TradeContract.connect(seller).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",4))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeType");
         await expect(TradeContract.connect(trader).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",buyer.address,"1000000000000000000000",5))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeType");
         await expect(TradeContract.connect(buyer).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",6))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeType");

        });

        it("Should create trade"+" : Positive Case", async function(){
           
         await TradeContract.connect(seller).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",1);
         await TradeContract.connect(trader).createtrade(2,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",buyer.address,"1000000000000000000000",2);
         await TradeContract.connect(buyer).createtrade(3,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",3);
         assert.equal(await TradeContract.totalTrades(),3);

        //  const tradesIds=await TradeContract.allTradingNumbers();
        //  console.log(tradesIds);
        //  expect(await TradeContract.tradingDetails(1))
        //  .to.include('1',"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",seller.address,trader.address,"1000000000000000000000","");
        
        });

        it("Should not duplicate trade number"+" : Negative Case", async function(){
         
         await expect(TradeContract.connect(seller).createtrade(1,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",1))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
         await expect(TradeContract.connect(trader).createtrade(2,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",buyer.address,"1000000000000000000000",2))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
         await expect(TradeContract.connect(buyer).createtrade(3,"Weat","0x5452440000000000000000000000000000000000000000000000000000000000",trader.address,"1000000000000000000000",3))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
        
        });

    });

    /*----------------------------------------- AgreeToTrade function testing ----------------------------------------------*/

    describe("AgreeToTrade function in Trading contract "+" : Both Cases",function(){

        it("Should be valid trade number"+" : Negative Case",async function(){
          
         await expect(TradeContract.connect(trader).agreeToTrade(4)).to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
         await expect(TradeContract.connect(buyer).agreeToTrade(6)).to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber"); //check
        
        });

        it("Should only be accepted by valid wallet address "+" : Negative Case",async function(){
          
         await expect(TradeContract.connect(seller).agreeToTrade(1)).to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
         await expect(TradeContract.connect(seller).agreeToTrade(2)).to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
         await expect(TradeContract.connect(seller).agreeToTrade(3)).to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
        
        });

        it("Should must approve before Accept "+" : Negative Case",async function(){
         
         await expect(TradeContract.connect(trader).agreeToTrade(1)).to.be.revertedWith("ERC20: insufficient allowance");
         await expect(TradeContract.connect(buyer).agreeToTrade(2)).to.be.revertedWith("ERC20: insufficient allowance");
         await expect(TradeContract.connect(trader).agreeToTrade(3)).to.be.revertedWith("ERC20: insufficient allowance");
          
        });

        it("Should be accepted  "+" : Positive Case",async function(){
            
         await TokenContract.connect(trader).approve(TradeContract.address,"2000000000000000000000");
         await TokenContract.connect(buyer).approve(TradeContract.address,"2000000000000000000000");
         assert.equal(await TokenContract.allowance(trader.address,TradeContract.address),"2000000000000000000000");
         assert.equal(await TokenContract.allowance(buyer.address,TradeContract.address),"2000000000000000000000");
         // await TradeContract.connect(trader).agreeToTrade(1);
         await TradeContract.connect(buyer).agreeToTrade(2);
         await TradeContract.connect(trader).agreeToTrade(3);
        
        });

        it("Should only accepted one time "+" : Negative Case",async function(){
           
         // await expect(TradeContract.connect(trader).agreeToTrade(1)).to.be.reverted;
         await expect(TradeContract.connect(buyer).agreeToTrade(2)).to.be.revertedWithCustomError(TradeContract,"AllReadyAgreed");
         await expect(TradeContract.connect(trader).agreeToTrade(3)).to.be.revertedWithCustomError(TradeContract,"AllReadyAgreed");
        
        });

    });

    /*-------------------------------------------- Add BL function testing -------------------------------------------------*/

    describe("UpdateBL function in Trading contract "+" : Both Cases",function(){
     
        it("Should be valid trade number "+" : Negative Case",async function(){
        
         await expect(TradeContract.connect(seller).updateBL(4,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
         await expect(TradeContract.connect(buyer).updateBL(4,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
         await expect(TradeContract.connect(trader).updateBL(4,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
     
        });
     
        it("Should be able to add hash after trade is accepted "+" : Negative Case",async function(){
     
         // await TradeContract.connect(seller).updateBL(1,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");
         await expect(TradeContract.connect(seller).updateBL(1,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"NotAcceptedYet");
     
        });
     
        it("Trade hash must be added by valid wallet address"+" : Negative Case",async function(){
    
         // await TradeContract.connect(trader).updateBL(2,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");
         await expect(TradeContract.connect(buyer).updateBL(2,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
         // await TradeContract.connect(trader).updateBL(3,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");
         await expect(TradeContract.connect(buyer).updateBL(2,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
     
        });
     
        it("Should add trade hash"+" : Positive Case",async function(){

         await TradeContract.connect(trader).updateBL(2,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");
         await TradeContract.connect(trader).updateBL(3,"QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");

         assert.equal(await TradeContract.getTradingHash(1),"https://gateway.pinata.cloud/ipfs/");
         assert.equal(await TradeContract.getTradingHash(2),"https://gateway.pinata.cloud/ipfs/QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");
         assert.equal(await TradeContract.getTradingHash(3),"https://gateway.pinata.cloud/ipfs/QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");

        });
     
        it("Should unable to change add hash"+" : Positive Case",async function(){
        
         await expect(TradeContract.connect(trader).updateBL(2,"CmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"AlreadyAddedBL");
         await expect(TradeContract.connect(trader).updateBL(3,"CmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2"))
         .to.be.revertedWithCustomError(TradeContract,"AlreadyAddedBL");

         assert.equal(await TradeContract.getTradingHash(1),"https://gateway.pinata.cloud/ipfs/");
         assert.equal(await TradeContract.getTradingHash(2),"https://gateway.pinata.cloud/ipfs/QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");
         assert.equal(await TradeContract.getTradingHash(3),"https://gateway.pinata.cloud/ipfs/QmP4iHsMghLudSGzuxCW5gSiaaoQUNDGNrwHsJM36Tj6S2");

        });

    });

    /*------------------------------------------- Verify BL function testing -----------------------------------------------*/

    describe("VerifyBL function in Trading contract "+" : Both Cases",function(){

        it("Should be valid trade number "+" : Negative Case",async function(){
       
         //await TradeContract.connect(buyer).verifyBL(2);
         //await TradeContract.connect(buyer).verifyBL(3);
         await expect(TradeContract.connect(buyer).verifyBL(4)).to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
         await expect(TradeContract.connect(buyer).verifyBL(4)).to.be.revertedWithCustomError(TradeContract,"InvalidTradeNumber");
       
        });

        it("Should be able to verify after trade hash is added "+" : Negative Case",async function(){
        
         //await TradeContract.connect(trader).verifyBL(1);
         await expect(TradeContract.connect(trader).verifyBL(1)).to.be.revertedWithCustomError(TradeContract,"NotBLAddedYet");
        
        });

        it("Trade hash must be added by valid wallet address"+" : Negative Case",async function(){
          
         await expect(TradeContract.connect(trader).verifyBL(2)).to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
         await expect(TradeContract.connect(trader).verifyBL(3)).to.be.revertedWithCustomError(TradeContract,"InvalidCallerAddress");
         // await TradeContract.connect(buyer).verifyBL(2);
         // await TradeContract.connect(buyer).verifyBL(3);
        
        });

        it("Should verify trade BL"+" : Positive Case",async function(){
           
         await TradeContract.connect(buyer).verifyBL(2);
         await TradeContract.connect(buyer).verifyBL(3);
        
        });

        it("After Accept trade should complete"+" : Positive Case",async function(){
           
         //    await TradeContract.connect(buyer).verifyBL(2);
         await expect(TradeContract.connect(buyer).verifyBL(2)).to.be.revertedWithCustomError(TradeContract,"TradeCompleted");
         await expect(TradeContract.connect(buyer).verifyBL(3)).to.be.revertedWithCustomError(TradeContract,"TradeCompleted");
         // expect(await TradeContract.connect(buyer).verifyBL(3)).to.throw(TypeError, 'TradeCompleted()');
        
        });

    });
    
    
});