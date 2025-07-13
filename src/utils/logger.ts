// ANSI color codes for console output
const Colors = {
  Reset: '\x1b[0m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  White: '\x1b[37m',
  Gray: '\x1b[90m',
  BrightRed: '\x1b[91m',
  BrightGreen: '\x1b[92m',
  BrightYellow: '\x1b[93m',
  BrightBlue: '\x1b[94m',
  BrightMagenta: '\x1b[95m',
  BrightCyan: '\x1b[96m'
} as const

export class Logger {
  private static formatMessage(level: string, color: string, ...messages: any[]): void {
    const timestamp = new Date().toISOString()
    const prefix = `${color}[${timestamp}] ${level}:${Colors.Reset}`

    if (typeof window !== 'undefined') {
      // Browser environment - use regular console methods with styling
      console.log(
        `%c[${timestamp}] ${level}:`,
        `color: ${this.getBrowserColor(color)}`,
        ...messages
      )
    } else {
      // Node.js environment - use ANSI colors
      console.log(prefix, ...messages)
    }
  }

  private static getBrowserColor(ansiColor: string): string {
    const colorMap: Record<string, string> = {
      [Colors.Red]: '#ff0000',
      [Colors.Green]: '#00ff00',
      [Colors.Yellow]: '#ffff00',
      [Colors.Blue]: '#0000ff',
      [Colors.Magenta]: '#ff00ff',
      [Colors.Cyan]: '#00ffff',
      [Colors.Gray]: '#808080',
      [Colors.BrightRed]: '#ff6666',
      [Colors.BrightGreen]: '#66ff66',
      [Colors.BrightYellow]: '#ffff66',
      [Colors.BrightBlue]: '#6666ff',
      [Colors.BrightMagenta]: '#ff66ff',
      [Colors.BrightCyan]: '#66ffff'
    }
    return colorMap[ansiColor] || '#000000'
  }

  static info(...messages: any[]): void {
    this.formatMessage('INF', Colors.BrightBlue, ...messages)
  }

  static success(...messages: any[]): void {
    this.formatMessage('SCC', Colors.BrightGreen, ...messages)
  }

  static warn(...messages: any[]): void {
    this.formatMessage('WRN', Colors.BrightYellow, ...messages)
  }

  static error(...messages: any[]): void {
    this.formatMessage('ERR', Colors.BrightRed, ...messages)
  }

  static debug(...messages: any[]): void {
    this.formatMessage('DEB', Colors.Gray, ...messages)
  }

  static log(...messages: any[]): void {
    this.formatMessage('LOG', Colors.White, ...messages)
  }

  static trace(...messages: any[]): void {
    this.formatMessage('TRC', Colors.Magenta, ...messages)
  }

  static fatal(...messages: any[]): void {
    this.formatMessage('FTL', Colors.Red, ...messages)
  }
}
