# RFQ Demo script

## Instructions

### Install dependencies

```
npm install
```

### Setup environment variables

```
cp .env.example .env
```

Fill out environment variables in `.env`.
The Atlas config values should not be changed.
The Demo config values can be changed to test different scenarios.

### Run demos

EOA demo. The user is self bundling.

```
npm run demo-eoa
```

Smart wallet demo. The smart wallet is wrapping the Atlas bundle in a 4337 user operation, and sending it to a 4337 bundler.

```
npm run demo-smart-wallet
```
