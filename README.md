# elemental-ui
Rancher Extension used in [rancher/dashboard](https://github.com/rancher/dashboard) for [Elemental](https://rancher.github.io/elemental/)/OS Management UI.


## Running for Development
This is what you probably want to get started.
```bash
# Install dependencies
yarn install

# For development, serve with hot reload at https://localhost:8005
# using the endpoint for your Rancher API
API=https://your-rancher yarn mem-dev
# or put the variable into a .env file
# Goto https://localhost:8005
```

## Building the extension for production
Bump the app version on `package.json` file, then run:
```bash
# Build for production
./scripts/publish -g 
# add flag -f if you need to overwrite an existing version


# If you need to test the built extension
yarn serve-pkgs
```

## Contributing

For developers, after reading through the introduction on this page, head over to our [Getting Started](./docs/developer/getting-started) guide to learn more.

License
=======
Check Elemental UI Apache License details [here](LICENSE)