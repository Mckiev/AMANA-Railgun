import * as dotenv from 'dotenv';
import { isObjectRecord } from './types';
dotenv.config();
const apiKey = process.env.MANIFOLD_BOT_API_KEY;
const mckievAPIKey = process.env.MANIFOLD_MCKIEV_API_KEY;

type ManifoldTransfer = {
  from: string;
  amount: string;
  memo: string;
};

type ManifoldTransaction = {
  fromId: string;
  amount: number;
  data: {
    message: string;
  };
};

const isManifoldTransaction = (value: unknown): value is ManifoldTransaction => (
  isObjectRecord(value)
    && typeof value.fromId === 'string'
    && typeof value.amount === 'number'
    && isObjectRecord(value.data)
    && typeof value.data.message === 'string'
);

type UserData = {
  id: string;
};

const isUserData = (value: unknown): value is UserData => (
  isObjectRecord(value)
    && typeof value.id === 'string'
);

type ResponseJson = {
  success: boolean;
};

const isResponseJson = (value: unknown): value is ResponseJson => (
  isObjectRecord(value)
    && typeof value.success === 'boolean'
);

function parseManifoldTransfers(transactions: unknown[]): ManifoldTransfer[] {
  return transactions.map(transaction => {
    if (!isManifoldTransaction(transaction)) {
      throw new Error('Unexpected transaction type returned from Manifold API');
    }
    return {
      from: transaction.fromId, 
      amount: transaction.amount.toString(), 
      memo: transaction.data.message 
    }
  });
}

// Receives user id as an argument, with default value set to my user id.
export async function  fetchManifoldTransactions(userID: string = "6DLzPFOV0LelhuLPnCECIXqsIgN2" ): Promise<ManifoldTransfer[]> {
    const url = `https://api.manifold.markets/v0/managrams?toId=${userID}`;
    const headers = {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return  parseManifoldTransfers(await response.json());
    } catch (error) {
      console.error('Error fetching managrams:', error);
      throw error;
    };

};

// Fetches userID by username

export async function fetchUserID(username: string): Promise<string> {
  const userIdResponse = await fetch(`https://api.manifold.markets/v0/user/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  
    if (!userIdResponse.ok) {
      throw new Error(`Error fetching user ID: ${userIdResponse.status}`);
    }

    const userData = await userIdResponse.json();
    if (!isUserData(userData)) {
      throw new Error('Unexpected user data type returned from Manifold API');
    }
    return userData.id;
  }

export async function sendTransferToUsername(recipientUsername: string, amount: number, memo: string): Promise<undefined> {
    
    const recipientUserId = await fetchUserID(recipientUsername);
    
    const managramResponse = await fetch('https://api.manifold.markets/v0/managram', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${mckievAPIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toIds: [recipientUserId],
        amount: amount,
        message: memo
      })
    });
  
    if (!managramResponse.ok) {
        // Log or capture the error response body
        const errorBody = await managramResponse.json();
        console.error('Error response body:', errorBody);
        throw new Error(`Error sending managram: ${managramResponse.status} - ${errorBody.message}`);
    }

    const json = await managramResponse.json();

    if (!isResponseJson(json)) {
      throw new Error('Unexpected response type returned from Manifold API');
    }

    if (!json.success) {
      throw new Error('Failed to send Manifold transfer');
    }
  }
  