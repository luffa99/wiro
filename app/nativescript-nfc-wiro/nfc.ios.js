"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nfc = void 0;
var nfc_common_1 = require("./nfc.common");

// Required to fix execution on main thread!
const { Utils } = require("@nativescript/core");

var Nfc = /** @class */ (function () {
    function Nfc() {
    }
    Nfc._available = function () {
        var isIOS11OrUp = NSObject.instancesRespondToSelector("accessibilityAttributedLabel");
        if (isIOS11OrUp) {
            try {
                return NFCNDEFReaderSession.readingAvailable;
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    };
    Nfc.prototype.available = function () {
        return new Promise(function (resolve, reject) {
            resolve(Nfc._available());
        });
    };
    Nfc.prototype.enabled = function () {
        return new Promise(function (resolve, reject) {
            resolve(Nfc._available());
        });
    };
    Nfc.prototype.setOnTagDiscoveredListener = function (callback) {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    };
    Nfc.prototype.setOnNdefDiscoveredListener = function (callback, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!Nfc._available()) {
                reject();
                return;
            }
            if (callback === null) {
                _this.invalidateSession();
                resolve();
                return;
            }
            try {
                _this.delegate = NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(new WeakRef(_this), function (data) {
                    if (!callback) {
                        console.log("Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: " +
                            JSON.stringify(data));
                    }
                    else {
                        // execute on the main thread with this trick, so UI updates are not broken
                        //Promise.resolve().then(function () { return callback(data); });
                        Utils.executeOnMainThread(() => {
                            return callback(data); 
                        })
                    }
                }, options);
                _this.session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(_this.delegate, null, options && options.stopAfterFirstRead);
                if (options && options.scanHint) {
                    _this.session.alertMessage = options.scanHint;
                }
                _this.session.beginSession();
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    Nfc.prototype.invalidateSession = function () {
        if (this.session) {
            this.session.invalidateSession();
            this.session = undefined;
        }
    };
    Nfc.prototype.stopListening = function () {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    };
    Nfc.prototype.writeTag = function (arg) {
        return new Promise(function (resolve, reject) {
            reject("Not available on iOS");
        });
    };
    Nfc.prototype.eraseTag = function () {
        return new Promise(function (resolve, reject) {
            reject("Not available on iOS");
        });
    };
    return Nfc;
}());
exports.Nfc = Nfc;
var NFCNDEFReaderSessionDelegateImpl = /** @class */ (function (_super) {
    __extends(NFCNDEFReaderSessionDelegateImpl, _super);
    function NFCNDEFReaderSessionDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NFCNDEFReaderSessionDelegateImpl.new = function () {
        try {
            NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate);
        }
        catch (ignore) { }
        return _super.new.call(this);
    };
    NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions = function (owner, callback, options) {
        var delegate = (NFCNDEFReaderSessionDelegateImpl.new());
        delegate._owner = owner;
        delegate.options = options;
        delegate.resultCallback = callback;
        return delegate;
    };
    NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidBecomeActive = function (session) {
        // ignore, but by implementing this function we suppress a log about it not being implemented ;)
    };
    // Called when the reader session finds a new tag
    NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidDetectNDEFs = function (session, messages) {
        var _this = this;
        var firstMessage = messages[0];
        if (this.options && this.options.stopAfterFirstRead) {
            setTimeout(function () { return _this._owner.get().invalidateSession(); });
        }
        // execute on the main thread with this trick
        this.resultCallback(NFCNDEFReaderSessionDelegateImpl.ndefToJson(firstMessage));
    };
    //NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidDetectTags = function (session, tags) {
        /*
        // TODO prolly remember the tags for when the app wants to write to it (also: check Android impl for possibly sth similar)
        const nfcNdefTag = tags[0];
        session.connectToTagCompletionHandler(nfcNdefTag, (error: NSError) => {
          console.log(">> connected to tag, error: " + error);
        });
    
        // TODO either Text or URI
        const payload: NFCNDEFPayload = NFCNDEFPayload.wellKnownTypeTextPayloadWithStringLocale("EddyIOS", NSLocale.currentLocale);
        console.log(">> payload: " + payload);
    
        const ndefMessage: NFCNDEFMessage = NFCNDEFMessage.alloc().initWithNDEFRecords([payload]);
        console.log(">> ndefMessage: " + ndefMessage);
    
        if (nfcNdefTag.writeNDEFCompletionHandler) {
          nfcNdefTag.writeNDEFCompletionHandler(ndefMessage, (error: NSError) => {
            console.log(">> writeNDEFCompletionHandler, error: " + error);
          });
        }
       */
    //};
    // Called when the reader session becomes invalid due to the specified error
    NFCNDEFReaderSessionDelegateImpl.prototype.readerSessionDidInvalidateWithError = function (session /* NFCNDEFReaderSession */, error) {
        this._owner.get().invalidateSession();
    };
    NFCNDEFReaderSessionDelegateImpl.ndefToJson = function (message) {
        if (message === null) {
            return null;
        }
        return {
            message: NFCNDEFReaderSessionDelegateImpl.messageToJSON(message)
        };
    };
    NFCNDEFReaderSessionDelegateImpl.messageToJSON = function (message) {
        var result = [];
        for (var i = 0; i < message.records.count; i++) {
            result.push(NFCNDEFReaderSessionDelegateImpl.recordToJSON(message.records.objectAtIndex(i)));
        }
        return result;
    };
    NFCNDEFReaderSessionDelegateImpl.recordToJSON = function (record) {
        var payloadAsHexArray = NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.payload);
        var payloadAsString = NFCNDEFReaderSessionDelegateImpl.nsdataToASCIIString(record.payload);
        var payloadAsStringWithPrefix = payloadAsString;
        var recordType = NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.type);
        var decimalType = NFCNDEFReaderSessionDelegateImpl.hexToDec(recordType[0]);
        if (decimalType === 84) {
            var languageCodeLength = +payloadAsHexArray[0];
            payloadAsString = payloadAsStringWithPrefix.substring(languageCodeLength + 1);
        }
        else if (decimalType === 85) {
            var prefix = NfcUriProtocols[payloadAsHexArray[0]];
            if (!prefix) {
                prefix = "";
            }
            payloadAsString = prefix + payloadAsString.slice(1);
        }
        return {
            tnf: record.typeNameFormat,
            type: decimalType,
            id: NFCNDEFReaderSessionDelegateImpl.hexToDecArray(NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.identifier)),
            payload: NFCNDEFReaderSessionDelegateImpl.hexToDecArray(payloadAsHexArray),
            payloadAsHexString: NFCNDEFReaderSessionDelegateImpl.nsdataToHexString(record.payload),
            payloadAsStringWithPrefix: payloadAsStringWithPrefix,
            payloadAsString: payloadAsString
        };
    };
    NFCNDEFReaderSessionDelegateImpl.hexToDec = function (hex) {
        if (hex === undefined) {
            return undefined;
        }
        var result = 0, digitValue;
        hex = hex.toLowerCase();
        for (var i = 0; i < hex.length; i++) {
            digitValue = "0123456789abcdefgh".indexOf(hex[i]);
            result = result * 16 + digitValue;
        }
        return result;
    };
    NFCNDEFReaderSessionDelegateImpl.buf2hexString = function (buffer) {
        // buffer is an ArrayBuffer
        return Array.prototype.map
            .call(new Uint8Array(buffer), function (x) { return ("00" + x.toString(16)).slice(-2); })
            .join("");
    };
    NFCNDEFReaderSessionDelegateImpl.buf2hexArray = function (buffer) {
        // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
            return ("00" + x.toString(16)).slice(-2);
        });
    };
    NFCNDEFReaderSessionDelegateImpl.buf2hexArrayNr = function (buffer) {
        // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), function (x) { return +x.toString(16); });
    };
    NFCNDEFReaderSessionDelegateImpl.hex2a = function (hexx) {
        var hex = hexx.toString(); // force conversion
        var str = "";
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    };
    NFCNDEFReaderSessionDelegateImpl.nsdataToHexString = function (data) {
        var b = interop.bufferFromData(data);
        return NFCNDEFReaderSessionDelegateImpl.buf2hexString(b);
    };
    NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray = function (data) {
        var b = interop.bufferFromData(data);
        return NFCNDEFReaderSessionDelegateImpl.buf2hexArray(b);
    };
    NFCNDEFReaderSessionDelegateImpl.nsdataToASCIIString = function (data) {
        return NFCNDEFReaderSessionDelegateImpl.hex2a(NFCNDEFReaderSessionDelegateImpl.nsdataToHexString(data));
    };
    NFCNDEFReaderSessionDelegateImpl.hexToDecArray = function (hexArray) {
        var resultArray = [];
        for (var i = 0; i < hexArray.length; i++) {
            var result = 0, digitValue = void 0;
            var hex = hexArray[i].toLowerCase();
            for (var j = 0; j < hex.length; j++) {
                digitValue = "0123456789abcdefgh".indexOf(hex[j]);
                result = result * 16 + digitValue;
            }
            resultArray.push(result);
        }
        return JSON.stringify(resultArray);
    };
    NFCNDEFReaderSessionDelegateImpl.ObjCProtocols = [];
    return NFCNDEFReaderSessionDelegateImpl;
}(NSObject));
