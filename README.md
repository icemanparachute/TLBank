# Time Locked Bank  

Time Locked Bank is an NFT representation of locked Bankless Tokens. Users will lock up their BANK tokens inside the NFT contract to get access and season passes to Bankless DAO. The NFT contract will only accept BANK tokens for the lockup, and users can transfer or trade their NFTs as they see fit.

You can clone this repository for testing and deployments. 

# Contract Testing
``` bash
npm install
npx hardhat compile
npx hardhat test
```

# Deployment
To deploy the contracts you should create a .env file, and add your private keys, network rpc URL, and etherscan API Key. 
Navigate to ./scripts/deploy and adjust the token name, symbol, and bankless token address to the desired inputs for the contract deployment. These are the constructor arguments in the contract. 
Then you can use the hardhat deploy plugin to deploy to supported networks. 

``` bash
npx hardhat run scripts/deploy.js --network <network-name>
```

Afterwards using the etherscan verify plugin you can verify the network with the arguments you've input to the constructor; 

``` bash
npx hardhat verify --newtork <network-name> <contract_addresss> <tokenName> <tokenSymbol> <banklessTokenAddress>
```


