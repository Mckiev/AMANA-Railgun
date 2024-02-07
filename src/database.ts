// import fs from 'fs';
// import path from 'path';
import { randomBytes } from 'crypto';
import { Pool } from 'pg';
import { isObjectRecord } from './types';

const generateId = (): string => (
  randomBytes(32).toString('hex')
);

// const PG_CERT_PATH = path.join(__dirname, '../ca-certificate.crt');
// const PG_CERT = fs.readFileSync(PG_CERT_PATH).toString();

const pool = new Pool({
  ssl: {
    rejectUnauthorized: false,
    // cert: PG_CERT,
  }
});

const connection = {
  query: (text: string, params: unknown[] = []) => pool.query(text, params),
};

const initialize = async () => {
  console.log('creating deposits table');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Deposits (
      id VARCHAR(64) PRIMARY KEY,
      timestamp BIGINT,
      railgunAddress VARCHAR(127),
      manifoldTransferId TEXT,
      manifoldUserId TEXT,
      amount BIGINT,
      state TEXT
    );
  `);
  // console.log('creating withdrawals table');
  // await connection.query(`
  //   CREATE TABLE IF NOT EXISTS Withdrawals (
  //     id VARCHAR(64) PRIMARY KEY,
  //     timestamp BIGINT,
  //     railgunTransactionId TEXT,
  //     manifoldUserId TEXT,
  //     manifoldUsername TEXT,
  //     manifoldTransferId TEXT,
  //     amount BIGINT,
  //     state TEXT
  //   );
  // `);
  // TODO:
  // Bets:
  // + id
  // + timestamp
  // + railgunTransactionId
  // + amount
  // + marketUrl
  // + prediction
  // + redemptionAddress
  // + state = (placing, placed, redeeming, redeemed)
};

enum DepositState {
  Requested = 'Requested',
  Submitted = 'Submitted',
  Confirmed = 'Confirmed',
}

enum WithdrawalState {
  Requested = 'Requested',
  Confirmed = 'Confirmed',
}

enum BetState {
  Placing = 'Placing',
  Placed = 'Placed',
  Redeeming = 'Redeeming',
  Redeemed = 'Redeemed',
}

type StringObject = { [key: string]: string };


// const isGenericStringRow = (value: unknown): value is GenericStringRow => (
//   isObjectRecord(value)
//     && Object.values(value).every(v => typeof v === 'string')
// );

// const isGenericStringRows = (values: unknown): values is GenericStringRow[] => ( 
//   Array.isArray(values)
//     && values.every(value => isGenericStringRow(value))
// );

const isArrayOfStringObjects = (array: unknown): array is StringObject[] => {
  // Check if input is an array
  if (!Array.isArray(array)) {
    return false;
  }

  // Iterate over each item in the array
  for (const item of array) {
    // Check if the item is an object
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    // Check each key/value pair in the object
    for (const [key, value] of Object.entries(item)) {
      // Ensure the key is a string
      if (typeof key !== 'string') {
        return false;
      }
      // Ensure the value is a string
      if (typeof value !== 'string') {
        return false;
      }
    }
  }

  // If all checks passed, return true
  return true;
}


type Deposit = {
  id: string;
  timestamp: bigint;
  railgunAddress: string;
  manifoldTransferId: string;
  manifoldUserId: string;
  amount: bigint;
  state: DepositState;
};

const isDeposit = (value: unknown): value is Deposit => (
  isObjectRecord(value)
    && typeof value.id === 'string'
    && typeof value.timestamp === 'bigint'
    && typeof value.railgunAddress === 'string'
    && typeof value.manifoldTransferId === 'string'
    && typeof value.manifoldUserId === 'string'
    && typeof value.amount === 'bigint'
    && typeof value.state === 'string'
    && value.state in DepositState
);

const isDeposits = (values: unknown): values is Deposit[] => (
  Array.isArray(values)
    && values.every(value => isDeposit(value))
);

type Withdrawal = {
  id: string;
  timestamp: bigint;
  railgunTransactionId: string;
  manifoldUserId: string;
  manifoldUsername: string;
  manifoldTransferId: string;
  amount: bigint;
  state: WithdrawalState;
};

