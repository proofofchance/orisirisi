.PHONY: dev provider deployment all

dev: 
	pnpm dev:coinflip-web &

provider:
	pnpm dev:start-web3-provider &

deployment:
	pnpm dev:deploy-coinflip-contracts

reset:
	make -j dev && make -j provider && make deployment
