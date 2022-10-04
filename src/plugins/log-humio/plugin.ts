import { IPluginLogger, LoggerBase, LogMeta } from "@bettercorp/service-base";
import { HumioPluginConfig } from "./sec.config";
const Humio = require("humio");
import * as OS from "os";

export class Logger extends LoggerBase<HumioPluginConfig> {
  private _humio!: typeof Humio;
  private _reportStats: boolean = false;
  private async humio(): Promise<typeof Humio> {
    if (this._humio !== undefined) return this._humio;
    this._humio = new Humio((await this.getPluginConfig()).humioConfig);
    this._reportStats = (await this.getPluginConfig()).reportStats;
    return this._humio;
  }
  constructor(pluginName: string, cwd: string, defaultLogger: IPluginLogger) {
    super(pluginName, cwd, defaultLogger);
  }

  public async reportStat(
    plugin: string,
    key: string,
    value: number
  ): Promise<void> {
    if (!this._reportStats) return;
    (await this.humio()).sendJson({
      eventType: "STAT",
      key,
      value,
      _hostname: OS.hostname(),
      _plugin: plugin.toUpperCase(),
      _workingDir: this.cwd,
    });
  }
  public async debug<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {}
  public async info<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {
    if (this.runningLive && hasPIData === true) return;
    let formattedMessage = this.formatLog<T>(message, meta);
    formattedMessage = `[${plugin.toUpperCase()}] ${formattedMessage}`;
    (await this.humio()).sendJson({
      eventType: "INFO",
      message: formattedMessage,
      ...meta,
      _hostname: OS.hostname(),
      _plugin: plugin.toUpperCase(),
      _workingDir: this.cwd,
    });
  }
  public async warn<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {
    if (this.runningLive && hasPIData === true) return;
    let formattedMessage = this.formatLog<T>(message, meta);
    formattedMessage = `[WARN] [${plugin.toUpperCase()}] ${formattedMessage}`;
    (await this.humio()).sendJson({
      eventType: "WARN",
      message: formattedMessage,
      ...meta,
      _hostname: OS.hostname(),
      _plugin: plugin.toUpperCase(),
      _workingDir: this.cwd,
    });
  }
  public async error<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void>;
  public async error(plugin: string, error: Error): Promise<void>;
  public async error<T extends string>(
    plugin: string,
    messageOrError: T | Error,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {
    let message: string =
      typeof messageOrError === "string"
        ? messageOrError
        : messageOrError.message;
    if (this.runningLive && hasPIData === true) return;
    let additionalmeta: any = {};
    if (
      typeof messageOrError !== "string" &&
      messageOrError.stack !== undefined
    ) {
      additionalmeta.stack = messageOrError.stack;
    }

    let formattedMessage = this.formatLog<T>(message as any, meta);
    formattedMessage = `[${plugin.toUpperCase()}] ${formattedMessage}`;
    (await this.humio()).sendJson({
      eventType: "ERROR",
      message: formattedMessage,
      ...meta,
      ...additionalmeta,
      _hostname: OS.hostname(),
      _plugin: plugin.toUpperCase(),
      _workingDir: this.cwd,
    });
  }
}
