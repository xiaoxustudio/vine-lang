import { readFileSync } from "fs";
import { Interface } from "readline";
import readline from "readline";
import Environment from "@/environment";
import toRealValue from "@/utils/toRealValue";

class Debugger {
	private rl: Interface;
	private filePath: string | null = null;
	private beakpoint = new Map<string, number[]>();
	private currentLine: number = 0;
	public paused: boolean = false;
	public pausedCallback: (value: unknown) => void;
	private resumeCallback: () => void;
	private currentEnvironment: Environment | null = null;

	constructor() {
		this.paused = true;
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: "debug > ",
		});
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
			return `${isBk ? `\x1b[31m${lineNumber}\x1b[0m` : lineNumber}  | ${l}`;
		});
		return formattedLines.join("\n");
	}

	start() {
		this.rl.prompt();
		this.rl.on("line", (line: string) => {
			const commandArr = line
				.trim()
				.split(/\s/)
				.filter(v => v !== " ");
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
							this.beakpoint.get(this.filePath)?.push(lineNumber);
							console.log(
								`Breakpoint set at line ${lineNumber} in ${this.filePath}`
							);
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
					} else {
						console.log("Program is not paused.");
					}
					return;
				case "src":
				case "source":
					if (this.filePath) {
						console.log(`Contents of ${this.filePath}:\n${this.getContent()}`);
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
							breakpoints.forEach(line => console.log(`  Line ${line}`));
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
							const breakpoints = this.beakpoint.get(this.filePath) || [];
							const index = breakpoints.indexOf(lineNumber);
							if (index > -1) {
								breakpoints.splice(index, 1);
								console.log(`Breakpoint removed from line ${lineNumber}`);
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
					this.rl.prompt();
					return;
				case "var":
				case "vars":
				case "v":
					this.showVariables(commandArr[1]);
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
  source       - Show source code
  exit         - Exit debugger
  h, help      - Show this help`);
					this.rl.prompt();
					return;
				default:
					console.log(
						`Unknown command: ${command}. Type 'help' for available commands.`
					);
					this.rl.prompt();
					return;
			}
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
		if (this.shouldPauseAtLine(line)) {
			this.paused = true;
			console.log(`\nPaused at breakpoint at line ${line}`);
			this.rl.prompt();
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

	// 设置当前环境
	setCurrentEnvironment(env: Environment) {
		this.currentEnvironment = env;
	}

	// 显示变量
	private showVariables(varName?: string) {
		if (!this.currentEnvironment) {
			console.log("No environment available.");
			return;
		}

		try {
			const variables = this.currentEnvironment.Variable as Map<string, any>;

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
