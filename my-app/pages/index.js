import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Head from 'next/head';
import Web3Modal from "web3modal";
import {Contract,ethers} from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";



export default function Home() {


    const [walletConnected,setWalletConnected] = useState(false);
    const[numOfWhitelisted,setNumOfWhitelisted] = useState(0);
     // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
    const [joinedWhitelist, setJoinedWhitelist] = useState(false);
    const [loading, setLoading] = useState(false);
    const web3ModalRef = useRef();



    useEffect(() => {
        web3ModalRef.current = new Web3Modal({
            network: "sepolia",
            providerOptions: {},
            disabledInjectedProvider: false,
        });
    }, []);


    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new ethers.BrowserProvider(provider);
    
        // If user is not connected to the Rinkeby network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
         
        console.log(Number(chainId));
        
        if (Number(chainId) !== 11155111) {
          window.alert("Change the network to Sepolia");
         
          throw new Error("");
        }
        
        if (needSigner) {
          const signer = web3Provider.getSigner();
          return signer;
        }
        return web3Provider;
      };



      const addAddressToWhitelist = async () => {
        try {
          // We need a Signer here since this is a 'write' transaction.
          const signer = await getProviderOrSigner(true);
          // Create a new instance of the Contract with a Signer, which allows
          // update methods
          const whitelistContract = new Contract(
            WHITELIST_CONTRACT_ADDRESS,
            abi,
            signer
          );
          // call the addAddressToWhitelist from the contract
          const tx = await whitelistContract.addAddressToWhitelist();
          setLoading(true);
          // wait for the transaction to get mined
          await tx.wait();
          setLoading(false);
          // get the updated number of addresses in the whitelist
          await getNumberOfWhitelisted();
          setJoinedWhitelist(true);
        } catch (err) {
          console.error(err);
        }
      };

      const getNumberOfWhitelisted = async () => {
        try {
          // Get the provider from web3Modal, which in our case is MetaMask
          // No need for the Signer here, as we are only reading state from the blockchain
          const provider = await getProviderOrSigner();
          // We connect to the Contract using a Provider, so we will only
          // have read-only access to the Contract
          const whitelistContract = new Contract(
            WHITELIST_CONTRACT_ADDRESS,
            abi,
            provider
          );
          // call the numAddressesWhitelisted from the contract
          const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
          setNumOfWhitelisted(Number(_numberOfWhitelisted));
          console.log(numOfWhitelisted);
        } catch (err) {
            console.log("heyyy");
          console.error(err);
        }
      };




      const checkIfAddressIsWhitelisted = async () => {
        try {
          // We will need the signer later to get the user's address
          // Even though it is a read transaction, since Signers are just special kinds of Providers,
          // We can use it in it's place
          const signer = await getProviderOrSigner(true);
          const whitelistContract = new Contract(
            WHITELIST_CONTRACT_ADDRESS,
            abi,
            signer
          );
          // Get the address associated to the signer which is connected to  MetaMask
          const address = await signer.getAddress();
          // call the whitelistedAddresses from the contract
          const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
            address
          );
          setJoinedWhitelist(_joinedWhitelist);
        } catch (err) {
          console.error(err);
        }
      };


      const connectWallet = async() => {

        try{
            await getProviderOrSigner();
            setWalletConnected(true);
            checkIfAddressIsWhitelisted();
            getNumberOfWhitelisted();
        } catch(err) {
            console.error(err)
        }
    }


      

      const renderButton = () => {
        if (walletConnected) {
          if (joinedWhitelist) {
            return (
              <div className={styles.description}>
                Thanks for joining the Whitelist!
              </div>
            );
          } else if (loading) {
            return <button className={styles.button}>Loading...</button>;
          } else {
            return (
              <button onClick={addAddressToWhitelist} className={styles.button}>
                Join the Whitelist
              </button>
            );
          }
        } else {
          return (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          );
        }
      };


    

    useEffect(()=> {
       // getNumberOfWhitelisted();

        if(!walletConnected){

            web3ModalRef.current = new Web3Modal({

                network: "sepolia",
                providerOptions: {},
                disabledInjectedProvide: false,
            });
            connectWallet();
        }


    },[walletConnected]);

    //console.log(numOfWhitelisted);

    return (

        <div>


            <Head>
                <title> Whitelist Dapp</title>
                <meta name="description" content="Whitelist Dapp" />

            </Head>

            <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
            <footer className={styles.footer}>
                 Made by Jovin &#10084;

            </footer>
        </div>
    )
}