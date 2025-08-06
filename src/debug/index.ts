import { readFileSync } from "fs";
import { Interface } from "readline";
import readline from "readline";
import { WebSocketServer as Server, WebSocket } from "ws";
import Environment from "@/environment";
import toRealValue from "@/utils/toRealValue";

export interface DebuggerConfig {
	port: number;
}

class Debugger {
	private rl: Interface;
	private filePath: string | null = null;
	private beakpoint = new Map<string, number[]>();
	private currentLine: number = 0;
	public paused: boolean = false;
	public pausedCallback: (value: unknown) => void;
	private resumeCallback: () => void;
	private currentEnvironment: Environment | null = null;
	private resetCallback: () => void;
	private server: Server;
	private clients: Set<WebSocket>;
	private config: DebuggerConfig;
	public static defaultConfig = { port: 5151 } as DebuggerConfig;

	constructor(cfg?: DebuggerConfig) {
		this.paused = true;
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: "debug > "
		});
		this.config = cfg
			? ({ ...Debugger.defaultConfig, ...cfg } as DebuggerConfig)
			: Debugger.defaultConfig;
		this.clients = new Set();
		this.startServer();
	}

	startServer() {
		this.server = new Server({ port: this.config.port });
		this.server.on("connection", (con) => {
			if (con.readyState === con.OPEN) {
				this.clients.add(con);
				con.on("close", () => {
					this.clients.delete(con);
				});
				con.on("message", (e) => {
					this.emitCommand(JSON.parse(e.toString()));
				});
			}
		});
		this.server.eventNames;
		console.log("server listening on port " + this.config.port);
	}

	stopServer() {
		this.server.close();
		this.clients.clear();
	}

	setFile(filePath: string) {
		this.filePath = filePath;
		this.beakpoint.set(this.filePath, []);
		this.rl.setPrompt(`debug (${filePath}) > `);
	}

	getContent() {
		const text = readFileSync(this.filePath, "utf-8");
		const line = text.split("\n");
		const formattedLines = line.map((l, index) => {
			const lineNumber = (index + 1).toString().padStart(3, " ");
			const isBk = this.beakpoint
				.get(this.filePath)
				.includes(parseFloat(lineNumber));
			return `${
				isBk ? `\x1B[1m\x1b[31m${lineNumber}\x1b[0m\x1b[0m` : lineNumber
			}  | ${l}`;
		});
		return formattedLines.join("\n");
	}

	emitClientData(data: any) {
		this.clients.forEach((con) => {
			if (con.readyState === con.OPEN) {
				con.send(JSON.stringify(data));
			}
		});
	}

	emitCommand(commandArr = []) {
		if (!Array.isArray(commandArr)) {
			commandArr = [(commandArr as any).key, ...(commandArr as any).args];
		}
		if (!commandArr.length) return;

		const command = commandArr[0];
		switch (command) {
			case "exit":
				this.rl.close();
				return;
			case "b":
			case "breakpoint":
			case "break":
				if (this.filePath) {
					const lineNumber = parseInt(commandArr[1], 10);
					if (!isNaN(lineNumber)) {
						if (!this.beakpoint.has(this.filePath)) {
							this.beakpoint.set(this.filePath, []);
						}

						// 检查行号是否有效
						if (this.isValidLineNumber(lineNumber)) {
							this.beakpoint.get(this.filePath)?.push(lineNumber);
							this.emitClientData({
								type: "server_breakpoint",
								filePath: this.filePath,
								lineNumber
							});

							console.log(
								`Breakpoint set at line ${lineNumber} in ${this.filePath}`
							);
						} else {
							console.log(
								`Invalid line number ${lineNumber}. File has ${this.getFileLineCount()} lines.`
							);
						}
					} else {
						console.log("Please provide a valid line number.");
					}
				} else {
					console.log("No file set for debugging.");
				}
				this.rl.prompt();
				return;
			case "n":
			case "next":
				if (this.paused) {
					this.paused = false;
					console.log("Continuing execution...");
					this.pausedCallback?.(true);
					if (this.resumeCallback) {
						this.resumeCallback();
					}
					this.emitClientData({
						type: "server_next",
						filePath: this.filePath,
						currentLine: this.currentLine
					});
				} else {
					console.log("Program is not paused.");
				}
				return;
			case "src":
			case "source":
				if (this.filePath) {
					const content = this.getContent();
					console.log(`Contents of ${this.filePath}:\n${content}`);
					this.emitClientData({
						type: "server_source",
						filePath: this.filePath,
						content
					});
				} else {
					console.log("No file set for debugging.");
				}
				this.rl.prompt();
				return;
			case "list":
			case "l":
				if (this.filePath) {
					const breakpoints = this.beakpoint.get(this.filePath) || [];
					if (breakpoints.length > 0) {
						console.log(`Breakpoints in ${this.filePath}:`);
						breakpoints.forEach((line) =>
							console.log(`  Line ${line}`)
						);
						this.emitClientData({
							type: "server_source",
							filePath: this.filePath,
							breakpoints: Object.fromEntries(
								breakpoints.entries()
							)
						});
					} else {
						console.log("No breakpoints set.");
					}
				} else {
					console.log("No file set for debugging.");
				}
				this.rl.prompt();
				return;
			case "clear":
			case "c":
				if (this.filePath) {
					const lineNumber = parseInt(commandArr[1], 10);
					if (!isNaN(lineNumber)) {
						const breakpoints =
							this.beakpoint.get(this.filePath) || [];
						const index = breakpoints.indexOf(lineNumber);
						if (index > -1) {
							breakpoints.splice(index, 1);
							console.log(
								`Breakpoint removed from line ${lineNumber}`
							);
						} else {
							console.log(`No breakpoint at line ${lineNumber}`);
						}
					} else {
						// 清除所有断点
						this.beakpoint.set(this.filePath, []);
						console.log("All breakpoints cleared.");
					}
				} else {
					console.log("No file set for debugging.");
				}
				this.rl.prompt();
				return;
			case "where":
			case "w":
				console.log(`Current line: ${this.currentLine}`);
				this.emitClientData({
					type: "server_where",
					filePath: this.filePath,
					currentLine: this.currentLine
				});
				this.rl.prompt();
				return;
			case "var":
			case "vars":
			case "v":
				this.showVariables(commandArr[1]);
				this.rl.prompt();
				return;
			case "reset":
			case "r":
				this.resetDebugEnvironment();
				this.emitClientData({
					type: "server_reset",
					filePath: this.filePath
				});
				this.rl.prompt();
				return;
			case "cls":
				process.stdout.write("\x1Bc");
				this.rl.prompt();
				return;
			case "help":
			case "h":
				console.log(`Available commands:
	b <line>     - Set breakpoint at line
	n, next      - Continue to next breakpoint
	l, list      - List all breakpoints
	c [line]     - Clear breakpoint at line (or all if no line specified)
	w, where     - Show current line
	var [name]   - Show all variables or specific variable
	reset, r     - Reset debug environment (clear all breakpoints and restart)
	source       - Show source code
	exit         - Exit debugger
	cls         - clear Terminal display content
	h, help      - Show this help`);
				this.rl.prompt();
				return;
			default:
				console.log(
					`Unknown command: ${command}. Type 'help' for available commands.`
				);
				this.emitClientData({
					type: "server_unknown_command",
					command
				});
				this.rl.prompt();
				return;
		}
	}

	start() {
		this.rl.prompt();
		this.rl.on("line", (line: string) => {
			const commandArr = line
				.trim()
				.split(/\s/)
				.filter((v) => v !== " ");
			this.emitCommand(commandArr);
		});

		this.rl.on("close", () => {
			console.log("Debugger stopped.");
		});
	}
	stop() {
		this.rl.close();
	}

	// 检查是否应该在指定行暂停
	shouldPauseAtLine(line: number): boolean {
		if (!this.filePath) return false;
		const breakpoints = this.beakpoint.get(this.filePath) || [];
		return breakpoints.includes(line);
	}

	// 设置当前执行行号并检查是否需要暂停
	setCurrentLine(line: number) {
		this.currentLine = line;
		// 检查当前行或附近的行是否有断点
		if (this.shouldPauseAtLineOrNearby(line)) {
			this.paused = true;
			console.log(`\nPaused at breakpoint at line ${line}`);
			this.rl.prompt();
		}
	}

	// 检查当前行或附近行是否有断点（处理空行情况）
	private shouldPauseAtLineOrNearby(line: number): boolean {
		if (!this.filePath) return false;
		const breakpoints = this.beakpoint.get(this.filePath) || [];

		// 首先检查精确匹配
		if (breakpoints.includes(line)) {
			return true;
		}

		return false;
	}

	// 检查行号是否有效
	private isValidLineNumber(lineNumber: number): boolean {
		try {
			const text = readFileSync(this.filePath, "utf-8");
			const lines = text.split("\n");
			return lineNumber > 0 && lineNumber <= lines.length;
		} catch {
			return false;
		}
	}

	// 获取文件行数
	private getFileLineCount(): number {
		try {
			const text = readFileSync(this.filePath, "utf-8");
			return text.split("\n").length;
		} catch {
			return 0;
		}
	}

	// 获取当前行号
	getCurrentLine(): number {
		return this.currentLine;
	}

	on(event: string, callback: (value: unknown) => void) {
		switch (event) {
			case "resume": {
				this.pausedCallback = callback;
				break;
			}
		}
	}

	// 设置恢复执行的回调
	setResumeCallback(callback: () => void) {
		this.resumeCallback = callback;
	}

	// 设置重置回调
	setResetCallback(callback: () => void) {
		this.resetCallback = callback;
	}

	// 设置当前环境
	setCurrentEnvironment(env: Environment) {
		this.currentEnvironment = env;
	}

	// 重置调试环境
	resetDebugEnvironment() {
		console.log("Resetting debug environment...");

		// 清除所有断点
		this.beakpoint.clear();
		this.beakpoint.set(this.filePath, []);
		console.log("✓ All breakpoints cleared");

		// 重置当前行号
		this.currentLine = 0;
		console.log("✓ Current line reset");

		// 重置暂停状态
		this.paused = true;
		console.log("✓ Debug state reset to paused");

		// 清除当前环境
		this.currentEnvironment = null;
		console.log("✓ Environment cleared");

		if (this.resetCallback) {
			console.log("✓ Restarting program execution...");
			this.resetCallback();
		}

		console.log(
			"Debug environment has been reset. Use 'n' to continue execution from the beginning."
		);
	}

	// 显示变量
	private showVariables(varName?: string) {
		if (!this.currentEnvironment) {
			console.log("No environment available.");
			return;
		}

		try {
			const variables = this.currentEnvironment.Variable as Map<
				string,
				any
			>;

			if (varName) {
				// 显示特定变量
				if (variables.has(varName)) {
					const value = variables.get(varName);
					console.log(`${varName} = ${toRealValue(value)}`);
				} else {
					console.log(`Variable '${varName}' not found.`);
				}
			} else {
				// 显示所有变量
				if (variables.size === 0) {
					console.log("No variables in current scope.");
				} else {
					console.log("Variables in current scope:");
					this.emitClientData({
						type: "server_vars",
						filePath: this.filePath,
						vars: Object.fromEntries(variables.entries())
					});
					for (const [name, value] of variables) {
						// 过滤掉内置变量
						if (!this.isBuiltinVariable(name)) {
							console.log(`  ${name} = ${toRealValue(value)}`);
						}
					}
				}
			}
		} catch (error) {
			console.log("Error accessing variables:", error.message);
		}
	}

	// 检查是否是内置变量
	private isBuiltinVariable(name: string): boolean {
		const builtins = ["true", "false", "print"];
		return builtins.includes(name);
	}
}

export default Debugger;
