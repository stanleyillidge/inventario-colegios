var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import { IonicNativePlugin, cordova } from '@ionic-native/core';
var GooglePlus = /** @class */ (function (_super) {
    __extends(GooglePlus, _super);
    function GooglePlus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GooglePlus.prototype.login = function (options) { return cordova(this, "login", { "successIndex": 1, "errorIndex": 2 }, arguments); };
    GooglePlus.prototype.trySilentLogin = function (options) { return cordova(this, "trySilentLogin", {}, arguments); };
    GooglePlus.prototype.logout = function () { return cordova(this, "logout", {}, arguments); };
    GooglePlus.prototype.disconnect = function () { return cordova(this, "disconnect", {}, arguments); };
    GooglePlus.prototype.getSigningCertificateFingerprint = function () { return cordova(this, "getSigningCertificateFingerprint", {}, arguments); };
    GooglePlus.pluginName = "GooglePlus";
    GooglePlus.plugin = "cordova-plugin-googleplus";
    GooglePlus.pluginRef = "window.plugins.googleplus";
    GooglePlus.repo = "https://github.com/EddyVerbruggen/cordova-plugin-googleplus";
    GooglePlus.install = "ionic cordova plugin add cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=myreversedclientid";
    GooglePlus.installVariables = ["REVERSED_CLIENT_ID"];
    GooglePlus.platforms = ["Android", "iOS"];
    GooglePlus = __decorate([
        Injectable()
    ], GooglePlus);
    return GooglePlus;
}(IonicNativePlugin));
export { GooglePlus };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvQGlvbmljLW5hdGl2ZS9wbHVnaW5zL2dvb2dsZS1wbHVzL25neC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLDhCQUFzQyxNQUFNLG9CQUFvQixDQUFDOztJQTZCeEMsOEJBQWlCOzs7O0lBVy9DLDBCQUFLLGFBQUMsT0FBYTtJQVVuQixtQ0FBYyxhQUFDLE9BQWE7SUFTNUIsMkJBQU07SUFTTiwrQkFBVTtJQVNWLHFEQUFnQzs7Ozs7Ozs7SUFoRHJCLFVBQVU7UUFEdEIsVUFBVSxFQUFFO09BQ0EsVUFBVTtxQkE5QnZCO0VBOEJnQyxpQkFBaUI7U0FBcEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvcmRvdmEsIElvbmljTmF0aXZlUGx1Z2luLCBQbHVnaW4gfSBmcm9tICdAaW9uaWMtbmF0aXZlL2NvcmUnO1xuXG4vKipcbiAqIEBuYW1lIEdvb2dsZSBQbHVzXG4gKiBAZGVzY3JpcHRpb25cbiAqIEB1c2FnZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgR29vZ2xlUGx1cyB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZ29vZ2xlLXBsdXMvbmd4JztcbiAqXG4gKiBjb25zdHJ1Y3Rvcihwcml2YXRlIGdvb2dsZVBsdXM6IEdvb2dsZVBsdXMpIHsgfVxuICpcbiAqIC4uLlxuICpcbiAqIHRoaXMuZ29vZ2xlUGx1cy5sb2dpbih7fSlcbiAqICAgLnRoZW4ocmVzID0+IGNvbnNvbGUubG9nKHJlcykpXG4gKiAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqXG4gKiBgYGBcbiAqL1xuQFBsdWdpbih7XG4gIHBsdWdpbk5hbWU6ICdHb29nbGVQbHVzJyxcbiAgcGx1Z2luOiAnY29yZG92YS1wbHVnaW4tZ29vZ2xlcGx1cycsXG4gIHBsdWdpblJlZjogJ3dpbmRvdy5wbHVnaW5zLmdvb2dsZXBsdXMnLFxuICByZXBvOiAnaHR0cHM6Ly9naXRodWIuY29tL0VkZHlWZXJicnVnZ2VuL2NvcmRvdmEtcGx1Z2luLWdvb2dsZXBsdXMnLFxuICBpbnN0YWxsOiAnaW9uaWMgY29yZG92YSBwbHVnaW4gYWRkIGNvcmRvdmEtcGx1Z2luLWdvb2dsZXBsdXMgLS12YXJpYWJsZSBSRVZFUlNFRF9DTElFTlRfSUQ9bXlyZXZlcnNlZGNsaWVudGlkJyxcbiAgaW5zdGFsbFZhcmlhYmxlczogWydSRVZFUlNFRF9DTElFTlRfSUQnXSxcbiAgcGxhdGZvcm1zOiBbJ0FuZHJvaWQnLCAnaU9TJ11cbn0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgR29vZ2xlUGx1cyBleHRlbmRzIElvbmljTmF0aXZlUGx1Z2luIHtcblxuICAvKipcbiAgICogVGhlIGxvZ2luIGZ1bmN0aW9uIHdhbGtzIHRoZSB1c2VyIHRocm91Z2ggdGhlIEdvb2dsZSBBdXRoIHByb2Nlc3MuXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAqL1xuICBAQ29yZG92YSh7XG4gICAgc3VjY2Vzc0luZGV4OiAxLFxuICAgIGVycm9ySW5kZXg6IDJcbiAgfSlcbiAgbG9naW4ob3B0aW9ucz86IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFlvdSBjYW4gY2FsbCB0cnlTaWxlbnRMb2dpbiB0byBjaGVjayBpZiB0aGV5J3JlIGFscmVhZHkgc2lnbmVkIGluIHRvIHRoZSBhcHAgYW5kIHNpZ24gdGhlbSBpbiBzaWxlbnRseSBpZiB0aGV5IGFyZS5cbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIEBDb3Jkb3ZhKClcbiAgdHJ5U2lsZW50TG9naW4ob3B0aW9ucz86IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBjbGVhciB0aGUgT0F1dGgyIHRva2VuLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgKi9cbiAgQENvcmRvdmEoKVxuICBsb2dvdXQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogVGhpcyB3aWxsIGNsZWFyIHRoZSBPQXV0aDIgdG9rZW4sIGZvcmdldCB3aGljaCBhY2NvdW50IHdhcyB1c2VkIHRvIGxvZ2luLCBhbmQgZGlzY29ubmVjdCB0aGF0IGFjY291bnQgZnJvbSB0aGUgYXBwLiBUaGlzIHdpbGwgcmVxdWlyZSB0aGUgdXNlciB0byBhbGxvdyB0aGUgYXBwIGFjY2VzcyBhZ2FpbiBuZXh0IHRpbWUgdGhleSBzaWduIGluLiBCZSBhd2FyZSB0aGF0IHRoaXMgZWZmZWN0IGlzIG5vdCBhbHdheXMgaW5zdGFudGFuZW91cy4gSXQgY2FuIHRha2UgdGltZSB0byBjb21wbGV0ZWx5IGRpc2Nvbm5lY3QuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAqL1xuICBAQ29yZG92YSgpXG4gIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogVGhpcyB3aWxsIHJldHJpZXZlIHRoZSBBbmRyb2lkIHNpZ25pbmcgY2VydGlmaWNhdGUgZmluZ2VycHJpbnQgd2hpY2ggaXMgcmVxdWlyZWQgaW4gdGhlIEdvb2dsZSBEZXZlbG9wZXIgQ29uc29sZS5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIEBDb3Jkb3ZhKClcbiAgZ2V0U2lnbmluZ0NlcnRpZmljYXRlRmluZ2VycHJpbnQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm47XG4gIH1cblxufVxuIl19