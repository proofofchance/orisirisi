.PHONY: dev provider deployment all

dev: 
	npx kill-port 2000 && pnpm dev:coinflip-web 

dev.after_sleep:
	sleep 60 && make dev &

provider:
	npx kill-port 8545 && pnpm dev:start-web3-provider &

deployment:
	pnpm dev:deploy-coinflip-contracts

deployment.after_sleep:
	sleep 40 && make deployment &

reset:
	make provider && make deployment.after_sleep && make dev.after_sleep
