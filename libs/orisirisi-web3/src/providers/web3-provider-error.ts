export interface Web3ProviderErrorJson {
  code: number;
  message: string;
}

export class Web3ProviderError {
  private code: number;
  public message: string;

  constructor({ code, message }: Web3ProviderErrorJson) {
    this.code = code;
    this.message = message;
  }

  isUserRejectedError = () => this.code === 4001;
  isUnauthorizedError = () => this.code === 4100;
  isUnsupportedMethodError = () => this.code === 4200;
  isDisconnectedError = () => this.code === 4900;
  isChainDisconnectedError = () => this.code === 4901;
}
