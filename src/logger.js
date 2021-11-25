import * as bunyan from 'bunyan'

class LoggerWrapper {

  constructor () {
    const streams = [
      {
        level: "trace",
        type: "rotating-file",
        path: "data/app.log",
        period: "1d",
        count: 10,
      },
    ]
    this.log = bunyan.createLogger({
      name: "messagingService",
      streams: streams,
    })
  }

  fatal (msg, ...extras) {
    this.log.fatal(msg, ...extras)
  }

  error (msg, ...extras) {
    this.log.error(msg, ...extras)
  }

  warn (msg, ...extras) {
    this.log.warn(msg, ...extras)
  }

  info (msg, ...extras) {
    this.log.info(msg, ...extras)
  }

  debug (msg, ...extras) {
    this.log.debug(msg, ...extras)
  }

  trace (msg, ...extras) {
    this.log.trace(msg, ...extras)
  }
}

const myLogger = new LoggerWrapper()

export const Logger = {
  fatal: myLogger.fatal.bind(myLogger), 
  error: myLogger.error.bind(myLogger), 
  warn: myLogger.warn.bind(myLogger),
  info: myLogger.info.bind(myLogger),
  debug: myLogger.debug.bind(myLogger),
  trace: myLogger.trace.bind(myLogger),
}