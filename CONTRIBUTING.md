# How to contribute to Foundry-V5

Hi! Thanks for checking out here. We welcome all support (both code and no-code contributions). If you want to get some help, hit us in the [FoundryVTT discord] at the `#wod` channel.

## **guide for development**

This project is based upon [pf2e] system for FoundryVTT, so we have many code to fix and learn from them. If you want to give a hand, follow these steps:

- Clone the repository:

  `git clone https://github.com/Rayji96/foundry-V5`

* Install the Javascript dependencies with `npm ci`

* Configure a `foundryconfig.json` file in the root folder of the project with `dataPath` and `systemName` attributes. An example can be found in `foundryconfig.example.json`, simply copy it and remove the `.example`, and configure it accordingly. The dataPath attribute is your User Data Folder from Foundry and can be found on the Configuration tab on the Setup screen. If you do not configure this file, the build will be built in the `dist/` folder right in the same directory of the repository

* Run `npm run build` to perform a one off compile/build

* Run `npm run dev` to keep the vtm5e system in your Foundry User Data Folder up to date with any coding changes you make in your dev environment.

* Start editing code and webpack is going to watch for changes and reload the folder 👍

## **Did you find a bug?**

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/Rayji96/foundry-V5/issues).

- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/Rayji96/foundry-V5/issues/new). Be sure to include a **title and clear description and label it as bug** and as much relevant information as possible. **Steps to reproduce or a screenshot is a must!**. Otherwise we surely don't have the necessary information to fix it.

## **Did you write a patch that fixes a bug?**

- Open a new GitHub pull request with the patch.

- Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.

- Super-Linter is setup to ensure clean code. PRs will not be accepted until Super-Linter passes on the PR.

## **Do you intend to add a new feature or change an existing one?**

- Open an issue labelled as an enhancement. I'll try to reply as quickly as possible to discuss whether it fits in Foundry-V5 or better lives as a FoundryVTT module.

[foundryvtt discord]: https://discord.gg/foundryvtt
[pf2e]: https://github.com/foundryvtt/pf2e
