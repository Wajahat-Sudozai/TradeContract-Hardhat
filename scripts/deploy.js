const { ethers , run,network} = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);


  //ERC20 Contract Deploying
  const ERC20 = await ethers.getContractFactory("tradeToken");
  const ERC20Contract = await ERC20.deploy();
  await ERC20Contract.deployed();
  console.log(`ERC20 Contract deployed to : ${ERC20Contract.address}`)

  //Trading Contract Deploying
  const Trade=await ethers.getContractFactory("tradingInCrypto");
  const TradeContract=await Trade.deploy("https://gateway.pinata.cloud/ipfs/");
  await TradeContract.deployed();
  console.log(`Trading Contract Deployed to : ${TradeContract.address}`)
  
  

  //Contract verification 
  if(network.config.chainId===97&& process.env.BINANCE_MAINNET_API 
    || network.config.chainId===80001&& process.env.POLYGON_MAINNET_API
    || network.config.chainId===5&& process.env.ETHEREUM_MAINET_API){
    await ERC20Contract.deployTransaction.wait(6);
    console.log("ERC20 Contract Verification ");
    await verify(ERC20Contract.address,[])
    await TradeContract.deployTransaction.wait(6);
    console.log("Trading Contract Verification ");
    await verify(TradeContract.address,["https://gateway.pinata.cloud/ipfs/"]) 
  }
}

async function verify (contractAddress,args){
  console.log("verifying contract....")
  try{
  await run("verify:verify", {
    address: contractAddress,
    constructorArguments: args,
  });
 }catch(e)
 {
  if(e.message.toLowerCase().includes("already verified")){
    console.log("Already verified!");
  }else{
  console.log(e)
  }
 }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
