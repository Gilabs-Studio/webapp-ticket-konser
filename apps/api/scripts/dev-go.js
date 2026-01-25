const path = require("path");
const { spawn } = require("child_process");

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    dropTables: args.has("--drop-tables"),
  };
}

async function main() {
  const { dropTables } = parseArgs(process.argv);

  const projectRoot = path.resolve(__dirname, "..");
  const goCacheDir = path.resolve(projectRoot, ".gocache");

  const env = {
    ...process.env,
    GOCACHE: goCacheDir,
  };

  if (dropTables) {
    env.DROP_TABLES = "true";
  }

  const child = spawn("go", ["run", "./cmd/server/main.go"], {
    cwd: projectRoot,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });

  child.on("error", () => {
    process.exit(1);
  });
}

main();
