import Web3 from "web3";

let web3;

if(typeof window !== "undefined" && typeof window.web3 !== "undefined"){
    //we are on the client
    window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
}
else{
    //we are on the server
    const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/26714b68a74e4e5f9685b14d0104ff95');
   web3 = new Web3(provider);
}
 
 
export default web3;