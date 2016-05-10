import { baseInterceptor } from './baseInterceptor';
import { nativeXHR } from '../helpers/nativeServices';

export const name = 'XMLHttpRequest';
export const Reference = nativeXHR;

export const fakeService = config =>
  baseInterceptor(config, class fakeXMLHttpRequest {
    constructor(helpers) {
      this.xhr = new Reference();
      this.getHandler = helpers.getHandler;
      this.getParams = helpers.getParams;
    }

    open(method, url) {
      this.method = method;
      this.url = url;
      this.xhr.open(method, url);
    }

    send() {
      const handler = this.getHandler(this.url, this.method);
      const params = this.getParams(this.url, this.method);

      if (handler && this.onreadystatechange) {
        this.readyState = 4;
        this.status = 200; // @TODO (zzarcon): Support custom status codes
        this.responseText = handler({ params });
        return this.onreadystatechange();
      }

      this.xhr.onreadystatechange = () => {
        this.readyState = this.xhr.readyState;
        this.status = this.xhr.status;
        this.responseText = this.xhr.responseText;
        this.onreadystatechange.call(this.xhr);
      };

      return this.xhr.send();
    }
  });
