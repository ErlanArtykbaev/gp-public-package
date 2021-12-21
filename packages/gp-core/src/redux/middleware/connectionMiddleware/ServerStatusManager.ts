export type CallbackType = (...args: any[]) => any;
export type APIServiceMethod<ResponseData> = (params?: {}) => Promise<ResponseData>;
export type StatusManagerOptions = {
  /**
   * Timeout in milliseconds
   */
  timeout?: number;
};

const DEFAULT_TIMEOUT_MS = 60 * 1000;

export class ServerStatusManager<ResponseData> {
  private readonly timeout: number;
  private readonly callbacks: Record<string, CallbackType> = {};
  private statusRequest: APIServiceMethod<ResponseData>;
  private compareIntervalId: NodeJS.Timer;

  constructor(options: StatusManagerOptions = {}) {
    this.timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  }

  public setService(service: APIServiceMethod<ResponseData>) {
    this.statusRequest = service;
  }

  public on(type: string, cb: CallbackType) {
    this.callbacks[type] = cb;
  }

  public emit(type: string) {
    typeof this.callbacks[type] === 'function' && this.callbacks[type]();
  }

  public checkStatus() {
    if (typeof this.statusRequest === 'function') {
      this.statusRequest()
        .then(() => this.emit('stable'))
        .catch((e) => {
          if (Number(e.message) === 403) {
            this.emit('brokenSession');
          }

          if (![405, 403].includes(Number(e.message))) {
            this.emit('off');
          }
        });
    }
  }

  public startTracking() {
    console.info('Start server status tracking');
    this.compareIntervalId = setInterval(() => {
      this.checkStatus();
    }, this.timeout);
  }

  public endTracking() {
    console.info('End server status tracking');
    clearInterval(this.compareIntervalId);
  }
}
