/**
 * `pnpm dev` / `pnpm build` on every platform.
 *
 * `cf dev` and `cf build` spawn `@cloudflare/vite-plugin/bin/cf-vite`, a
 * shebang script. Windows cannot spawn that without a shell, so `cf` fails
 * with `spawn ... ENOENT`. On Windows this runs the same entry with `node`;
 * elsewhere it hands off to `cf` unchanged.
 *
 * Usage: node scripts/cf-vite.ts <dev|build> [--mode <mode>]
 */
import { spawn } from "node:child_process"
import { join } from "node:path"

const args = process.argv.slice(2)

let command: string
let commandArgs: string[]
if (process.platform === "win32") {
  // Same lookup `cf` does: the package in the project's node_modules.
  const entry = join(
    process.cwd(),
    "node_modules",
    "@cloudflare",
    "vite-plugin",
    "dist",
    "cf-vite.mjs"
  )
  command = process.execPath
  commandArgs = [entry, ...args]
} else {
  command = "cf"
  commandArgs = args
}

const child = spawn(command, commandArgs, { stdio: "inherit" })
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
