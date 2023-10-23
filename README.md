# Orisirisi

Houses provable web3 games of chance

# How to run locally

- Run frontend: `pnpm dev:coinflip-web`
- Start local web3 provider: `pnpm dev:start-web3-provider`
- Deploy coinflip contracts: `pnpm dev:deploy-coinflip-contracts`

Debugging Tips:

- Clear/Reset nonce data in MetaMask settings
- Switch between networks
- Disconnect and Reconnect
- Fetch all events in the node:

  ```sh
  curl \
      "http://localhost:8545"  \
      --location \
      --header 'Content-Type: application/json' \
      --request POST \
      --data-raw '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{}],"id":1}'
  ```
