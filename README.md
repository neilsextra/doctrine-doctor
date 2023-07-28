# Electron Donuts

**Example of Big Table Example**

The application can load and display a `csv` file of virtually any size.

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

```bash
# Clone this repository
git clone https://github.com/thesourorange/electron-clock.git
# Go into the repository
cd electron-donuts
# Install dependencies
npm install
# Package Windows
npm run dist
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
