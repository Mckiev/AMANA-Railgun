# Generating the mnemonic

1. Wallet generates random 256-bit mnemonic and asks the user to save it
2. Wallet generates the primary zk address from the 256-bit mnemonic

# Importing the mnemonic

1. User enters their 256-bit mnemonic
2. Wallet generates the primary zk address from the 256-bit mnemonic

# Deposit Mana -> AMANA

1. Wallet sends transaction to AMANA_BOT on Manifold with primary zk address in memo
2. Server sends AMANA to primary zk address

# Placing a bet

1. Wallet generates a random 128-bit redemption code and saves it
2. Wallet sends AMANA to server's zk address with memo containing:
  * Market URL
  * Prediction (Yes/No)
  * Redemption code
3. Server purchases shares on Manifold, stores bet information

# Redeeming a winning bet

1. Wallet generates a "burner" zk address
2. Wallet calls the server's API with redemption code and "burner" zk address
3. Server verifies the win, and sends AMANA winnings to the "burner" zk address
4. Wallet sweeps funds from the "burner" zk address ot its primary zk address

# Withdrawing

1. Wallet sends AMANA to server's zk address with memo containing the Manifold account name
2. Server sends Mana to the Manifold account