const isWithdrawal = (value: unknown): value is Withdrawal => (
  isObjectRecord(value)
    && typeof value.id === 'string'
    && typeof value.timestamp === 'bigint'
    && typeof value.railgunTransactionId === 'string'
    && typeof value.manifoldUserId === 'string'
    && typeof value.manifoldUsername === 'string'
    && typeof value.manifoldTransferId === 'string'
    && typeof value.amount === 'bigint'
    && typeof value.state === 'string'
    && value.state in WithdrawalState
);

const isWithdrawals = (values: unknown): values is Withdrawal[] => (
  Array.isArray(values)
    && values.every(value => isWithdrawal(value))
);

const createDeposit = async (
  railgunAddress: string,
  manifoldTransferId: string,
  manifoldUserId: string,
  amount: bigint,
): Promise<string> => {
  const id = generateId();
  const timestamp = Date.now();
  const state = DepositState.Requested;
  const query = 'INSERT INTO Deposits (id, timestamp, railgunAddress, manifoldTransferId, manifoldUserId, amount, state) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  const parameters = [id, timestamp, railgunAddress, manifoldTransferId, manifoldUserId, amount, state];
  await connection.query(query, parameters);
  return id;
};

const updateDepositToSubmitted = async (id: string): Promise<void> => {
  const state = DepositState.Submitted;
  const query = 'UPDATE Deposits SET state=$1 WHERE id=$2';
  const parameters = [state, id];
  await connection.query(query, parameters);
};

const updateDepositToConfirmed = async (id: string): Promise<void> => {
  const state = DepositState.Confirmed;
  const query = 'UPDATE Deposits SET state=$1 WHERE id=$2';
  const parameters = [state, id];
  await connection.query(query, parameters);
};

function convertToArrayOfDeposits(arrayOfStringObjects: StringObject[]): Deposit[] {
  return arrayOfStringObjects.map((obj): Deposit => {
    const state = obj.state as DepositState;
    if (!Object.values(DepositState).includes(state)) {
      throw new Error(`Invalid state value: ${obj.state}`);
    }
    const timestamp = BigInt(obj.timestamp);
    const amount = BigInt(obj.amount);

    return {
      id: obj.id,
      timestamp,
      railgunAddress: obj.railgunaddress,
      manifoldTransferId: obj.manifoldtransferid,
      manifoldUserId: obj.manifolduserid,
      amount,
      state,
    };
  });
}


const getQueuedDeposit = async (): Promise<Deposit | undefined> => {
  const query = 'SELECT * FROM Deposits WHERE state=$1 OR state=$2 ORDER BY timestamp ASC';
  const parameters = [DepositState.Requested, DepositState.Submitted];
  const results = await connection.query(query, parameters);
  const {rows} = results;
  const deposits = convertToArrayOfDeposits(rows);
  // [
  //   {
  //     id: '7b4e4cca5f5d33ab9b0d242cfd7bfebf05b6bf5b35197739ca734dea1e01122a',
  //     timestamp: '1707256725247',
  //     railgunaddress: '0zktest',
  //     manifoldtransferid: 'transferIdTest',
  //     manifolduserid: 'userIdTest',
  //     amount: '5000',
  //     state: 'Requested'
  //   }
  // ]
  if (!isDeposits(deposits)) {
    throw new Error('Unexpected type of deposits');
  }
  const submitted = deposits.some(deposit => deposit.state === DepositState.Submitted)
  if (submitted) { 
    return undefined;
  }
  return deposits.find(deposit => deposit.state === DepositState.Requested);
};

const createWithdrawal = async (
  railgunTransactionId: string,
  manifoldUserId: string,
  manifoldUsername: string,
  manifoldTransferId: string,
  amount: bigint,
): Promise<string> => {
  const id = generateId();
  const state = WithdrawalState.Requested;
  const query = 'INSERT INTO Withdrawals (id, railgunTransactionid, manifoldUserId, manifoldUsername, manifoldTransferId, amount, state) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  const parameters = [id, railgunTransactionId, manifoldUserId, manifoldUsername, manifoldTransferId, amount, state];
  // TODO: submit query to database
  return id;
};

const updateWithdrawalToConfirmed = async (id: string): Promise<void> => {
  const state = WithdrawalState.Confirmed;
  const query = 'UPDATE Withdrawals SET state=$1 WHERE id=$2';
  const parameters = [state, id];
  // TODO: submit query to database
};

export default {
  initialize,
  createDeposit,
  updateDepositToSubmitted,
  updateDepositToConfirmed,
  getQueuedDeposit,
  createWithdrawal,
  updateWithdrawalToConfirmed,
};