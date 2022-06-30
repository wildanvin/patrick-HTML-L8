import { ethers } from './ethers-5.6.esm.min.js'
import { abi, contractAddress } from './constants.js'

const connectButton = document.getElementById('connectButton')
const fundButton = document.getElementById('fundButton')
const balanceButton = document.getElementById('balanceButton')
const withdrawButton = document.getElementById('withdrawButton')

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    //console.log('I see Metamask!')
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    //console.log('Connected :)')
    connectButton.innerHTML = 'Connected!'
  } else {
    //console.log("Don't see it :(")
    connectButton.innerHTML = 'Please install Metamask'
  }
}
async function fund() {
  const ethAmount = document.getElementById('ethAmount').value
  console.log(`Send ${ethAmount} ETH`)
  if (typeof window.ethereum !== 'undefined') {
    //We are going to need:
    //provider/ connection to the blockchain
    //signer / wallet / someone with gas
    // contract we are interacting with
    // ABI & Address

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner()
    console.log(signer)
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(txResponse, provider)
      console.log('Done!')
    } catch (error) {
      console.log(error)
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Withdrawing...')

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner()
    //console.log(signer)
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const txResponse = await contract.withdraw()
      await listenForTransactionMine(txResponse, provider)
      console.log('Done!')
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })

  //   return new Promise()
}
