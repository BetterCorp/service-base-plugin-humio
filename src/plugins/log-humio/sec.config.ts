import { IPluginConfig, SecConfig } from "@bettercorp/service-base";

export interface HumioConfig extends IPluginConfig {
  apiToken?: string; // API Token: administration api token
  ingestToken: string; // Ingest Token: The default ingest tokens to use for #run and #stream
  host: string; // Hostname: humio hostname
  port: number; // Port: the port Humio is run on
  basePath: string; // Base Path: basePath prepended to all API URLs.
  repository: string; // Repository: the default repository (or view) to work with
}

export interface HumioPluginConfig extends IPluginConfig {
  humioConfig: HumioConfig;
  reportStats: boolean; // Report Stats: Report STAT to humio
}

export class Config extends SecConfig<HumioPluginConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: HumioPluginConfig
  ): HumioPluginConfig {
    return {
      humioConfig: {
        apiToken:
          (existingConfig.humioConfig || {}).apiToken === undefined
            ? undefined
            : existingConfig.humioConfig.apiToken,
        ingestToken:
          (existingConfig.humioConfig || {}).ingestToken === undefined
            ? "xyz..."
            : existingConfig.humioConfig.ingestToken,
        host:
          (existingConfig.humioConfig || {}).host === undefined
            ? "cloud.humio.com"
            : existingConfig.humioConfig.host,
        port:
          (existingConfig.humioConfig || {}).port === undefined
            ? 443
            : existingConfig.humioConfig.port,
        basePath:
          (existingConfig.humioConfig || {}).basePath === undefined
            ? "/"
            : existingConfig.humioConfig.basePath,
        repository:
          (existingConfig.humioConfig || {}).repository === undefined
            ? "sandbox"
            : existingConfig.humioConfig.repository,
      },
      reportStats:
        existingConfig.reportStats === undefined
          ? true
          : existingConfig.reportStats,
    };
  }
}
