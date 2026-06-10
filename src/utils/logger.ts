const isDev = __DEV__;

export const Logger = {
  error: (tag: string, msg: string, err?: unknown) => { if (isDev) console.error(`[${tag}] ${msg}`, err); },
  warn: (tag: string, msg: string) => { if (isDev) console.warn(`[${tag}] ${msg}`); },
  info: (tag: string, msg: string) => { if (isDev) console.info(`[${tag}] ${msg}`); },
  debug: (tag: string, msg: string) => { if (isDev) console.debug(`[${tag}] ${msg}`); },
};
