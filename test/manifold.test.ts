import { fetchManifoldTransactions, sendTransferToUsername, fetchUserID } from '../src/manifold';


// This test whether the function fetchManifoldTransactions() returns a non empty transaction list from Manifold.
describe('fetchManifoldTransactions function', () => {
    it('should fetch transactions successfully with the correct structure', async () => {
        const result = await fetchManifoldTransactions();
        //receving some array of 2 or more transactions
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(1);

        //first element of the array has all the properties
        expect(result[0]).toHaveProperty('from');
        expect(result[0]).toHaveProperty('amount');
        expect(result[0]).toHaveProperty('memo');

        //the properties are of the correct type
        expect(typeof result[0].from).toBe('string');
        expect(typeof result[0].amount).toBe('string');
        expect(typeof result[0].memo).toBe('string');



        });
    });


// testing fetchUserID function

describe('fetchUserID function', () => {
    it('should fetch userID successfully', async () => {
        const result = await fetchUserID("testbot");
        console.log(result);
        expect(result).toEqual("6DLzPFOV0LelhuLPnCECIXqsIgN2")
    });
});



describe('sendTransferToUsername function', () => {
    it('should send transfer successfully', async () => {
        const result = await sendTransferToUsername("testbot", 10, "test memo");
        console.log(result);
        expect(result).toHaveProperty('success', true);
    });

    it('should send a transaction and verify it in the transaction list', async () => {
        const recipientUsername = 'testbot'; 
        const amount = 10; 
        // creating a random memo
        const memo = Math.random().toString(36).substring(7);
    
        // Send a transaction
        await sendTransferToUsername(recipientUsername, amount, memo);
    
        const recipientUserId = await fetchUserID(recipientUsername);
        // Fetch transactions for the recipient
        const transactions = await fetchManifoldTransactions(recipientUserId);
    
        // Find the transaction in the list
        const found = transactions.some(t => t.memo === memo && t.amount === amount.toString());
    
        // Assert that the transaction is found
        expect(found).toBe(true);
      }, 30000); // Increase timeout for integration tests



});
