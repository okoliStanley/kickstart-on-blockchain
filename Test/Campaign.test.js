const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;
const gas = '1000000';

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({data: compiledFactory.bytecode})
    .send({from: accounts[0], gas:'1000000'});

    await factory.methods.createCampaign('100').send({from: accounts[0], gas:'1000000'});
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe('Campaigns', () => {
    it('deploys factory and campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows contributors', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });

    it('requires a minimum contribution', async () => {
        try{
            await campaign.methods.contribute().send({
                value: '50',
                from: accounts[1]
            });
            assert(false);
        } catch(err){
            assert(err);
        }
    });

    it('allows manager to make request', async () => {
        await campaign.methods.createRequest('Buy Batteries', '100', accounts[2]).send({
            from: accounts[0],
            gas: gas
        });

        const request = await campaign.methods.requests(0).call();

        assert.equal('Buy Batteries', request.description);
    });

    it('processes requests', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.createRequest('Create Tesla', web3.utils.toWei('5', 'ether'), accounts[3]).send({
            from: accounts[0],
            gas: gas
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: gas
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: gas
        });

        let balance = await web3.eth.getBalance(accounts[3]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        assert(balance > 104);
    })
});