## Develop locally

1. For Mac users, use [`homebrew`](https://brew.sh/) to [install `yarn`](https://yarnpkg.com/lang/en/docs/install/).
1. Copy your public firebase config into `src/data/firebase.config.json` (if you don't need write permission, can run `cp src/data/firebase.prod.json src/data/firebase.config.json` to connect to public endpoint).
1. Run `yarn start`.
1. Look at [`package.json`](package.json) `scripts` section for the other commands you can run, e.g. `yarn build`.
1. Get familiar with Firebase, React, and Typescript. Take a look at the [Create React App Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) - [VS Code Debugging](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#visual-studio-code) is nice.
1. Look at [`App.tsx`](src/App.tsx) for all of the main logic and assign yourself an [issue](https://github.com/rahafoundation/raha.io/issues)!
