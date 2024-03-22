Here is the revised version with grammatical corrections and suggested improvements:

# AMANA Backend

This repository is part of the project that makes possible to bet completely anonymously on the [Manifold](https://manifold.markets?referrer=AMANABOT)
(Not me, not the manifold, not anyone else can find out, who have made any particular bet)

It's achieved, by swapping mana for AMANA token shileded with the RAILGUN on the polygon blockchain. All of the bets are being done by sending the transfer of AMANA token with the accompanying message that specifies the particular bet
RAILGUN is a privacy technology based on zero knowledge proofs, that allows transferring tokens anonymously (the recipient can't tell who the sender was)
[Read more about RAILGUN](ipns://www.railgun.org/) (no affiliation)

### Disclaimer

This is a for-fun project, neither affiliated nor endorsed by the manifold.markets 
I, Anton Makiievskyi, am responsible for mana sent to the AMANA account, and will honor all legitimate bets, deposits and withdrawals (meaning, if the server fails to correctly process anything, I'll do it manually)
AMANA token is not exchangable for real money, and has no real value. I'm the owner of the smart contract, and can print million-trillion more of them


## Description

This repository contains the code that runs on a server to process transactions enabling anonymous bets on [Manifold](https://manifold.markets?referrer=AMANABOT).


The server implements the following functions:

1. Processing deposits
   - When the [AMANABOT account](https://manifold.markets?referrer=AMANABOT) receives a mana transfer with a legitimate RAILGUN wallet address in the message, the server sends the respective amount of AMANA tokens on the Polygon blockchain.

2. Processing withdrawals
   - When the bot's Railgun address receives a transfer of AMANA with a memo in the format "withdraw:<manifoldUsername>", the respective amount of mana is sent on Manifold.

3. Buying shares
   - When the bot's Railgun address receives a transfer of AMANA with a memo in the format "bet::<manifoldMarketSlug>::<prediction>::<redemptionAddress>", the respective bet is made on Manifold.
   - A fresh redemption address is generated for each bet so that bets cannot be linked to each other. The payout of this bet can only happen to this redemption address.
   - The AMANA wallet automatically creates a fresh address when making a bet, and upon receiving the payout, it automatically sends all AMANA to the main wallet.

4. Selling shares
   - When the server receives a signed message proving the ownership of a secret key from the redemption wallet, the market shares are sold on Manifold, and the received amount is sent (in AMANA tokens) to the redemption address.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

I will pay back in MANA for any discovered vulnerabilities.

## Contact

For any questions or inquiries, please reach me at contact@amana.bot or join the [Telegram channel](https://t.me/+xMd7-DihPUJjZjNi) for discussions and support.