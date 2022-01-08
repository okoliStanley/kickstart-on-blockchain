import web3 from './web3';
import campaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(campaignFactory.interface),
    '0x98c61E44d0837a2f85dF25b32F7dF6be6555ecc4'
);

export default instance;