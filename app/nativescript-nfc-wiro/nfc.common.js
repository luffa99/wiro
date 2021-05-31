"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nfc = exports.NfcUriProtocols = void 0;
exports.NfcUriProtocols = [
    "",
    "http://www.",
    "https://www.",
    "http://",
    "https://",
    "tel:",
    "mailto:",
    "ftp://anonymous:anonymous@",
    "ftp://ftp.",
    "ftps://",
    "sftp://",
    "smb://",
    "nfs://",
    "ftp://",
    "dav://",
    "news:",
    "telnet://",
    "imap:",
    "rtsp://",
    "urn:",
    "pop:",
    "sip:",
    "sips:",
    "tftp:",
    "btspp://",
    "btl2cap://",
    "btgoep://",
    "tcpobex://",
    "irdaobex://",
    "file://",
    "urn:epc:id:",
    "urn:epc:tag:",
    "urn:epc:pat:",
    "urn:epc:raw:",
    "urn:epc:",
    "urn:nfc:"
];
// this was done to generate a nice API for our users
var Nfc = /** @class */ (function () {
    function Nfc() {
    }
    Nfc.prototype.available = function () {
        return undefined;
    };
    Nfc.prototype.enabled = function () {
        return undefined;
    };
    Nfc.prototype.eraseTag = function () {
        return undefined;
    };
    Nfc.prototype.setOnNdefDiscoveredListener = function (callback, options) {
        return undefined;
    };
    Nfc.prototype.setOnTagDiscoveredListener = function (callback) {
        return undefined;
    };
    Nfc.prototype.writeTag = function (arg) {
        return undefined;
    };
    return Nfc;
}());
exports.Nfc = Nfc;
