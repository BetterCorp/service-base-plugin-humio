import { IPluginConfig, SecConfig } from "@bettercorp/service-base";

export interface HumioConfig extends IPluginConfig {
  apiToken?: string; // API Token: administration api token
  ingestToken: string; // Ingest Token: The default ingest tokens to use for #run and #stream
  host: string; // Hostname: humio hostname
  port: number; // Port: the port Humio is run on
  basePath: string; // Base Path: basePath prepended to all API URLs.
  repository: string; // Repository: the default repository (or view) to work with
}

export class Config extends SecConfig<HumioConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: HumioConfig
  ): HumioConfig {
    return {
      apiToken: existingConfig.apiToken === undefined ? undefined : existingConfig.apiToken,
      ingestToken: existingConfig.ingestToken === undefined ? 'xyz...' : existingConfig.ingestToken,
      host: existingConfig.host === undefined ? 'cloud.humio.com' : existingConfig.host,
      port: existingConfig.port === undefined ? 443 : existingConfig.port,
      basePath: existingConfig.basePath === undefined ? '/' : existingConfig.basePath,
      repository: existingConfig.repository === undefined ? 'sandbox' : existingConfig.repository
    };
  }
}
