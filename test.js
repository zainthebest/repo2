var sysmap = null;
var addons = {};
var mapAttrs = {};
var generics = {};
var sysres = {};
var relogin = false;
var hidePasswords = true;
var hidePasswordsLstn = new Listeners();
var skin = {};
var skinMode = null;
var pool = [];
var prevURLs = [];
var currentURL;
var current = null;
var urlCheker;
var ticker;
var session;
var autonomous = false;
var OP_CONTAIN = 0;
var OP_CONTAIN_NOT = 1;
var OP_IS = 2;
var OP_IS_NOT = 3;
var OP_IN = 4;
var OP_IN_NOT = 5;
var OP_LS = 6;
var OP_LEQ = 7;
var OP_GT = 8;
var OP_GEQ = 9;

function inherit(a) {
    function b() {
    }

    b.prototype = a;
    return new b()
}

function getfirst(a) {
    for (var b in a) {
        return b
    }
    return null
}

function isempty(a) {
    return getfirst(a) == null
}

function hasall(b, c) {
    for (i in b) {
        if (b[i] != c) {
            return false
        }
    }
    return true
}

function byte2str(a) {
    a &= 255;
    return String.fromCharCode(a ? a : 256)
}

function word2str(a) {
    return byte2str(a >> 24) + byte2str(a >> 16) + byte2str(a >> 8) + byte2str(a)
}

function str2byte(a, b) {
    return a.charCodeAt(b) & 255
}

function str2word(a, b) {
    return (str2byte(a, b) << 24) | (str2byte(a, b + 1) << 16) | (str2byte(a, b + 2) << 8) | str2byte(a, b + 3)
}

function escapeZeros(d) {
    var b = "";
    for (var a = 0; a < d.length; ++a) {
        var e = d.charCodeAt(a);
        if (e == 0) {
            e = 256
        }
        b += String.fromCharCode(e)
    }
    return b
}

function decodeZeros(c) {
    var b = "";
    for (var a = 0; a < c.length; ++a) {
        b += String.fromCharCode(c.charCodeAt(a) & 255)
    }
    return b
}

function get(a) {
    return document.getElementById(a)
}

function RC4(a) {
    this.S = []
}

RC4.prototype.setKey = function (e) {
    var d = this.S;
    for (var c = 0; c < 256; ++c) {
        d[c] = c
    }
    var a = 0;
    for (var c = 0; c < 256; ++c) {
        a = (a + e.charCodeAt(c % e.length) + d[c]) & 255;
        var b = d[c];
        d[c] = d[a];
        d[a] = b
    }
    this.i = 0;
    this.j = 0;
    for (var c = 0; c < 768; ++c) {
        this.gen()
    }
};
RC4.prototype.gen = function () {
    var d = this.S;
    var c = this.i = (this.i + 1) & 255;
    var a = this.j = (this.j + d[c]) & 255;
    var b = d[c];
    d[c] = d[a];
    d[a] = b;
    return d[(d[c] + d[a]) & 255]
};
RC4.prototype.skip = function (b) {
    for (var a = 0; a < b; ++a) {
        this.gen()
    }
};
RC4.prototype.encrypt = function (e) {
    var b = new Array(e.length);
    for (var d = 0; d < e.length; ++d) {
        var f = e.charCodeAt(d) ^ this.gen();
        if (f == 0) {
            f = 256
        }
        b[d] = String.fromCharCode(f)
    }
    return b.join("")
};
RC4.prototype.decrypt = function (e, d) {
    d = d || 0;
    var b = new Array(e.length);
    for (var c = 0; c < e.length - d; ++c) {
        b[c] = String.fromCharCode((e.charCodeAt(c + d) & 255) ^ this.gen())
    }
    return b.join("")
};

function sha1(h) {
    function u(b, a) {
        return (b << a) | (b >>> (32 - a))
    }

    var z = h.length;
    var g = z + 9;
    g = (g + 63) & -64;
    var s = [String.fromCharCode(128)];
    for (var y = z + 1; y < g - 8; ++y) {
        s.push(String.fromCharCode(256))
    }
    h += s.join("") + word2str(0) + word2str(z * 8);
    var p = 1732584193;
    var o = 4023233417;
    var n = 2562383102;
    var m = 271733878;
    var l = 3285377520;
    var q = [];
    for (var x = 0; x < h.length; x += 64) {
        for (var y = 0; y < 16; ++y) {
            q[y] = str2word(h, x + y * 4)
        }
        for (var y = 16; y < 80; ++y) {
            q[y] = u(q[y - 3] ^ q[y - 8] ^ q[y - 14] ^ q[y - 16], 1)
        }
        var F = p;
        var E = o;
        var D = n;
        var C = m;
        var B = l;
        var A;
        var v;
        for (var y = 0; y < 80; ++y) {
            if (y < 20) {
                A = (E & D) | (~E & C);
                v = 1518500249
            } else {
                if (y < 40) {
                    A = E ^ D ^ C;
                    v = 1859775393
                } else {
                    if (y < 60) {
                        A = (E & D) | (E & C) | (D & C);
                        v = 2400959708
                    } else {
                        A = E ^ D ^ C;
                        v = 3395469782
                    }
                }
            }
            var r = u(F, 5) + A + B + v + q[y];
            B = C;
            C = D;
            D = u(E, 30);
            E = F;
            F = r << 0
        }
        p = (p + F) << 0;
        o = (o + E) << 0;
        n = (n + D) << 0;
        m = (m + C) << 0;
        l = (l + B) << 0
    }
    return word2str(p) + word2str(o) + word2str(n) + word2str(m) + word2str(l)
}

function sha1_hmac(f, d) {
    var a = [];
    var e = [];
    for (var b = 0; b < 64; ++b) {
        var g = b < d.length ? d.charCodeAt(b) & 255 : 0;
        a[b] = String.fromCharCode(92 ^ g);
        e[b] = String.fromCharCode(54 ^ g)
    }
    return sha1(a.join("") + sha1(e.join("") + f))
}

function Session(a) {
    this.id = a;
    this.txseq = 0;
    this.txEnc = new RC4();
    this.rxseq = 0;
    this.rxEnc = new RC4();
    this.queue = {};
    this.padding = "        "
}

Session.prototype.encrypt = function (b) {
    var a = this.txseq;
    this.txseq += b.length + 8;
    return (word2str(this.id) + word2str(a)) + this.txEnc.encrypt(b) + this.txEnc.encrypt(this.padding)
};
Session.prototype.encryptURI = function (a) {
    return encodeURIComponent(decodeZeros(this.encrypt(a)))
};
Session.prototype.decrypt = function (data, cb) {
    if (data.length < 8 + 8) {
        return false
    }
    var id = str2word(data, 0);
    var seq = str2word(data, 4);
    if (id != this.id) {
        return false
    }
    if (seq != this.rxseq) {
        this.queue[seq] = {data: data, cb: cb};
        return true
    }
    this.rxseq += data.length - 8;
    var msg = this.rxEnc.decrypt(data, 8);
    if (msg.substr(msg.length - 8) != this.padding) {
        return false
    }
    if (cb) {
        cb(eval(" (" + msg + ") "))
    }
    return true
};
Session.prototype.dequeue = function () {
    while (1) {
        var a = this.queue[this.rxseq];
        if (!a) {
            break
        }
        delete this.queue[this.rxseq];
        this.decrypt(a.data, a.cb)
    }
};
Session.prototype.makeResponse = function (b, e, d) {
    this.txseq = 1;
    this.rxseq = 1;
    var c = d.substr(8);
    var a = sha1_hmac(c, e);
    this.rxEnc.setKey(sha1_hmac(c + this.rxPadding, e));
    this.txEnc.setKey(sha1_hmac(c + this.txPadding, e));
    return word2str(this.id) + word2str(0) + escapeZeros(c + a + b)
};
Session.prototype.rxPadding = "On the client side, this is the receive key; on the server side, it is the send key.";
Session.prototype.txPadding = "On the client side, this is the send key; on the server side, it is the receive key.";

function hexdump(d) {
    var c = "";
    for (var b = 0; b < d.length; ++b) {
        var a = (d.charCodeAt(b) & 255).toString(16);
        if (a.length == 1) {
            a = "0" + a
        }
        c += a
    }
    return c
}

function itxt(d, a, b) {
    var c = d.createTextNode(b);
    if (a != null) {
        a.appendChild(c)
    }
    return c
}

function iel(f, b, a, c) {
    var d = f.createElement(a);
    if (c) {
        itxt(f, d, c)
    }
    if (b != null) {
        b.appendChild(d)
    }
    return d
}

function ielc(f, c, b, a) {
    var d = iel(f, c, b);
    if (a) {
        d.className = a
    }
    return d
}

function txt(a, b) {
    return itxt(document, a, b)
}

function el(b, a, c) {
    return iel(document, b, a, c)
}

function elc(c, b, a) {
    return ielc(document, c, b, a)
}

function input(b, a) {
    var c = el(b, "input");
    c.type = a != null ? a : "text";
    return c
}

function tableList(a) {
    var b = elc(a, "table", "list");
    b.cellSpacing = 0;
    b.cellPadding = 0;
    return b
}

function addClass(d, a) {
    var b = d.className;
    if (b.indexOf(a) != -1) {
        return
    }
    d.className = b + " " + a
}

function removeClass(b, a) {
    if (b.className != "") {
        b.className = trim(b.className.replace(a, ""))
    }
}

function hasClass(b, a) {
    return b.className.indexOf(a) != -1
}

function toggleClass(b, a) {
    if (hasClass(b, a)) {
        removeClass(b, a)
    } else {
        addClass(b, a)
    }
}

function isSkinEvent(a) {
    return getEventSrc(a).nodeName == "INPUT"
}

function createButton(d, f, c, e) {
    if (!f) {
        elc(d, "li", "sep");
        return null
    }
    var a = elc(el(d, "li"), "a", "button");
    a.draggable = 0;
    a.ondragstart = function () {
        return false
    };
    a.appendChild(viewLabel(c, f));
    if (e) {
        a.onclick = function (b) {
            if (!isSkinEvent(b)) {
                openContent(e);
                return false
            }
            return true
        }
    }
    return a
}

var currentTitle;

function setDocumentTitle(a) {
    if (a) {
        currentTitle = a
    } else {
        if (!currentTitle) {
            return
        }
        a = currentTitle
    }
    document.title = sysres.identity + " - " + a + " at " + sysres.user + "@" + location.host + " - Webfig v" + sysres.version + " on " + sysres.boardname + " (" + sysres.arch + ")"
}

function imgbtn(d, e) {
    var a = el(d, "a");
    var c = el(a, "img");
    if (e) {
        c.src = e
    }
    a.className = "sbtn";
    a.draggable = 0;
    a.ondragstart = function () {
        return false
    };
    return a
}

function tbtn(d, c) {
    var a = el(d, "a", c);
    a.className = "tbtn";
    return a
}

function clearNodes(a) {
    if (a) {
        while (a.hasChildNodes()) {
            a.removeChild(a.firstChild)
        }
    }
}

function getElementPos(b) {
    if (b.offsetParent == undefined) {
        if (b.x == undefined) {
            return {x: 0, y: 0}
        }
        return {x: b.x, y: b.y}
    }
    var a = 0;
    var c = 0;
    for (; b.offsetParent; b = b.offsetParent) {
        a += b.offsetLeft;
        c += b.offsetTop
    }
    return {x: a, y: c}
}

function getScrollPos() {
    if (window.pageYOffset != undefined) {
        return {x: window.pageXOffset, y: window.pageYOffset}
    }
    if (document.body.scrollTop || document.body.scrollLeft) {
        return {x: document.body.scrollLeft, y: document.body.scrollTop}
    }
    return {x: document.documentElement.scrollLeft, y: document.documentElement.scrollTop}
}

function getWindowSize() {
    var b = window.innerWidth || 0;
    var e = window.innerHeight || 0;
    var f = document.body.clientWidth;
    var a = document.documentElement.clientWidth;
    var c = document.body.clientHeight;
    var d = document.documentElement.clientHeight;
    if (c == 0 || f > a || c > d) {
        f = a;
        c = d
    }
    if (e == 0 || f < b || c < e) {
        return {x: f, y: c}
    }
    return {x: b, y: e}
}

function getEventSrc(a) {
    a = a || event;
    return a.srcElement || a.target
}

function getPos(f, d) {
    f = f || window.event;
    var c;
    var b;
    var a = f.pageX;
    if (a == null) {
        c = f.clientX;
        a = c + (document.documentElement.scrollLeft || document.body.scrollLeft)
    } else {
        c = a - window.pageXOffset
    }
    var g = f.pageY;
    if (g == null) {
        b = f.clientY;
        g = b + (document.documentElement.scrollTop || document.body.scrollTop)
    } else {
        b = g - window.pageYOffset
    }
    if (d) {
        a -= d.offsetLeft;
        g -= d.offsetTop
    }
    return {x: a, y: g, clientX: c, clientY: b}
}

function replaceText(a, b) {
    if (a.hasChildNodes()) {
        var c = a.firstChild;
        if (c.nodeName == "#text" && c.nodeValue == b) {
            return
        }
        a.removeChild(c)
    }
    txt(a, b)
}

function show(a) {
    document.getElementById(a).style.display = "block"
}

function hide(a) {
    document.getElementById(a).style.display = "none"
}

function SVGPoly(a) {
    this.line = a
}

SVGPoly.prototype.reset = function () {
    this.points = ""
};
SVGPoly.prototype.add = function (a, b) {
    this.points += " " + a + "," + b
};
SVGPoly.prototype.draw = function () {
    this.line.setAttribute("points", this.points)
};

function SVGText(a) {
    this.el = a
}

SVGText.prototype.text = function (a) {
    replaceText(this.el, a)
};

function SVG(g, c, f, a, e, b, d) {
    this.doc = g;
    this.strokeOpacity = 1;
    this.strokeColor = "black";
    this.strokeWidth = 1;
    this.fillOpacity = 1;
    this.fillColor = "white";
    if (!c) {
        c = this.el("svg", {
            version: "1.1",
            viewBox: "0 0 " + f + " " + a,
            width: e,
            height: (b < a ? "100%" : b),
            preserveAspectRatio: "xMaxYMax slice"
        });
        if (!c || !c.viewBox) {
            return
        }
        if (d) {
            c.className.baseVal = d
        }
    }
    this.canvas = c;
    this.current = c;
    if (SVG.firefox) {
        ++f
    }
    this.viewBox = {width: f, height: a};
    if (e < f) {
        this.canvas.style.width = "100%"
    }
}

SVG.firefox = navigator.userAgent.search("Firefox") != -1;
SVG.prototype.line = function (c, e, b, d) {
    var a = this.el("line", {x1: c, y1: e, x2: b, y2: d});
    a.setAttribute("shape-rendering", "crispEdges");
    this.setAttrs(a);
    this.current.appendChild(a)
};
SVG.prototype.text = function (a, e, c, b) {
    var d = this.el("text", {x: a, y: e + c, "font-size": c});
    if (b) {
        d.setAttribute("text-anchor", "end")
    }
    this.current.appendChild(d);
    return new SVGText(d)
};
SVG.prototype.polyline = function () {
    var a = this.el("polyline");
    this.setAttrs(a);
    this.current.appendChild(a);
    return new SVGPoly(a)
};
SVG.prototype.polygon = function () {
    var a = this.el("polygon");
    this.setAttrs(a);
    this.current.appendChild(a);
    return new SVGPoly(a)
};
SVG.prototype.el = function (d, a) {
    if (!this.doc.createElementNS) {
        return null
    }
    var c = this.doc.createElementNS("http://www.w3.org/2000/svg", d);
    if (!a) {
        return c
    }
    for (var b in a) {
        c.setAttribute(b, a[b])
    }
    return c
};
SVG.prototype.setAttrs = function (a) {
    a.setAttribute("fill", this.fillColor);
    a.setAttribute("fill-opacity", this.fillOpacity);
    a.setAttribute("stroke-opacity", this.strokeOpacity);
    a.setAttribute("stroke", this.strokeColor);
    a.setAttribute("stroke-width", this.strokeWidth)
};

function createGraphic(j, f, e, a, d, b, c) {
    var h = new SVG(j, f, e, a, d, b, c);
    if (h.canvas) {
        return h
    }
    return null
}

function trim(a) {
    return a.replace(/^\s+|\s+$/g, "")
}

function hasPrefix(a, b) {
    if (a[a.length - 1] == "$") {
        return a.substr(0, a.length - 1) == b
    }
    return a == b.substr(0, a.length)
}

function hasPrefixIn(b, c) {
    for (var a in c) {
        if (hasPrefix(b, c[a].toString())) {
            return true
        }
    }
    return false
}

function hasOneOfPrefixes(b, c) {
    for (var a in b) {
        if (hasPrefix(b[a], c)) {
            return true
        }
    }
    return false
}

function fitsRangeLimit(d, b) {
    if (b && b.ranges) {
        var a = b.ranges;
        for (var c = 0; c < a.length; c += 2) {
            if (minmax(d, a[c], a[c + 1])) {
                return true
            }
        }
        return false
    }
    return true
}

function string2int(d, b) {
    if (d.length == 0) {
        return null
    }
    for (var a = 0; a < d.length; ++a) {
        var e = d.substr(a, 1);
        if ((e == "-" || e == "+") && a == 0) {
            continue
        }
        if (isNaN(parseInt(e, b || 10))) {
            return null
        }
    }
    return parseInt(d, b || 10)
}

function fraction2string(b, d) {
    var a = d.toString().length - 1;
    var c = (b % d).toString();
    while (c.length < a) {
        c = "0" + c
    }
    return c
}

function string2fraction(c, b) {
    var a = string2int(c);
    if (a == null || a < 0) {
        return null
    }
    var d = parseFloat("0." + c);
    if (isNaN(d)) {
        return null
    }
    return Math.floor(d * b)
}

function ipaddr2string(c) {
    var b = "";
    for (var a = 0; a < 4; ++a) {
        if (a > 0) {
            b += "."
        }
        b += (c & 255).toString();
        c >>= 8
    }
    return b
}

function string2ipaddr(d) {
    var b = d.split(".", 4);
    if (b.length == 1) {
        return null
    }
    if (b.length != 4) {
        if (b.length <= 2) {
            b.splice(b.length - 1, 0, "0")
        }
        if (b.length <= 3) {
            b.splice(2, 0, "0")
        }
    }
    var f = [];
    for (var c in b) {
        var e = string2int(b[c], 10);
        if (e == null || e < 0 || e > 255) {
            return null
        }
        f[c] = e
    }
    return (f[3] << 24) | (f[2] << 16) | (f[1] << 8) | f[0]
}

function ntohl(a) {
    return ((a & 255) << 24) | (((a >> 8) & 255) << 16) | (((a >> 16) & 255) << 8) | ((a >> 24) & 255)
}

function netmask2len(e) {
    if (!e) {
        return 0
    }
    var b = 0;
    for (var d = 0; d < 4; ++d, b += 8, e >>= 8) {
        var a = e & 255;
        if (a == 255) {
            continue
        }
        for (var c = 128; c > 0; c >>= 1, ++b) {
            if (!(a & c)) {
                return b
            }
        }
    }
    return b
}

function len2netmask(a) {
    var b = 0;
    for (var c = 0; c < (a & 7); ++c) {
        b = (b >> 1) | 128
    }
    for (var c = 8; c <= a; c += 8) {
        b = (b << 8) | 255
    }
    return b
}

function string2ip6addr(f) {
    var e = f.split(":");
    var d;
    var h = [];
    for (var c = 0; c < e.length; ++c) {
        if (e[c].length == 0) {
            if (c > 0 && c + 1 < e.length) {
                if (d) {
                    return null
                }
                d = h.length;
                continue
            }
            h.push(0);
            h.push(0);
            continue
        }
        if (c + 1 == e.length) {
            var b = string2ipaddr(e[c]);
            if (b != null) {
                h.push(b & 255);
                h.push((b >> 8) & 255);
                h.push((b >> 16) & 255);
                h.push((b >> 24) & 255);
                break
            }
        }
        var g = string2int(e[c], 16);
        if (g == null || g < 0 | g > 65535) {
            return null
        }
        h.push(g >> 8);
        h.push(g & 255)
    }
    if (d) {
        while (h.length < 16) {
            h.splice(d, 0, 0)
        }
    }
    if (h.length != 16) {
        return null
    }
    return h
}

function ip6addr2string(g) {
    var f = "";
    var a = false;
    var b = 0;
    for (var c = 0; c < 16; c += 2) {
        var d = (g[c] << 8) + g[c + 1];
        if (d == 0) {
            if (b == 0) {
                a = true;
                f += ":"
            }
            if (a) {
                b += 2;
                continue
            }
        }
        a = false;
        if (b == c) {
            var e = g[12] | (g[13] << 8) | (g[14] << 16) | (g[15] << 24);
            if (c == 12) {
                f += ":" + ipaddr2string(e);
                break
            } else {
                if (c == 10 && d == 65535) {
                    f += ":ffff:" + ipaddr2string(e);
                    break
                }
            }
        }
        if (c > 0) {
            f += ":"
        }
        f += d.toString(16)
    }
    if (a) {
        f += ":"
    }
    return f
}

function string2version(f) {
    var a = 102;
    var d = 0;
    var b = f.split(".");
    if (b.length < 2) {
        return null
    }
    var g = string2int(b[0]);
    if (g == null) {
        return null
    }
    var e = string2int(b[1]);
    if (e == null) {
        var j = {alpha: 97, beta: 98, rc: 99, "final": 102, test: 103};
        for (var c in j) {
            var h = b[1].split(c);
            if (h.length == 2) {
                e = string2int(h[0]);
                if (e == null) {
                    return null
                }
                a = j[c];
                d = string2int(h[1]);
                if (d == null) {
                    return null
                }
                break
            }
        }
    } else {
        if (b.length >= 3) {
            d = string2int(b[2]);
            if (d == null) {
                return null
            }
        }
    }
    return (g << 24) | (e << 16) | (a << 8) | d
}

function num2int(a) {
    return a >= 2147483648 ? a - 4294967296 : a
}

function int2num(a) {
    return a < 0 ? 4294967296 + a : a
}

function toarray(b) {
    var c = [];
    for (var d in b) {
        c[d] = b[d]
    }
    return c.length == 1 ? c[0] : c
}

function fromarray(b) {
    if (b instanceof Array) {
        var d = {};
        for (var c in b) {
            d[c] = b[c]
        }
        return d
    }
    return {0: b}
}

function fillarray(c, d) {
    var b = new Array(d);
    for (var a = 0; a < d; ++a) {
        b[a] = c
    }
    return b
}

function getTime(a) {
    return a % (3600 * 24)
}

function getDate(a) {
    return a - getTime(a)
}

function setDate(a, b) {
    return b + getTime(a)
}

function getNow() {
    return Math.floor(new Date().getTime() / 1000)
}

function getTZOffset() {
    return (new Date()).getTimezoneOffset() * 60
}

var seconds = [24, 60, 60];
var fullday = 24 * 60 * 60;

function doubledigit(a) {
    return a < 10 ? "0" + a : a.toString()
}

function interval2string(f, e) {
    var j = 0;
    if (e > 1) {
        j = f % e;
        f = Math.floor(f / e)
    }
    var d = "";
    var g = 0;
    if (f >= fullday) {
        g = Math.floor(f / fullday);
        f = f % fullday
    }
    if (g) {
        d += g + "d "
    }
    var c = Math.floor(f / 3600);
    var a = Math.floor(f / 60) % 60;
    var b = f % 60;
    d += doubledigit(c) + ":" + doubledigit(a) + ":" + doubledigit(b);
    if (j > 0) {
        d += "." + fraction2string(j, e)
    }
    return d
}

function string2interval(h, g) {
    g = g || 1;
    var c = 0;
    var f = h.split("d ");
    if (f.length > 1) {
        if (f.length > 2) {
            return null
        }
        c = string2int(f[0]);
        if (c == null || c < 0) {
            return null
        }
        h = f[1]
    }
    var b = h.split(".");
    if (b.length > 2) {
        return null
    }
    var a = b[0].split(":");
    if (a.length != 3) {
        return null
    }
    for (var e in a) {
        c *= seconds[e];
        var j = string2int(a[e]);
        if (j == null || j < 0 || j >= seconds[e]) {
            return null
        }
        c += j
    }
    if (g > 1) {
        c *= g;
        if (b.length == 2) {
            c += string2fraction(b[1], g)
        }
    } else {
        if (b.length == 2) {
            return null
        }
    }
    return c
}

var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var dayMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function toMonth(b) {
    b = b.toLowerCase();
    for (var a in months) {
        if (months[a] == b) {
            return parseInt(a)
        }
    }
    return null
}

function date2string(c) {
    var b = new Date(c * 1000);
    var a = months[b.getUTCMonth()] + "/" + doubledigit(b.getUTCDate()) + "/" + b.getUTCFullYear();
    return a.substr(0, 1).toUpperCase() + a.substr(1)
}

function string2date(h) {
    var b = h.split("/");
    if (b.length != 3) {
        return null
    }
    var g = toMonth(b[0]);
    if (g == null) {
        return null
    }
    var d = string2int(b[1]);
    if (d == null || d < 1 || d >= 32) {
        return null
    }
    var f = string2int(b[2]);
    if (f == null || f < 1970 || f >= 2030) {
        return null
    }
    var c = f % 4 == 0;
    var j = (f - 1970) * 365 + Math.floor((f - 1969) / 4);
    for (var e = 0; e < g; ++e) {
        j += dayMonth[e];
        if (c && e == 1) {
            ++j
        }
    }
    return (j + d - 1) * (3600 * 24)
}

function timezone2string(b) {
    var a = "+";
    if (b < 0) {
        a = "-";
        b = -b
    }
    b = Math.floor(b / 60);
    return a + doubledigit(Math.floor(b / 60)) + ":" + doubledigit(b % 60)
}

function string2timezone(d) {
    var a = d.split(":");
    if (a.length != 2) {
        return null
    }
    var b = string2int(a[0]);
    if (b == null) {
        return null
    }
    var c = string2int(a[1]);
    if (c == null || c < 0 || c >= 60) {
        return null
    }
    return (b * 60 + c) * 60
}

function dateAndTime2string(b, e, a, d) {
    var c = date2string(b);
    if (d && c == date2string(Date.now() / 1000)) {
        return interval2string(e)
    }
    if (!a && e == 0) {
        return c
    }
    return c + " " + interval2string(e)
}

function string2enum(a, e) {
    if (!a) {
        return null
    }
    var c = enm[a.type];
    var d = c ? c.getMap(a) : {};
    for (var b in d) {
        if (e == d[b]) {
            return parseInt(b)
        }
    }
    return null
}

function enum2string(a, b) {
    if (!a) {
        return null
    }
    return enm[a.type].toString(int2num(b), a)
}

function lossyenum_fromstr(b, f, d) {
    if (!b.values) {
        return d(b, f)
    }
    var a = f.indexOf("(");
    if (a != -1) {
        return d(b, trim(f.substr(0, a)))
    }
    var e = enm[b.values.type].getMap(b.values);
    for (var c in e) {
        if (f == e[c]) {
            return parseInt(c, 10)
        }
    }
    return d(b, f)
}

function lossyenum_tostr(a, e, d) {
    if (!a.values) {
        return d
    }
    var b = enm[a.values.type];
    var c = b ? b.getMap(a.values) : {};
    var f = c[e];
    if (f == undefined) {
        return d
    }
    return d + " (" + f + ")"
}

function parseLimit(b, g, d, h, f) {
    var c = g.split("..");
    if (c.length > 2) {
        return false
    }
    var a = d;
    if (c[0] != "") {
        a = f(c[0])
    }
    if (a == null) {
        return false
    }
    var e = a;
    if (c.length == 2) {
        e = c[1] != "" ? f(c[1]) : h;
        if (e == null) {
            return false
        }
    }
    b.push(a);
    b.push(e);
    return true
}

function minmax(c, b, a) {
    if (b != null && c < b) {
        return false
    }
    if (a != null && c > a) {
        return false
    }
    return true
}

function iminmax(c, b, a) {
    if (b != null && c < num2int(b)) {
        return false
    }
    if (a != null && c > num2int(a)) {
        return false
    }
    return true
}

function update(d, b) {
    for (var a in d) {
        var e = a.charAt(0);
        if (e == "m") {
            update(d[a], {})
        } else {
            if (e != "_") {
                delete d[a]
            }
        }
    }
    for (var a in b) {
        var e = a.charAt(0);
        if (e == "m" && d[a]) {
            update(d[a], b[a])
        } else {
            if (e != "_") {
                d[a] = b[a]
            }
        }
    }
    return d
}

function tostr(a, b) {
    if (a.opt) {
        if (b == null || !ftype(a).hasValue(a, b)) {
            return ""
        }
    }
    return ftype(a).tostr(a, b)
}

function toString(a, b) {
    return tostr(a, ftype(a).get(a, b))
}

function getNow() {
    return Math.floor((new Date()).getTime() / 1000)
}

function getUptime() {
    return getNow() + sysres.uptimediff
}

function PopupMenu(a, b) {
    this.menu = elc(document.body, "ul", "popup");
    this.menu.style.display = "none";
    this.dropDown = false;
    this.getOptions = a;
    this.getOptionCfg = b
}

PopupMenu.prototype.add = function (f, e, a) {
    var c = el(el(this.menu, "li"), "a");
    var d = el(c, "span", e);
    if (a) {
        new SkinCntrl(c, a, d)
    }
    var b = this;
    c.onclick = function () {
        b.show(false);
        b.onclick(parseInt(f));
        return false
    }
};
PopupMenu.prototype.show = function (b, h, f) {
    if (this.dropDown == b) {
        return
    }
    var a = this.menu;
    if (b) {
        clearNodes(this.menu);
        var k = this.getOptions();
        for (var c in k) {
            this.add(c, k[c], this.getOptionCfg ? this.getOptionCfg(k[c]) : null)
        }
        a.style.display = "";
        a.style.left = h + "px";
        a.style.top = f + "px";
        var g = getElementPos(a);
        var j = getWindowSize();
        var e = getScrollPos();
        if (g.y + a.offsetHeight > e.y + j.y) {
            window.scrollTo(e.x, g.y + a.offsetHeight - j.y)
        } else {
            if (g.y < e.y) {
                window.scrollTo(e.x, g.y)
            }
        }
        if (document.onclick) {
            document.onclick()
        }
        var d = this;
        setTimeout(function () {
            document.onclick = function (l) {
                d.show(false);
                return true
            }
        }, 1)
    } else {
        document.onclick = null;
        a.style.display = "none"
    }
    this.dropDown = b;
    if (this.onshow) {
        this.onshow(b)
    }
};
PopupMenu.prototype.destroy = function () {
    this.menu.parentNode.removeChild(this.menu)
};

function MenuButton(d, g, a, c, f) {
    this.bttn = createButton(d, g, a);
    var b = el(this.bttn, "img");
    b.src = "down-arrow.png";
    b.style.verticalAlign = "bottom";
    b.style.marginLeft = "1em";
    var e = this;
    this.bttn.onclick = function () {
        var h = getElementPos(e.bttn.parentNode);
        e.menu.show(!e.dropDown, h.x, h.y + e.bttn.offsetHeight - 4)
    };
    this.menu = new PopupMenu(c, f);
    this.menu.onshow = function (h) {
        if (h) {
            addClass(e.bttn, "pressed")
        } else {
            removeClass(e.bttn, "pressed")
        }
    };
    this.menu.onclick = function (h) {
        e.onclick(h)
    }
}

MenuButton.prototype.destroy = function () {
    this.menu.destroy()
};

function Checkbox(b) {
    var a = elc(b, "img", "checkbox");
    a.src = "unchecked.png";
    a.style.border = "none";
    a.style.padding = "0 3px 0 0";
    a.style.verticalAlign = "-1px";
    this.ctrl = a;
    this.checked = false;
    var c = this;
    a.onclick = function (d) {
        if (!c.onclick) {
            return true
        }
        d = d || event;
        if (d.stopPropagation) {
            d.stopPropagation()
        }
        c.setChecked(!c.checked);
        c.onclick();
        return false
    }
}

Checkbox.prototype.getElement = function () {
    return this.ctrl
};
Checkbox.prototype.isChecked = function () {
    return this.checked
};
Checkbox.prototype.setChecked = function (a) {
    this.checked = a;
    this.ctrl.src = a ? "checked.png" : "unchecked.png"
};

function TextInput(a) {
    this.setElement(a)
}

TextInput.prototype.getElement = function () {
    return this.ctrl
};
TextInput.prototype.setElement = function (b) {
    if (this.ctrl) {
        this.ctrl.onkeydown = null;
        this.ctrl.oncut = null;
        this.ctrl.onpaste = null;
        this.ctrl.ondrop = null;
        this.ctrl.oninput = null
    }
    this.ctrl = b;
    var a = this;
    b.onkeydown = function (c) {
        if (a.onkeydown) {
            a.onkeydown(c || event)
        }
        setTimeout(function () {
            if (a.text != a.ctrl.value) {
                a.text = a.ctrl.value;
                a.changed(a.text)
            }
        }, 1)
    };
    b.oncut = function () {
        a.text = a.ctrl.value;
        a.changed(a.text)
    };
    b.onpaste = function () {
        a.text = a.ctrl.value;
        a.changed(a.text)
    };
    b.ondrop = function () {
        a.text = a.ctrl.value;
        a.changed(a.text)
    };
    b.oninput = function () {
        a.text = a.ctrl.value;
        a.changed(a.text)
    }
};
TextInput.prototype.focus = function () {
    this.ctrl.focus()
};
TextInput.prototype.setEnabled = function (a) {
    this.ctrl.disabled = !a
};
TextInput.prototype.getValue = function () {
    return this.ctrl.value
};
TextInput.prototype.setValue = function (a) {
    this.text = a;
    this.ctrl.value = a
};
TextInput.prototype.changed = function (a) {
    if (this.onchange) {
        this.onchange(a)
    }
};

function TextArea(a) {
    TextInput.call(this, el(a, "textarea"));
    this.ctrl.rows = 1
}

TextArea.prototype = inherit(TextInput.prototype);
TextArea.prototype.setValue = function (a) {
    TextInput.prototype.setValue.call(this, a);
    this.changed(a)
};
TextArea.prototype.changed = function (c) {
    var a = this.ctrl.value.split("\n");
    this.ctrl.rows = a.length;
    if (this.onchange) {
        var b = this.onchange(c);
        if (this.label) {
            if (!b) {
                addClass(this.label, "error")
            } else {
                removeClass(this.label, "error")
            }
        }
    }
};

function viewLabel(a, b, e) {
    if (!e) {
        e = "name"
    }
    if (skinMode && a) {
        var d = input(null);
        var c = new TextInput(d);
        c.setValue(a[e] || b);
        c.onchange = function (f) {
            a[e] = f
        };
        c.onkeydown = function (f) {
            if (f.keyCode == 27) {
                c.setValue(b)
            } else {
                if (f.keyCode == 13) {
                    c.getElement().parentNode.focus()
                }
            }
        };
        return d
    }
    return el(null, "span", a && a[e] ? a[e] : b)
}

function getStatusContainer() {
    var a = 0;
    while (sysmap[a].name != "Status") {
        ++a
    }
    return sysmap[a].c[0]
}

function isStatusPageEmpty() {
    if (skin.Status == null || skin.Status.Status == null) {
        return true
    }
    var a = getContainerProp(getStatusContainer());
    for (var b in a) {
        if (isNaN(parseInt(b))) {
            continue
        }
        if (a[b] == 0 || a[b]._hide) {
            continue
        }
        return false
    }
    return true
}

function addToStatusPage(d) {
    var a = getContainerProp(getStatusContainer());
    var e = isStatusPageEmpty();
    var c = 0;
    for (var b in a) {
        if (b >= c) {
            c = parseInt(b) + 1
        }
    }
    a[c] = {alias: d};
    if (e) {
        generateMenu()
    }
}

function SkinCntrl(d, a, b) {
    this.parent = d;
    this.cfg = a;
    this.label = b;
    this.chk = new Checkbox(null);
    var e = this;
    this.chk.onclick = function () {
        e.cfg._hide = e.chk.isChecked() ? 0 : 1;
        e.setValue(a._hide);
        if (e.onclick) {
            e.onclick(e.cfg._hide)
        }
        return false
    };
    d.insertBefore(this.chk.getElement(), d.firstChild);
    var c = this.cfg._hide;
    if (c == null && this.cfg._def) {
        c = this.cfg._def._hide
    }
    this.setValue(c)
}

SkinCntrl.prototype.setValue = function (a) {
    this.chk.setChecked(!a);
    if (this.label) {
        if (a) {
            addClass(this.label, "strikeout")
        } else {
            removeClass(this.label, "strikeout")
        }
    }
};
SkinCntrl.prototype.getValue = function () {
    return !this.chk.isChecked()
};
SkinCntrl.prototype.setDefault = function (a) {
    if (this.cfg._hide == null) {
        this.setValue(a)
    }
};

function shouldHide(a) {
    if (skinMode) {
        return false
    }
    if (a._hide) {
        return true
    }
    if (a._hide != null) {
        return false
    }
    if (a._def) {
        return !!a._def._hide
    }
    return false
}

function ViewController(b, a) {
    this.lstns = [];
    this.views = [];
    this.allConds = [];
    this.conds = {};
    this.tabs = {};
    this.needsSeparator = false;
    this.insertPlace = 0;
    this.cfg = b;
    this.status = a
}

ViewController.prototype.addAllViews = function (g, e, a) {
    if (!e) {
        e = g._type
    }
    if (!this.mainType) {
        this.mainType = e
    }
    for (var d in e.c) {
        var j = e.c[d];
        if (j.type != "cond") {
            continue
        }
        var h = new Condition(j, this.conds, g);
        this.conds[j.name] = h;
        this.allConds.push(h)
    }
    var f = isROObj(g, e);
    for (var d in e.c) {
        var b = this.createView(g, null, e.c[d], f);
        if (b && a) {
            a.push(b)
        }
    }
    this.listenOn(g)
};
ViewController.prototype.listenOn = function (c) {
    if (!c._owner) {
        return
    }
    var a = this;
    var b = function (d) {
        if (c.ufe0001 == d.ufe0001) {
            a.update(c)
        }
    };
    c._owner.listen(b, true);
    this.lstns.push({obj: c, lstn: b})
};
ViewController.prototype.destroy = function () {
    for (var c in this.lstns) {
        var a = this.lstns[c];
        a.obj._owner.unlisten(a.lstn, true)
    }
    for (var c in this.views) {
        var b = this.views[c];
        if (b.info.owner) {
            continue
        }
        b.destroy()
    }
};
ViewController.prototype.getMainObject = function () {
    if (this.lstns.length > 0) {
        return this.lstns[0].obj
    }
    return null
};
ViewController.prototype.createGrid = function () {
    if (!this.hasGrid) {
        this.hasGrid = true
    } else {
        var b = 0;
        for (var a in this.views) {
            if (this.views[a].hasRow()) {
                ++b
            }
        }
        this.rows = b
    }
};
ViewController.prototype.create = function (e) {
    if (this.hasGrid) {
        var b = new CustomView({}, false, function (g) {
            g.createGridCell()
        });
        b.info.newColumn = true;
        this.addView(null, null, null, b, b.attrs, {order: 0}, true);
        var a = this.cfg.rows != null ? this.cfg.rows : (this.rows || 10000);
        var b = new CustomView({}, false, function (g) {
            g.createGridCell()
        });
        b.info.newColumn = true;
        this.addView(null, null, null, b, b.attrs, {order: a}, true)
    }
    this.reorderViews();
    this.table = e;
    for (var d in this.views) {
        var b = this.views[d];
        var c = b.info;
        this.current = b;
        b.createRow(this, c.cfg, c.obj);
        if (c.row && !b.isVisible()) {
            addClass(c.row, "hidden")
        }
    }
    this.addDefaultSkinLine();
    if (skinMode) {
        this.bottom = el(this.table, "tbody");
        var f = elc(el(this.bottom, "tr"), "td", "value");
        f.colSpan = 21;
        txt(f, "\u00a0")
    }
    this.fixLabelWidth();
    this.readdTabs();
    this.load();
    for (var d in this.allConds) {
        this.allConds[d].init(this)
    }
};
ViewController.prototype.fixLabelWidth = function () {
    var e = 0;
    for (var d in this.views) {
        var b = this.views[d].info;
        if (!b.row) {
            continue
        }
        var f = b.row.firstChild;
        if (f.childNodes.length == 1) {
            continue
        }
        var c = f.firstChild;
        var a = c.clientWidth;
        if (a > e) {
            e = a
        }
    }
    e = e + "px";
    for (var d in this.views) {
        var b = this.views[d].info;
        if (!b.row) {
            continue
        }
        var f = b.row.firstChild;
        var c = f.firstChild;
        c.style.minWidth = e
    }
};
ViewController.prototype.reorderViews = function () {
    var b = [];
    var a = 0;
    for (var e = 0; e < this.views.length; ++e) {
        var c = this.views[e];
        if (c.hasRow()) {
            c.info.orignalIdx = a++
        }
        if (c.info.cfg.order != null) {
            b.push(c);
            this.views.splice(e, 1);
            --e
        }
    }
    if (b.length == 0) {
        return
    }
    b.sort(function (g, f) {
        if (g.info.cfg.order < f.info.cfg.order) {
            return -1
        }
        if (g.info.cfg.order > f.info.cfg.order) {
            return 1
        }
        if (g.info.newColumn) {
            return -1
        }
        if (f.info.newColumn) {
            return 1
        }
        return 0
    });
    var a = 0;
    var d = 0;
    for (var e in b) {
        var c = b[e];
        while (a < c.info.cfg.order && d < this.views.length) {
            if (this.views[d++].hasRow()) {
                ++a
            }
        }
        this.views.splice(d, 0, c);
        ++d;
        if (c.hasRow()) {
            ++a
        }
    }
};
ViewController.prototype.renumViews = function () {
    var a = 0;
    for (var c in this.views) {
        var b = this.views[c].info;
        if (b.newColumn) {
            if (c == 0) {
                continue
            }
            if (this.rows ? a == this.rows : c == this.views.length - 1) {
                delete this.cfg.rows
            } else {
                this.cfg.rows = a
            }
            continue
        }
        if (!this.views[c].hasRow()) {
            continue
        }
        if (b.cfg.order != null) {
            if (b.orignalIdx == a) {
                delete b.cfg.order
            } else {
                b.cfg.order = a
            }
        }
        ++a
    }
};
ViewController.prototype.update = function (c) {
    for (var b in this.views) {
        var a = this.views[b];
        if (a.info.owner) {
            continue
        }
        if (c && a.info.obj != c) {
            continue
        }
        if (!a.isChanged()) {
            a.load(a.info.obj)
        }
    }
};
ViewController.prototype.load = function () {
    for (var b in this.views) {
        var a = this.views[b];
        if (a.info.owner) {
            continue
        }
        a.load(a.info.obj)
    }
};
ViewController.prototype.save = function () {
    for (var b in this.views) {
        var a = this.views[b];
        if (a.info.owner || a.info.ro) {
            continue
        }
        if (!a.isVisible() || !a.isEnabled()) {
            continue
        }
        var c = a.save(a.info.obj);
        if (c != null) {
            alert(c);
            return false
        }
    }
    return true
};
ViewController.prototype.isChanged = function () {
    for (var b in this.views) {
        var a = this.views[b];
        if (a.info.owner || a.info.ro) {
            continue
        }
        if (!a.isVisible() || !a.isEnabled()) {
            continue
        }
        if (a.isChanged()) {
            return true
        }
    }
    return false
};
ViewController.prototype.readdTabs = function () {
    var f = null;
    var k = null;

    function d(l) {
        if (l && l.tab) {
            l.tab.parentNode.removeChild(l.tab);
            l.tab = null
        }
        return null
    }

    function b(l) {
        if (l && l.sep) {
            l.sep.parentNode.removeChild(l.sep);
            l.sep = null
        }
        return null
    }

    var j = null;
    for (var c = 0; c < this.views.length; ++c) {
        var g = this.views[c];
        var h = g.info;
        if (!h.row) {
            continue
        }
        var e = h.cfg.separator && h.cfg.separator._hide;
        if (typeof h.cfg.tab == "string") {
            h.cfg.tab = {name: h.cfg.tab}
        }
        if ((h.group && j != h.group) || (h.cfg.tab && (h.cfg.tab._hide == 0 || h.cfg.tab.name))) {
            if (h.group && j != h.group) {
                h.tabByDefault = true
            }
            j = h.group;
            k = d(k);
            f = b(f);
            var a = h.cfg.tab ? h.cfg.tab : (h.group ? h.group.cfg : null);
            if (!a || a._hide != 1) {
                k = h
            }
        } else {
            if (!k && !e && (h.separator || h.cfg.separator)) {
                b(f);
                f = h
            }
        }
        d(h);
        b(h);
        if (!g.isVisible()) {
            continue
        }
        if (k && !k.tab) {
            k.tab = this.createTab(k)
        } else {
            if (f && !f.sep) {
                f.sep = this.createSeparator(f)
            }
        }
        k = null;
        f = null
    }
    d(k);
    b(f)
};
ViewController.prototype.newView = function (f, b, d, e) {
    if (b.nonpublic || d) {
        return new HiddenView(b)
    }
    var g = b.on ? this.conds[b.on] : null;
    if (g && g.shouldHide(f)) {
        return null
    }
    if (!e && g && g.shouldMakeRO(f)) {
        e = true
    }
    var a = ftype(b).view(b, e || b.ro);
    if (a && g) {
        g.addView(a)
    }
    return a
};
ViewController.prototype.createView = function (h, a, e, f) {
    var g = a;
    if (a) {
        if (a.getTabName() == null) {
            g = a.info.group
        } else {
            if (!a.cfg) {
                a.cfg = getProp(a.info.cfg, "tab")
            }
        }
    }
    if (!g && e.owner && e.owner.name && (e.owner.type == "tab" || e.owner.type == "gridcell")) {
        function d(j) {
            this.attrs = j
        }

        d.prototype.getTabName = function () {
            return this.attrs.name
        };
        d.prototype.getVisualClass = function () {
            return null
        };
        g = this.tabs[e.owner.name];
        if (!g) {
            g = this.tabs[e.owner.name] = new d(e.owner);
            g.cfg = getProp(getAttrProp(h, e.owner), "tab")
        }
    }
    var c = ftype(e).cfg(e, h);
    var b = this.newView(h, e, shouldHide(c), f || c.ro);
    if (!b) {
        return null
    }
    return this.addView(h, a, g, b, e, c, f)
};
ViewController.prototype.addView = function (b, a, g, e, h, d, c) {
    var j = e.info;
    j.obj = b;
    j.attrs = h;
    j.ro = c || e.isRO();
    j.cfg = d;
    j.owner = a;
    j.group = g;
    if (this.needsSeparator && e.hasRow()) {
        j.separator = true;
        this.needsSeparator = false
    }
    var f = this.insertPlace++;
    if (h.order != null) {
        f = h.order;
        if (f < 0) {
            f = this.views.length + f + 1;
            if (f < 0) {
                f = 0
            }
            --this.insertPlace
        } else {
            if (f > this.views.length) {
                f = this.views.length
            }
        }
    }
    this.views.splice(f, 0, e);
    e.attach(this, b);
    if (e.getTabName() != null) {
        j.group = e
    }
    return e
};
ViewController.prototype.showView = function (b, a) {
    var c = b.info;
    if (c.row) {
        if (a) {
            removeClass(c.row, "hidden");
            this.readdTabs()
        } else {
            addClass(c.row, "hidden");
            this.readdTabs()
        }
    }
};
ViewController.prototype.getTBody = function () {
    var b = this.current.info;
    if (!b.row) {
        b.row = el(this.table, "tbody");
        if (b.owner) {
            var a = b.owner.getVisualClass();
            if (a != null) {
                addClass(b.row, a)
            }
        }
    }
    return b.row
};
ViewController.prototype.createRow = function (b, a) {
    var e = el(this.getTBody(), "tr");
    if (skinMode) {
        elc(e, "td", "ctrl")
    }
    var d = elc(e, "td", "label");
    if (b) {
        d.appendChild(b)
    }
    if (a != -1) {
        var c = elc(e, "td", "extra");
        if (a) {
            c.appendChild(a)
        }
    }
    return e
};
ViewController.prototype.createSingleItemRow = function () {
    var a = el(this.getTBody(), "tr");
    var b = elc(a, "td", "value");
    b.colSpan = 20;
    return b
};
ViewController.prototype.addRow = function (g, b, k, l) {
    if (!(k instanceof Array)) {
        k = [k]
    }
    var a = k[0].create(this, g);
    if (!a) {
        return
    }
    var e = g ? g.getNode() : null;
    var f = this.createRow(e, b);
    this.createSkinCntrl(this.current, f.firstChild, e);
    for (var d = 1; true; ++d) {
        var c = el(f, "td");
        c.appendChild(a);
        var j = k[d - 1].getPostfix();
        if (j) {
            txt(c, j)
        }
        k[d - 1].realized();
        if (d == k.length) {
            c.className = "value";
            c.colSpan = 20 - d * 2 + (b == -1 ? 1 : 0);
            break
        }
        c.className = "tvalue";
        var c = elc(f, "td", "tvalue");
        c.style.minWidth = "0";
        txt(c, l);
        a = k[d].create(this, g ? g.clone() : null)
    }
    if (!skinMode && this.current.info.cfg.note) {
        f.firstChild.rowSpan = 2;
        f.firstChild.nextSibling.rowSpan = 2;
        var f = el(f.parentNode, "tr");
        var h = elc(f, "td", "fvalue");
        h.colSpan = 18;
        h.innerHTML = this.current.info.cfg.note
    }
    return f.parentNode
};
ViewController.prototype.createSkinCntrl = function (f, h, g, j) {
    var k = f.info;
    if (!skinMode || !k.attrs.name) {
        return
    }
    var b = null;
    if (!j) {
        b = el(null, "img");
        b.src = "minimenu.png";
        b.style.border = "none";
        b.style.padding = "0 3px 0 0";
        b.style.verticalAlign = "-1px";
        h.insertBefore(b, h.firstChild)
    }
    k.ctrl = new SkinCntrl(h, k.cfg, g);
    if (!b) {
        return
    }

    function a() {
        var m = {};
        if (!k.ro) {
            m[1] = !k.cfg.ro ? "Make Read Only" : "Make Read/Write"
        }
        if (k.row) {
            m[2] = k.cfg.note == null ? "Add Note" : "Remove Note"
        }
        if (!k.ro && ftype(k.attrs).deflimit(k.attrs) != null) {
            m[3] = k.cfg.limit == null ? "Add Limit" : "Remove Limit"
        }
        if (k.obj && !e.status) {
            k.alias = e.getViewAliasPath(f);
            if (k.alias) {
                m[4] = "Add To Status Page"
            }
        }
        if (k.row) {
            if (!k.tab) {
                m[5] = "Add Tab"
            }
            if (!k.tab && !k.tab) {
                m[6] = "Add Separator"
            }
        }
        return m
    }

    var e = this;
    var d = function () {
        document.onmouseup = null;
        b.src = "minimenu.png";
        var m = new PopupMenu(a);
        m.onclick = function (o) {
            e.skinMenu(f, o)
        };
        m.onshow = function (o) {
            if (!o) {
                setTimeout(function () {
                    m.destroy()
                }, 1)
            }
        };
        var n = getElementPos(b);
        m.show(true, n.x, n.y + b.offsetHeight);
        return false
    };
    b.onmousedown = function () {
        b.src = "minimenu-pressed.png";
        document.onmouseup = d;
        return false
    };
    if (!k.row) {
        return
    }
    k.noteChanged = function (m) {
        k.cfg.note = m;
        return true
    };
    k.limitChanged = function (n) {
        var m = ftype(k.attrs).limit(k.attrs, n);
        if (m == null) {
            return false
        }
        k.cfg.limit = n;
        f.setLimit(m);
        return true
    };
    if (k.cfg.ro) {
        f.makeRO(true)
    }
    if (k.cfg.note != null) {
        k.note = this.addSkinEntry(f, k.cfg.note, "Note", k.noteChanged)
    }
    if (ftype(k.attrs).deflimit(k.attrs) != null && k.cfg.limit != null) {
        k.limit = this.addSkinEntry(f, k.cfg.limit, "Limit", k.limitChanged)
    }
    var l = function (q) {
        if (e.dragTimer) {
            clearTimeout(e.dragTimer);
            e.dragTimer = null;
            e.drag.style.display = "block"
        }
        if (!e.dragging) {
            e.dragging = true;
            e.drag = el(null, "table");
            e.drag.className = "skindrag";
            e.drag.appendChild(k.row.cloneNode(true));
            document.body.appendChild(e.drag)
        }
        var r = getPos(q);
        e.drag.style.left = (r.x + 8) + "px";
        e.drag.style.top = (r.y + 8) + "px";
        var n = k.row.offsetHeight;
        var v = window.innerHeight || document.documentElement.clientHeight;
        var s = r.clientY;
        var w = s < 0 ? s : (s > v ? s - v : 0);
        var x = null;
        var u = -1;
        if (w == 0) {
            var x = getEventSrc(q);
            while (x) {
                if (x.nodeName == "TBODY" && hasClass(x.parentNode, "list")) {
                    break
                }
                x = x.parentNode
            }
            var m = null;
            for (var p in e.views) {
                var o = e.views[p].info;
                if (o.tab == x || o.sep == x || o.row == x) {
                    m = e.views[p];
                    u = p;
                    break
                }
            }
            if (m != null) {
                if (m == f) {
                    x = null
                } else {
                    if (m.info.tab) {
                        x = m.info.tab
                    } else {
                        if (m.info.sep) {
                            x = m.info.sep
                        }
                    }
                }
            } else {
                if (x == e.bottom) {
                    u = e.views.length
                } else {
                    x = null
                }
            }
        }
        if (e.dropTarget != x) {
            if (e.dropTarget) {
                removeClass(e.dropTarget, "droptarget")
            }
            e.dropTarget = x;
            e.dropIndex = u;
            if (e.dropTarget) {
                addClass(e.dropTarget, "droptarget")
            }
        }
        if (w != 0) {
            var t = function () {
                window.scrollBy(0, w * 2);
                e.dragTimer = setTimeout(t, 100)
            };
            e.drag.style.display = "none";
            e.dragTimer = setTimeout(t, 1)
        }
        return false
    };
    var c = function (n) {
        document.onmousemove = null;
        document.onmouseup = null;
        if (e.drag) {
            document.body.removeChild(e.drag);
            e.drag = null
        }
        if (e.dropTarget) {
            removeClass(e.dropTarget, "droptarget");
            var o = null;
            for (var m in e.views) {
                if (e.views[m] == f) {
                    o = m;
                    break
                }
            }
            if (o != null) {
                k.row.parentNode.removeChild(k.row);
                e.dropTarget.parentNode.insertBefore(k.row, e.dropTarget);
                k.cfg.order = 0;
                if (o < e.dropIndex) {
                    --e.dropIndex
                }
                e.views.splice(o, 1);
                e.views.splice(e.dropIndex, 0, f);
                e.renumViews();
                e.readdTabs()
            }
            e.dropTarget = null
        }
        e.dragging = false;
        return false
    };
    k.row.onmousedown = function (m) {
        var n = getEventSrc(m);
        if (n.nodeName != "TD" && n.nodeName != "DIV") {
            return true
        }
        document.onmousemove = l;
        document.onmouseup = c;
        return false
    }
};
ViewController.prototype.getViewAliasPath = function (b) {
    var c = b.info;
    if (!c.attrs.name) {
        return null
    }
    var f = c.obj;
    var d = f._type;
    while (d.owner) {
        d = d.owner
    }
    var a = d.service;
    if (!a) {
        return null
    }
    var e = "";
    if (a.group) {
        e = a.group + ":"
    }
    e += a.name + ":";
    e += d.title + ":";
    if (f.ufe0001 != null) {
        e += "*" + f.ufe0001 + ":"
    }
    if (c.group) {
        e += c.group.getTabName() + ":"
    }
    e += c.attrs.name;
    return e
};
ViewController.prototype.skinMenu = function (a, c) {
    var b = a.info;
    switch (c) {
        case 1:
            b.cfg.ro = !b.cfg.ro;
            a.makeRO(b.cfg.ro);
            break;
        case 2:
            if (b.cfg.note == null) {
                b.cfg.note = "";
                b.note = this.addSkinEntry(a, "", "Note", b.noteChanged)
            } else {
                if (b.note) {
                    b.note.parentNode.removeChild(b.note)
                }
                b.note = null;
                b.cfg.note = null
            }
            break;
        case 3:
            if (b.cfg.limit == null) {
                b.cfg.limit = "";
                b.limit = this.addSkinEntry(a, ftype(b.attrs).deflimit(b.attrs), "Limit", b.limitChanged)
            } else {
                if (b.limit) {
                    b.limit.parentNode.removeChild(b.limit)
                }
                b.limit = null;
                b.cfg.limit = null
            }
            break;
        case 4:
            addToStatusPage(b.alias);
            break;
        case 5:
            if (b.tabByDefault) {
                delete b.cfg.tab;
                b.group.cfg._hide = 0
            } else {
                getProp(b.cfg, "tab")._hide = 0;
                b.cfg.tab.name = "New Tab"
            }
            delete b.cfg.separator;
            this.readdTabs();
            break;
        case 6:
            if (b.separator) {
                delete b.cfg.separator
            } else {
                getProp(b.cfg, "separator")._hide = 0
            }
            this.readdTabs();
            break
    }
};
ViewController.prototype.addSkinEntry = function (d, h, e, a) {
    if (!d.info.row) {
        return
    }
    var c = d.info.row.firstChild;
    var k = el(null, "tr");
    elc(k, "td", "ctrl");
    var f = el(elc(k, "td", "flabel"), "span", e);
    elc(k, "td", "fextra");
    var j = elc(k, "td", "fvalue");
    j.colSpan = 18;
    var g = new TextArea(j, f);
    g.setValue(h);
    var b = this;
    g.onchange = a;
    c.parentNode.insertBefore(k, c.nextSibling);
    g.focus();
    return k
};
ViewController.prototype.addDefaultSkinLine = function () {
    if (!skinMode || !this.mainType) {
        return
    }
    var e = this.mainTable ? this.mainTable : this.table;
    var c = el(null, "tbody");
    e.insertBefore(c, e.firstChild);
    var f = elc(el(c, "tr"), "td", "value");
    f.colSpan = 21;
    f.style.padding = "4px 0";
    var b = getContainerProp(this.mainType);
    var a = new SkinCntrl(f, getProp(b, "*"), el(f, "span", "Show By Default"));
    var d = this;
    a.onclick = function (j) {
        var g = d.views;
        for (var h in g) {
            if (g[h].info.ctrl) {
                g[h].info.ctrl.setDefault(j)
            }
        }
    }
};
ViewController.prototype.createLine = function (f, d) {
    var b = d ? d.parentNode : this.table;
    var a = el(null, "tbody");
    var c = el(a, "tr");
    if (skinMode) {
        elc(c, "td", "ctrl")
    }
    var e = el(c, "td");
    e.colSpan = skinMode ? 19 : 20;
    e.className = "sep";
    e.appendChild(f);
    b.insertBefore(a, d);
    return a
};
ViewController.prototype.addSeparatorForNext = function () {
    this.needsSeparator = true
};
ViewController.prototype.createSeparator = function (a) {
    var b = this.createLine(el(null, "hr"), a.row);
    if (skinMode) {
        var d = tbtn(b.firstChild.firstChild, "-");
        d.parentNode.style.textAlign = "right";
        d.style.marginRight = "2px";
        d.title = "Remove";
        var c = this;
        d.onclick = function (f) {
            a.sep.parentNode.removeChild(a.sep);
            a.sep = null;
            if (a.separator) {
                getProp(a.cfg, "separator")._hide = 1
            } else {
                delete a.cfg.separator
            }
        }
    }
    return b
};
ViewController.prototype.createTab = function (a) {
    if (typeof a.cfg.tab == "string") {
        a.cfg.tab = {name: a.cfg.tab}
    }
    var g = a.cfg.tab;
    if (!g && a.group) {
        g = a.group.cfg
    }
    if (!g) {
        g = getProp(a.cfg, "tab")
    }
    var d = el(null, "h2");
    var c = this.createLine(d, a.row);
    var b = a.group ? a.group.getTabName() : "unknown";
    d.appendChild(viewLabel(g, b));
    if (skinMode) {
        var f = tbtn(c.firstChild.firstChild, "-");
        f.parentNode.style.textAlign = "right";
        f.style.marginRight = "2px";
        f.title = "Remove";
        var e = this;
        f.onclick = function (h) {
            if (a.tabByDefault) {
                a.group.cfg._hide = 1
            } else {
                delete a.cfg.tab
            }
            e.readdTabs()
        }
    }
    return c
};
ViewController.prototype.createGridCell = function () {
    var b = !this.mainTable;
    var a;
    if (!this.mainTable) {
        this.mainTable = this.table;
        a = el(el(this.table, "tbody"), "tr")
    } else {
        a = this.table.parentNode.parentNode
    }
    var c = el(a, "td");
    c.style.verticalAlign = "top";
    c.style.width = "50%";
    this.table = elc(c, "table", "list");
    if (!b) {
        c.style.paddingLeft = "2em"
    }
    this.table.cellSpacing = 0;
    this.table.cellPadding = 0
};
ViewController.prototype.getView = function (b, d) {
    var e = null;
    for (var c in this.views) {
        var a = this.views[c].getView(b);
        if (a) {
            if (!e) {
                e = a
            }
            if (!d || this.views[c].info.obj == d) {
                return a
            }
        }
    }
    return e
};
ViewController.prototype.getCondition = function (a) {
    return this.conds[a]
};
ViewController.prototype.getTable = function () {
    return this.table
};

function SetupController(a) {
    ViewController.call(this, a);
    this.active = 0
}

SetupController.prototype = inherit(ViewController.prototype);
SetupController.prototype.createPanes = function () {
    var b = [];
    var e = null;
    this.panes = [];
    for (var d in this.views) {
        var a = this.views[d];
        var c = a.info;
        if (!e) {
            e = c.group
        } else {
            if (c.group != e) {
                this.panes.push(b);
                b = [];
                e = c.group
            }
        }
        b.push(a);
        if (this.panes.length > 0) {
            a.hide()
        }
    }
    this.panes.push(b)
};
SetupController.prototype.show = function (a) {
    if (this.active != a) {
        var b = this.panes[this.active];
        for (var c in b) {
            b[c].hide()
        }
        var b = this.panes[a];
        for (var c in b) {
            b[c].show()
        }
        this.active = a
    }
};
SetupController.prototype.save = function () {
    var a = this.panes[this.active];
    for (var c in a) {
        var b = a[c];
        if (!b.isVisible() || !b.isEnabled()) {
            continue
        }
        var d = b.save(b.info.obj);
        if (d != null) {
            alert(d);
            return false
        }
    }
    return true
};

function LabelHolder(a) {
    this.node = a;
    this.states = [];
    this.lastClass = ""
}

LabelHolder.prototype.add = function (a) {
    this.states.push(a)
};
LabelHolder.prototype.destroy = function (b) {
    for (var a in this.states) {
        if (this.states[a] == b) {
            this.states.splice(a, 1);
            this.changed();
            break
        }
    }
};
LabelHolder.prototype.changed = function () {
    var f = false;
    var b = false;
    var e = 0;
    for (var d in this.states) {
        if (!this.states[d].isEnabled()) {
            ++e
        }
        if (this.states[d].isError()) {
            b = true
        }
        if (f == "" && this.states[d].isChanged()) {
            f = true
        }
    }
    var a = "";
    if (e == this.states.length) {
        a = "disabled"
    } else {
        if (b) {
            a = "error"
        } else {
            if (f) {
                a = "changed"
            }
        }
    }
    if (this.lastClass != a) {
        if (this.lastClass != "") {
            removeClass(this.node, this.lastClass)
        }
        if (a != "") {
            addClass(this.node, a)
        }
        this.lastClass = a
    }
};
LabelHolder.prototype.getNode = function () {
    return this.node
};

function Label(b, a) {
    if (b) {
        a = new LabelHolder(b)
    }
    this.label = a;
    this.changed = false;
    this.error = false;
    this.enabled = true;
    this.label.add(this)
}

Label.prototype.clone = function () {
    return new Label(null, this.label)
};
Label.prototype.destroy = function () {
    this.label.destroy(this)
};
Label.prototype.enable = function (a) {
    if (this.enabled != a) {
        this.enabled = a;
        this.label.changed()
    }
};
Label.prototype.setOriginal = function () {
    this.changed = false;
    this.error = false;
    this.label.changed()
};
Label.prototype.setChanged = function () {
    this.changed = true;
    this.error = false;
    this.label.changed()
};
Label.prototype.setError = function () {
    this.changed = true;
    this.error = true;
    this.label.changed()
};
Label.prototype.setOriginalError = function () {
    this.changed = false;
    this.error = true;
    this.label.changed()
};
Label.prototype.isChanged = function () {
    return this.changed
};
Label.prototype.isError = function () {
    return this.error
};
Label.prototype.isEnabled = function () {
    return this.enabled
};
Label.prototype.getNode = function () {
    return this.label.getNode()
};

function Listeners() {
    this.lstns = []
}

Listeners.prototype.listen = function (a) {
    this.lstns.push(a);
    return this.lstns.length == 1
};
Listeners.prototype.unlisten = function (a) {
    for (var b in this.lstns) {
        if (this.lstns[b] == a) {
            this.lstns.splice(b, 1);
            return this.lstns.length == 0
        }
    }
    return false
};
Listeners.prototype.notify = function (a) {
    for (var b in this.lstns) {
        this.lstns[b](a)
    }
};

function Ticker() {
    Listeners.call(this);
    var a = this;
    setInterval(function () {
        a.notify()
    }, 1000)
}

Ticker.prototype = inherit(Listeners.prototype);
var UndefinedLimit = {};

function View(a, b) {
    this.attrs = a;
    this.ctrl = b;
    this.visible = 1;
    this.limit = UndefinedLimit;
    this.info = {}
}

View.prototype.createRow = function (b, a, d) {
    var c = new Label(new viewLabel(a, this.attrs.name));
    b.addRow(c, null, this)
};
View.prototype.create = function (a, b) {
    this.label = b;
    return this.ctrl
};
View.prototype.realized = function () {
};
View.prototype.getPostfix = function () {
    return this.attrs.postfix
};
View.prototype.load = function (a) {
};
View.prototype.save = function (a) {
    return null
};
View.prototype.isChanged = function () {
    return this.isVisible() && this.label && this.label.isChanged()
};
View.prototype.getView = function (a) {
    if (this.attrs.secondname == a) {
        return this
    }
    return this.attrs.name == a ? this : null
};
View.prototype.getName = function () {
    return this.attrs.name
};
View.prototype.getAttrs = function () {
    return this.attrs
};
View.prototype.enable = function (a) {
};
View.prototype.makeRO = function (a) {
};
View.prototype.setLimit = function (a) {
    this.limit = a
};
View.prototype.findLimit = function (b) {
    if (this.limit == UndefinedLimit) {
        this.limit = null;
        if (ftype(this.attrs).deflimit(this.attrs) != null) {
            var a = ftype(this.attrs).cfg(this.attrs, b).limit;
            if (a) {
                this.limit = ftype(this.attrs).limit(this.attrs, a)
            }
        }
    }
};
View.prototype.isEnabled = function () {
    return !this.label || this.label.isEnabled()
};
View.prototype.show = function () {
    if (++this.visible != 1) {
        return
    }
    if (this.viewCtrl) {
        this.viewCtrl.showView(this, true)
    }
};
View.prototype.hide = function () {
    if (--this.visible != 0) {
        return
    }
    if (this.viewCtrl) {
        this.viewCtrl.showView(this, false)
    }
};
View.prototype.readdTabs = function () {
    if (this.viewCtrl) {
        this.viewCtrl.readdTabs()
    }
};
View.prototype.isVisible = function () {
    return this.visible > 0
};
View.prototype.hasRow = function () {
    return true
};
View.prototype.getTabName = function () {
    return null
};
View.prototype.getVisualClass = function () {
    return null
};
View.prototype.isRO = function () {
    return false
};
View.prototype.attach = function (a, b) {
    this.viewCtrl = a
};
View.prototype.destroy = function () {
};
View.prototype.listen = function (a) {
    if (!this.lstns) {
        this.lstns = new Listeners()
    }
    this.lstns.listen(a)
};
View.prototype.unlisten = function (a) {
    this.lstns.unlisten(a)
};
View.prototype.notify = function () {
    if (this.lstns) {
        this.lstns.notify()
    }
};

function HiddenView(a) {
    View.call(this, a)
}

HiddenView.prototype = inherit(View.prototype);
HiddenView.prototype.createRow = function (b, a) {
};
HiddenView.prototype.load = function (a) {
    this.value = ftype(this.attrs).get(this.attrs, a);
    if (this.value == null) {
        var b = ftype(this.attrs).tostr(this.attrs, null);
        this.value = ftype(this.attrs).fromstr(this.attrs, b)
    }
    this.notify()
};
HiddenView.prototype.getValue = function () {
    return this.value
};
HiddenView.prototype.isVisible = function () {
    return false
};
HiddenView.prototype.hasRow = function () {
    return false
};

function CustomView(b, c, a) {
    View.call(this, b);
    this.cb = a;
    this.onAttach = c;
    this.disabled = false
}

CustomView.prototype = inherit(View.prototype);
CustomView.prototype.attach = function (a, b) {
    if (this.onAttach) {
        this.cb(a, b)
    }
};
CustomView.prototype.createRow = function (b, a, c) {
    if (!this.onAttach) {
        this.cb(b, a, c)
    }
};
CustomView.prototype.isVisible = function () {
    return false
};
CustomView.prototype.getView = function (a) {
    return null
};
CustomView.prototype.hasRow = function () {
    return false
};

function AutoSetView(a, c) {
    View.call(this, a);
    var b = this;
    this.cb = function () {
        if (b.loading) {
            return
        }
        if (!b.view.isVisible()) {
            return
        }
        if (b.attrs.confirm && !confirm(b.attrs.confirm)) {
            b.loading = true;
            b.view.load(b.obj);
            b.loading = false;
            return
        }
        if (b.view.save(b.obj) == null) {
            b.loading = true;
            b.view.load(b.obj);
            b.obj._owner.setObject(b.obj);
            b.loading = false
        }
    };
    this.view = ftype(a.c[0]).view(a.c[0], c);
    this.view.listen(this.cb)
}

AutoSetView.prototype = inherit(View.prototype);
AutoSetView.prototype.createRow = function (b, a, c) {
    this.obj = c;
    this.view.createRow(b, a, this.obj)
};
AutoSetView.prototype.load = function (a) {
    if (this.loading) {
        return
    }
    this.loading = true;
    this.view.load(a);
    this.loading = false
};
AutoSetView.prototype.destroy = function () {
    this.view.unlisten(this.cb);
    this.view.destroy()
};
AutoSetView.prototype.getView = function (a) {
    if (this.attrs.name == a) {
        return this.view
    }
    return this.view.getView(a)
};

function ContextButtonView(a) {
    View.call(this, a);
    this.owned = false;
    if (!a.doset) {
        this.cont = findContainer(a.group, normalize(a.open), a.tab ? normalize(a.tab) : null);
        if (a.link.length == 0) {
            this.path = getPath(this.cont)
        }
    }
}

ContextButtonView.prototype = inherit(View.prototype);
ContextButtonView.prototype.createRow = function (b, a, c) {
    this.obj = c;
    this.cfg = a;
    if (this.attrs.doset) {
        current.hideToolbar()
    } else {
        if (this.cont == null) {
            return
        }
    }
    if (this.owned) {
        return
    }
    this.ctrl = current.addButton(this.attrs.name, a, this.path);
    this.attachHandler(this.ctrl);
    b.createSkinCntrl(this, this.ctrl, this.ctrl.firstChild, true)
};
ContextButtonView.prototype.create = function (c, d) {
    if (this.cont == null && !this.attrs.doset) {
        return null
    }
    var a = createButton(null, this.attrs.name, this.cfg, this.path);
    a.parentNode.style.cssFloat = "right";
    this.attachHandler(a);
    this.ctrl = a.parentNode;
    return this.ctrl
};
ContextButtonView.prototype.owner = function () {
    this.owned = true
};
ContextButtonView.prototype.attachHandler = function (a) {
    if (this.attrs.doset) {
        var d = this;
        a.onclick = function (b) {
            if (d.disabled || isSkinEvent(b)) {
                return true
            }
            if (d.viewCtrl.save()) {
                d.obj._owner.setObject(d.obj);
                d.viewCtrl.load()
            }
        };
        return
    }
    if (this.path && !this.attrs.autostart) {
        return
    }
    var d = this;

    function c(e) {
        if (d.viewCtrl.isChanged()) {
            var b = confirm("There are pending changes, is it OK to apply them?");
            if (b) {
                if (d.viewCtrl.save()) {
                    d.obj._owner.setObject(d.obj)
                }
            }
        }
        openContent(e)
    }

    a.onclick = function (j) {
        if (d.disabled || isSkinEvent(j)) {
            return true
        }
        var b = d.attrs;
        var h = d.obj;
        var m = getContainer(d.cont);
        if (!b.tab) {
            c(m.getPath());
            return
        }
        var l;
        if (b.id) {
            var k = getAttr(h._type, b.id);
            l = m.getObject(ftype(k).get(k, h));
            if (!l) {
                return
            }
        } else {
            l = m.getObject()
        }
        if (!convert(b.link, h, l, d.viewCtrl)) {
            return
        }
        if (b.autostart) {
            if (m.autostart(l)) {
                if (b.autoclose) {
                    var f = h._type;
                    while (f.owner) {
                        f = f.owner
                    }
                    c(getPath(f.service))
                }
                return
            }
        }
        var g = m.getPath(l);
        if (g != null) {
            c(g)
        }
    }
};
ContextButtonView.prototype.enable = function (c) {
    if (this.disabled == !c) {
        return
    }
    var a = this.ctrl.firstChild;
    if (c) {
        removeClass(a, "disabled")
    } else {
        addClass(a, "disabled")
    }
    this.disabled = !c
};
ContextButtonView.prototype.show = function () {
    if (++this.visible != 1) {
        return
    }
    this.ctrl.style.display = "inline"
};
ContextButtonView.prototype.hide = function () {
    if (--this.visible != 0) {
        return
    }
    this.ctrl.style.display = "none"
};
ContextButtonView.prototype.getView = function (a) {
    return null
};
ContextButtonView.prototype.hasRow = function () {
    return false
};

function ToolbarView(a) {
    View.call(this, a);
    this.buttons = []
}

ToolbarView.prototype = inherit(View.prototype);
ToolbarView.prototype.attach = function (b, d) {
    View.prototype.attach.call(this, b, d);
    for (var c in this.attrs.c) {
        var a = b.createView(d, this, this.attrs.c[c], true);
        a.owner(this);
        this.buttons.push(a)
    }
};
ToolbarView.prototype.createRow = function (b, a, c) {
    b.addRow(null, null, this)
};
ToolbarView.prototype.create = function (c, d) {
    this.ctrl = elc(null, "ul", "toolbar");
    for (var e = this.buttons.length - 1; e >= 0; --e) {
        var a = this.buttons[e].create(c, null);
        if (a) {
            this.ctrl.appendChild(a)
        }
    }
    return this.ctrl
};
ToolbarView.prototype.getView = function (a) {
    return null
};
ToolbarView.prototype.hasRow = function () {
    return true
};

function TextView(a, d, c) {
    if (!d) {
        d = input(null)
    }
    if (!c) {
        c = new TextInput(d)
    }
    View.call(this, a, d);
    this.inp = c;
    this.disabled = false;
    var b = this;
    this.inp.onchange = function (e) {
        b.changed(e)
    }
}

TextView.prototype = inherit(View.prototype);
TextView.prototype.create = function (a, b) {
    this.label = b;
    var c = this;
    this.lstn = function () {
        c.update()
    };
    ftype(this.attrs).listen(this.attrs, this.lstn);
    if (this.disabled) {
        this.inp.setEnabled(!this.disabled)
    }
    return this.ctrl
};
TextView.prototype.destroy = function () {
    ftype(this.attrs).unlisten(this.attrs, this.lstn)
};
TextView.prototype.load = function (a) {
    this.findLimit(a);
    this.value = ftype(this.attrs).get(this.attrs, a);
    this.label.setOriginal();
    this.update();
    this.notify()
};
TextView.prototype.save = function (a) {
    var b = ftype(this.attrs).fromstr(this.attrs, trim(this.inp.getValue()), this.limit);
    if (b == null) {
        return "Invalid value in " + this.getName()
    }
    ftype(this.attrs).put(this.attrs, a, b);
    return null
};
TextView.prototype.getValue = function () {
    return ftype(this.attrs).fromstr(this.attrs, trim(this.inp.getValue()))
};
TextView.prototype.enable = function (a) {
    this.label.enable(a);
    this.inp.setEnabled(a && !this.disabled)
};
TextView.prototype.makeRO = function (a) {
    this.disabled = a;
    if (this.inp) {
        this.enable(this.isEnabled())
    }
};
TextView.prototype.setLimit = function (a) {
    this.limit = a;
    if (this.label.isChanged()) {
        this.changed(this.inp.getValue())
    } else {
        if (this.value != null) {
            this.update()
        }
    }
};
TextView.prototype.update = function () {
    if (!this.label.isChanged()) {
        var a = ftype(this.attrs).tostr(this.attrs, this.value);
        if (this.inp.getValue() != a) {
            this.inp.setValue(a)
        }
        this.text = a;
        if (ftype(this.attrs).fromstr(this.attrs, a, this.limit) == null) {
            this.label.setOriginalError()
        } else {
            this.label.setOriginal()
        }
    }
};
TextView.prototype.changed = function (a) {
    if (ftype(this.attrs).fromstr(this.attrs, trim(a), this.limit) != null) {
        this.label.setChanged()
    } else {
        this.label.setError()
    }
    this.notify()
};

function TextAreaView(a) {
    var b = new TextArea();
    TextView.call(this, a, b.getElement(), b)
}

TextAreaView.prototype = inherit(TextView.prototype);

function SecretView(a) {
    TextView.call(this, a, input(null, hidePasswords ? "password" : "text"))
}

SecretView.prototype = inherit(TextView.prototype);
SecretView.prototype.create = function (a, b) {
    var c = this;
    this.onHide = function () {
        var e = c.ctrl.parentNode;
        var d = c.ctrl.nextSibling;
        var f = c.inp.getValue();
        TextView.prototype.destroy.call(c);
        e.removeChild(c.ctrl);
        c.ctrl = input(null, hidePasswords ? "password" : "text");
        c.inp.setElement(c.ctrl);
        TextView.prototype.create.call(c, a, c.label);
        if (d) {
            e.insertBefore(c.ctrl, d)
        } else {
            e.appendChild(c.ctrl)
        }
        c.inp.setValue(f)
    };
    hidePasswordsLstn.listen(this.onHide);
    return TextView.prototype.create.call(this, a, b)
};
SecretView.prototype.destroy = function () {
    hidePasswordsLstn.unlisten(this.onHide);
    return TextView.prototype.destroy.call(this)
};

function ROTextView(a, b) {
    View.call(this, a, elc(null, "span", "rovalue"));
    this.rows = b
}

ROTextView.prototype = inherit(View.prototype);
ROTextView.prototype.create = function (a, b) {
    var c = this;
    this.lstn = function () {
        c.update()
    };
    ftype(this.attrs).listen(this.attrs, this.lstn);
    return View.prototype.create.call(this, a, b)
};
ROTextView.prototype.destroy = function () {
    ftype(this.attrs).unlisten(this.attrs, this.lstn)
};
ROTextView.prototype.getPostfix = function () {
    return null
};
ROTextView.prototype.getValue = function () {
    return this.value
};
ROTextView.prototype.load = function (a) {
    this.value = ftype(this.attrs).get(this.attrs, a);
    this.update();
    this.notify()
};
ROTextView.prototype.save = function (a) {
    return null
};
ROTextView.prototype.isChanged = function () {
    return false
};
ROTextView.prototype.enable = function (a) {
};
ROTextView.prototype.update = function () {
    var c = ftype(this.attrs).tostr(this.attrs, this.value);
    if (c != "" && this.attrs.postfix) {
        c += " " + this.attrs.postfix
    }
    if (c == "") {
        c = "\u00a0"
    }
    if (this.rows == null) {
        replaceText(this.ctrl, c)
    } else {
        var a = c.split("\n");
        if (a.length <= 1) {
            replaceText(this.ctrl, c)
        } else {
            clearNodes(this.ctrl);
            for (var b in a) {
                el(this.ctrl, "div", a[b])
            }
        }
    }
};
ROTextView.prototype.isRO = function () {
    return true
};

function ROPreTextView(a) {
    ROTextView.call(this, a, 1);
    this.ctrl.className = "roprevalue"
}

ROPreTextView.prototype = inherit(ROTextView.prototype);

function ROOptTextView(a) {
    ROTextView.call(this, a)
}

ROOptTextView.prototype = inherit(ROTextView.prototype);
ROOptTextView.prototype.update = function () {
    if (this.value && ftype(this.attrs).hasValue(this.attrs, this.value)) {
        var a = ftype(this.attrs).tostr(this.attrs, this.value);
        if (a != "" && this.attrs.postfix) {
            a += " " + this.attrs.postfix
        }
        replaceText(this.ctrl, a)
    } else {
        replaceText(this.ctrl, "\u00a0")
    }
};

function OptView(b, a) {
    View.call(this, b);
    if (!a) {
        a = new TextView(b)
    }
    this.view = a;
    this.opt = true
}

OptView.prototype = inherit(View.prototype);
OptView.prototype.createRow = function (b, a, e) {
    var c = new Label(viewLabel(a, this.attrs.name));
    this.bttn = imgbtn(null);
    var d = this;
    this.bttn.onclick = function () {
        if (d.label.isEnabled()) {
            d.showCurtain(!d.opt, true)
        }
    };
    b.addRow(c, this.bttn, this)
};
OptView.prototype.create = function (a, b) {
    this.label = b;
    var d = el(null, "div");
    d.style.position = "relative";
    d.style.left = "0";
    d.style.top = "0";
    this.inp = this.view.create(a, b);
    d.appendChild(this.inp);
    if (this.attrs.postfix) {
        txt(d, this.attrs.postfix)
    } else {
        if (this.attrs.c && this.attrs.c[0].postfix) {
            txt(d, this.attrs.c[0].postfix)
        }
    }
    this.curtain = el(d, "div");
    this.curtain.className = "curtain";
    this.curtain.style.zIndex = "2";
    this.ctrl = d;
    return d
};
OptView.prototype.realized = function () {
    this.view.realized()
};
OptView.prototype.getPostfix = function () {
    return null
};
OptView.prototype.getView = function (a) {
    if (this.attrs.name == a) {
        return this
    }
    return this.view.getView(a)
};
OptView.prototype.load = function (c) {
    var b = ftype(this.attrs);
    var d = b.get(this.attrs, c);
    if (this.limit == undefined) {
        this.limit = null;
        if (b.deflimit(this.attrs) != null) {
            var a = ftype(this.attrs).cfg(this.attrs, c).limit;
            if (a) {
                this.limit = b.limit(this.attrs, a)
            }
        }
    }
    if (d != null && b.hasValue(this.attrs, d)) {
        this.view.load(c);
        this.showCurtain(false, false)
    } else {
        this.view.load({_type: c._type});
        this.showCurtain(true, false)
    }
    this.label.setOriginal()
};
OptView.prototype.save = function (a) {
    if (this.attrs.type == "opt") {
        ftype(this.attrs).put(this.attrs, a, this.opt ? null : types.opt.VALUE)
    } else {
        if (this.opt) {
            ftype(this.attrs).put(this.attrs, a, null)
        }
    }
    if (!this.opt) {
        return this.view.save(a)
    }
    return null
};
OptView.prototype.getValue = function () {
    if (this.attrs.type == "opt") {
        return !this.opt
    }
    return this.view.getValue()
};
OptView.prototype.show = function () {
    this.view.show();
    View.prototype.show.call(this)
};
OptView.prototype.hide = function () {
    this.view.hide();
    View.prototype.hide.call(this)
};
OptView.prototype.enable = function (a) {
    this.view.enable(a);
    this.label.enable(a);
    this.bttn.firstChild.src = this.getButtonImg();
    this.bttn.className = a ? "sbtn" : "sbtn_disabled"
};
OptView.prototype.makeRO = function (a) {
    this.disabled = a;
    this.view.makeRO(a);
    this.enable(this.isEnabled())
};
OptView.prototype.setLimit = function (a) {
    this.limit = a;
    if (!this.opt) {
        this.view.setLimit(a)
    }
};
OptView.prototype.isChanged = function () {
    if (!this.opt && this.view.isChanged()) {
        return true
    }
    return View.prototype.isChanged.call(this)
};
OptView.prototype.showCurtain = function (b, a) {
    if (b) {
        this.curtain.style.visibility = "visible";
        if (this.curtain.parentNode.offsetHeight) {
            this.curtain.style.height = this.curtain.parentNode.offsetHeight + "px"
        }
        this.view.setLimit(null)
    } else {
        this.curtain.style.visibility = "hidden";
        if (a) {
            this.inp.focus()
        }
        this.view.setLimit(this.limit)
    }
    this.opt = b;
    this.bttn.firstChild.src = this.getButtonImg();
    this.label.setChanged();
    this.notify()
};
OptView.prototype.getButtonImg = function () {
    if (this.label.isEnabled() && !this.disabled) {
        return this.opt ? "down.png" : "up.png"
    }
    return this.opt ? "down-gray.png" : "up-gray.png"
};
OptView.prototype.destroy = function () {
    this.view.destroy()
};

function getOptionIndex(b, c) {
    for (var a = 0; a < b.options.length; ++a) {
        if (b.options[a].value == c) {
            return a
        }
    }
    return -1
}

function binarySearch(c, h, e) {
    var b = c.length;
    var g = 0;
    while (b > 0) {
        var f = b >> 1;
        var d = g + f;
        if (e(c[d], h)) {
            g = d + 1;
            b = b - f - 1
        } else {
            b = f
        }
    }
    return g
}

function fillOptions(a, m, h, g, l, d, e) {
    var k = enm[m.type];
    var c = function (s) {
        var p = el(null, "option");
        p.value = s;
        p.text = k.toString(s, m, g);
        var o = k.getColor(m, s);
        if (o != null) {
            p.style.color = o
        }
        var n = a.options.length;
        if (h) {
            n = binarySearch(a.options, p, function (u, t) {
                return u.text < t.text
            })
        }
        try {
            var q = n < a.options.length ? a.options[n] : null;
            a.add(p, q)
        } catch (r) {
            a.add(p, n)
        }
        return n
    };
    var j = function (o) {
        var q = o.ufe0001;
        var n = getOptionIndex(a, q);
        if (o.ufe0013) {
            if (n != -1) {
                a.removeChild(a.options[n])
            }
        } else {
            if (n != -1) {
                var p = k.toString(q, m, o);
                if (d && !d(p)) {
                    a.removeChild(a.options[n])
                } else {
                    a.options[n].text = p
                }
            } else {
                if (d) {
                    if (!d(k.toString(q, m, o))) {
                        return
                    }
                }
                var n = c(q);
                if (e) {
                    e(q, n)
                }
            }
        }
    };
    k.listen(m, j, l);
    var b = k.getMap(m, g);
    for (var f in b) {
        if (b[f] != "" && (!d || d(b[f]))) {
            c(f)
        }
    }
    return j
}

function refillOptions(f, a, e) {
    var c = enm[a.type];
    var d = c.getMap(a, e);
    for (var b in d) {
        if (d[b] != "") {
            f({ufe0001: b})
        }
    }
}

function RadioView(a) {
    View.call(this, a);
    this.id = "radio" + (++RadioView.prototype.count)
}

RadioView.prototype = inherit(View.prototype);
RadioView.prototype.count = 0;
RadioView.prototype.create = function (a, b) {
    this.label = b;
    this.ctrl = el(null, "span");
    return this.ctrl
};
RadioView.prototype.load = function (b) {
    this.findLimit(b);
    if (this.radios == null) {
        this.addButtons()
    }
    var a = this.value;
    this.value = ftype(this.attrs).get(this.attrs, b);
    if (this.value == null) {
        this.value = this.attrs.def || 0
    }
    if (!this.radios[this.value]) {
        this.value = getfirst(this.radios)
    }
    if (this.value != null) {
        this.radios[this.value].checked = 1;
        this.label.setOriginal()
    }
    if (a != this.value) {
        this.notify()
    }
};
RadioView.prototype.save = function (a) {
    ftype(this.attrs).put(this.attrs, a, this.getValue())
};
RadioView.prototype.enable = function (a) {
    this.label.enable(a);
    var c = !a || this.disabled;
    for (var b in this.radios) {
        this.radios.disabled = c
    }
};
RadioView.prototype.makeRO = function (a) {
    this.disabled = a;
    if (this.ctrl) {
        this.enable(this.isEnabled())
    }
};
RadioView.prototype.setLimit = function (a) {
    this.limit = a;
    clearNodes(this.ctrl);
    this.addButtons();
    if (this.radios[this.value]) {
        this.radios[this.value].checked = 1
    }
};
RadioView.prototype.getValue = function () {
    return this.value
};
RadioView.prototype.updateValue = function () {
    for (var a in this.radios) {
        if (this.radios[a].checked) {
            this.value = parseInt(a);
            break
        }
    }
};
RadioView.prototype.addButtons = function () {
    var a = this.attrs.values;
    this.radios = {};
    var c = enm[a.type].getMap(a, null);
    for (var b in c) {
        if (c[b] == "") {
            continue
        }
        this.addButton(b, c[b])
    }
};
RadioView.prototype.addButton = function (f, a) {
    if (this.limit && this.limit.prefixes && !(hasOneOfPrefixes(this.limit.prefixes, a) ^ this.limit.invert)) {
        return
    }
    var d = elc(this.ctrl, "span", "radio");
    var b = input(null, "radio");
    d.appendChild(b);
    b.name = this.id;
    txt(d, a);
    var c = this;
    b.onchange = function () {
        c.label.setChanged();
        c.updateValue();
        c.notify()
    };
    d.onclick = function () {
        b.checked = 1;
        c.label.setChanged();
        c.updateValue();
        c.notify()
    };
    this.radios[f] = b
};

function EnumView(a) {
    View.call(this, a);
    this.disabled = false
}

EnumView.prototype = inherit(View.prototype);
EnumView.prototype.createRow = function (d, a, g) {
    function j(c, m) {
        for (var k in c) {
            if (--m < 0) {
                return false
            }
        }
        return true
    }

    if (this.attrs.selector) {
        var b = this.attrs.values;
        var e = new Label(new viewLabel(a, this.attrs.name));
        var h = null;
        var f = enm[b.type].getMap(b, g);
        if (j(f, 1)) {
            h = txt(null, enm[b.type].toString(getfirst(f), b, g))
        } else {
            h = this.create(d, e)
        }
        current.setCustomTitle(h, this.attrs.postfix || "")
    } else {
        View.prototype.createRow.call(this, d, a, g)
    }
};
EnumView.prototype.create = function (a, b) {
    this.label = b;
    this.viewCtrl = a;
    this.ctrl = el(elc(null, "span", "select"), "select");
    this.ctrl.size = 1;
    var c = this;
    this.ctrl.onchange = function (d) {
        c.value = null;
        c.autoSelected = false;
        c.label.setChanged();
        c.notify()
    };
    if (this.disabled) {
        this.ctrl.disabled = true
    }
    return this.ctrl.parentNode
};
EnumView.prototype.load = function (e) {
    this.findLimit(e);
    if (this.ctrl && !this.lstn) {
        var d = this;
        var c = function (f) {
            if (!d.limit || !d.limit.prefixes) {
                return true
            }
            return !!(hasOneOfPrefixes(d.limit.prefixes, f) ^ d.limit.invert)
        };
        this.obj = e;
        this.lstn = fillOptions(this.ctrl, this.attrs.values, !this.attrs.sortbyvalue, e, this.viewCtrl, c, function (g, f) {
            if (d.value == g) {
                d.ctrl.selectedIndex = f;
                d.notify()
            } else {
                if (d.value != null && !d.autoSelected) {
                    d.autoSelected = true;
                    d.ctrl.selectedIndex = f;
                    d.notify()
                }
            }
        })
    }
    var b = this.value;
    this.value = ftype(this.attrs).get(this.attrs, e);
    if (this.value == null) {
        this.value = this.attrs.def || 0
    }
    if (this.ctrl) {
        var a = getOptionIndex(this.ctrl, this.value);
        if (this.ctrl.selectedIndex != a && a != -1) {
            this.ctrl.selectedIndex = a;
            b = this.value;
            this.notify()
        }
        if (a != -1) {
            this.label.setOriginal();
            this.autoSelected = false
        } else {
            if (this.ctrl.options.length > 0) {
                this.autoSelected = true;
                this.ctrl.selectedIndex = 0;
                b = this.value;
                this.notify()
            }
        }
    }
    if (b != this.value) {
        this.notify()
    }
};
EnumView.prototype.save = function (b) {
    if (!this.ctrl) {
        return null
    }
    var a = this.ctrl.selectedIndex;
    if (a != -1) {
        ftype(this.attrs).put(this.attrs, b, parseInt(this.ctrl.options[a].value));
        return null
    }
    return "Invalid value in " + this.getName()
};
EnumView.prototype.enable = function (a) {
    if (this.ctrl) {
        this.label.enable(a);
        this.ctrl.disabled = !a || this.disabled
    }
};
EnumView.prototype.makeRO = function (a) {
    if (this.ctrl) {
        this.disabled = a;
        if (this.ctrl) {
            this.enable(this.isEnabled())
        }
    }
};
EnumView.prototype.setLimit = function (a) {
    this.limit = a;
    if (this.lstn) {
        refillOptions(this.lstn, this.attrs.values, this.obj)
    }
};
EnumView.prototype.getValue = function () {
    if (!this.ctrl) {
        return this.value
    }
    var a = this.ctrl.selectedIndex;
    if (a == -1) {
        return 0
    }
    return parseInt(this.ctrl.options[a].value)
};
EnumView.prototype.destroy = function () {
    if (this.lstn) {
        enm[this.attrs.values.type].unlisten(this.attrs.values, this.lstn)
    }
};

function ComboView(a) {
    var b = elc(null, "span", "cbox");
    this.slc = el(b, "select");
    this.slc.size = 1;
    this.slc.tabindex = 0;
    this.fld = input(b);
    TextView.call(this, a, b, new TextInput(this.fld))
}

ComboView.prototype = inherit(TextView.prototype);
ComboView.prototype.isFirefox = navigator.userAgent.search("Firefox") != -1;
ComboView.prototype.realized = function () {
    var a = this.isFirefox ? 3 : 0;
    this.fld.style.width = (this.slc.offsetWidth - this.slc.offsetHeight - 2) + a + "px";
    this.fld.style.height = (this.slc.offsetHeight - 4) + "px"
};
ComboView.prototype.create = function (a, b) {
    this.label = b;
    this.viewCtrl = a;
    var c = this;
    this.slc.onchange = function (f) {
        var d = c.attrs.values;
        var g = enm[d.type].toString(c.slc.value, d);
        c.inp.setValue(g);
        c.changed(g);
        c.fld.focus()
    };
    this.slc.onfocus = function (d) {
        c.slc.selectedIndex = -1;
        if (!c.blocked) {
            c.fld.focus()
        }
    };
    this.slc.onmousedown = function (d) {
        document.onmouseup = function () {
            document.onmouseup = null;
            c.blocked = false;
            return false
        };
        c.blocked = true;
        return true
    };
    this.slc.onmouseup = function (d) {
        document.onmouseup = null;
        c.blocked = false;
        return false
    };
    if (this.disabled) {
        this.enable(false)
    }
    return this.ctrl
};
ComboView.prototype.load = function (d) {
    if (!this.lstn) {
        this.obj = d;
        var c = this;
        var b = function (e) {
            if (!c.limit) {
                return true
            }
            return ftype(c.attrs).fromstr(c.attrs, e, c.limit) != null
        };
        var a = function (f, e) {
            c.update()
        };
        this.lstn = fillOptions(this.slc, this.attrs.values, !this.attrs.sortbyvalue, d, this.viewCtrl, b, a)
    }
    this.slc.selectedIndex = -1;
    TextView.prototype.load.call(this, d)
};
ComboView.prototype.enable = function (a) {
    TextView.prototype.enable.call(this, a);
    this.slc.disabled = !a
};
ComboView.prototype.destroy = function () {
    if (this.lstn) {
        enm[this.attrs.values.type].unlisten(this.attrs.values, this.lstn)
    }
};
ComboView.prototype.setLimit = function (a) {
    TextView.prototype.setLimit.call(this, a);
    if (this.lstn) {
        refillOptions(this.lstn, this.attrs.values, this.obj)
    }
};
ComboView.prototype.changed = function (a) {
    TextView.prototype.changed.call(this, a);
    this.slc.selectedIndex = -1
};

function SetView(a, b) {
    View.call(this, a);
    this.boxes = {};
    this.items = 0;
    this.disabled = b
}

SetView.prototype = inherit(View.prototype);
SetView.prototype.create = function (a, b) {
    this.label = b;
    this.viewCtrl = a;
    this.ctrl = elc(null, "table", "checkbox");
    return this.ctrl
};
SetView.prototype.getValue = function () {
    var b = 0;
    for (var a in this.boxes) {
        if (this.boxes[a].checked) {
            b |= 1 << parseInt(a)
        }
    }
    return b
};
SetView.prototype.load = function (f) {
    this.findLimit(f);
    this.obj = f;
    if (!this.lstn) {
        var a = this.attrs.values;
        var c = enm[a.type];
        var d = this;
        this.lstn = function (g) {
            var h = g.ufe0001;
            if (!d.boxes[h]) {
                d.addItem(h, g)
            }
        };
        c.listen(a, this.lstn, this.viewCtrl);
        var e = c.getMap(a, f);
        for (var b in e) {
            if (e[b] != "") {
                this.addItem(b, f)
            }
        }
    }
    this.value = ftype(this.attrs).get(this.attrs, f);
    if (this.value == null && this.attrs.def) {
        this.value = [this.attrs.def]
    }
    if (this.value) {
        for (var b in this.boxes) {
            this.boxes[b].checked = (this.value[0] & (1 << parseInt(b))) != 0
        }
    }
    this.label.setOriginal();
    this.notify()
};
SetView.prototype.save = function (c) {
    var d = 0;
    var b = 0;
    for (var a in this.boxes) {
        if (this.boxes[a].checked) {
            d |= 1 << parseInt(a)
        } else {
            b |= 1 << parseInt(a)
        }
    }
    ftype(this.attrs).put(this.attrs, c, [d, b]);
    return null
};
SetView.prototype.enable = function (a) {
    for (var b in this.boxes) {
        this.boxes[b].disabled = !a || this.disabled
    }
    this.label.enable(a)
};
SetView.prototype.makeRO = function (a) {
    this.disabled = a;
    this.enable(this.isEnabled())
};
SetView.prototype.setLimit = function (a) {
    this.limit = a;
    if (this.value) {
        for (var c in this.boxes) {
            if (this.boxes[c].checked) {
                this.value[0] |= 1 << parseInt(c)
            } else {
                this.value[0] &= ~(1 << parseInt(c))
            }
        }
    }
    this.items = 0;
    clearNodes(this.ctrl);
    var b = this.attrs.values;
    var d = enm[b.type].getMap(b, this.obj);
    for (var c in d) {
        if (d[c] != "") {
            this.addItem(c, this.obj)
        }
    }
};
SetView.prototype.destroy = function () {
    if (this.lstn) {
        enm[this.attrs.values.type].unlisten(this.attrs.values, this.lstn)
    }
};
SetView.prototype.addItem = function (a, b) {
    var j = this.attrs.values;
    var g = enm[j.type];
    var e = g.toString(a, j, b);
    if (this.limit && this.limit.prefixes && !(hasOneOfPrefixes(this.limit.prefixes, e) ^ this.limit.invert)) {
        return
    }
    var h = this.ctrl;
    if (!this.attrs.small) {
        if (this.items % (this.attrs.columns || 2) == 0) {
            this.lastRow = el(el(this.ctrl, "tbody"), "tr")
        }
    } else {
        if (!this.lastRow) {
            this.lastRow = el(el(this.ctrl, "tbody"), "tr")
        }
    }
    h = el(this.lastRow, "td");
    var c = el(null, "input");
    c.type = "checkbox";
    h.appendChild(c);
    var f = el(h, "span", e + " ");
    c.checked = this.value && ((this.value[0] & (1 << a)) != 0);
    if (this.disabled) {
        c.disabled = true
    }
    var d = this;
    c.onchange = function () {
        d.label.setChanged();
        d.notify()
    };
    f.onclick = function () {
        c.checked = !c.checked;
        d.label.setChanged();
        d.notify()
    };
    this.boxes[a] = c;
    ++this.items
};

function BoolView(a, b) {
    View.call(this, a);
    this.ro = b;
    this.disabled = false
}

BoolView.prototype = inherit(View.prototype);
BoolView.prototype.create = function (b, c) {
    this.label = c;
    if (!this.ctrl) {
        this.ctrl = elc(null, "span", "checkbox");
        this.ctrl.className = "checkbox";
        this.chk = el(null, "input");
        this.chk.type = "checkbox";
        this.ctrl.appendChild(this.chk);
        var d = this;
        this.chk.onchange = function () {
            d.label.setChanged();
            d.notify()
        };
        if (this.ro || this.disabled) {
            this.chk.disabled = true
        }
    }
    if (!this.label) {
        var a = el(null, "span", this.attrs.name);
        this.ctrl.appendChild(a);
        this.label = new Label(a)
    }
    if (!skinMode) {
        var e = this.label.getNode();
        var d = this;
        e.onclick = function () {
            if (!d.chk.disabled) {
                d.chk.checked = !d.chk.checked;
                d.label.setChanged();
                d.notify()
            }
        }
    }
    return this.ctrl
};
BoolView.prototype.load = function (a) {
    var b = ftype(this.attrs).get(this.attrs, a);
    if (b == null) {
        b = this.attrs.def
    }
    this.setValue(!!b);
    this.label.setOriginal();
    this.notify()
};
BoolView.prototype.save = function (a) {
    ftype(this.attrs).put(this.attrs, a, this.chk.checked ? 1 : 0);
    return null
};
BoolView.prototype.enable = function (a) {
    this.chk.disabled = !a || this.disabled || this.ro;
    this.label.enable(a)
};
BoolView.prototype.makeRO = function (a) {
    this.disabled = a;
    if (this.chk) {
        this.enable(this.isEnabled())
    }
};
BoolView.prototype.isRO = function () {
    return this.ro
};
BoolView.prototype.getValue = function () {
    return this.chk.checked ? 1 : 0
};
BoolView.prototype.setValue = function (a) {
    this.chk.checked = a
};

function NotView(b, c, a) {
    BoolView.call(this, b, c);
    this.view = a
}

NotView.prototype = inherit(BoolView.prototype);
NotView.prototype.create = function (a, b) {
    this.ctrl = elc(null, "span");
    this.chk = elc(this.ctrl, "a", "not");
    el(this.chk, "img");
    this.setValue(false);
    var c = this;
    this.chk.onclick = function (d) {
        if (c.chk.className == "not") {
            c.setValue(!c.value);
            c.label.setChanged();
            c.notify()
        }
    };
    if (this.ro || this.disabled) {
        this.chk.className = "not_disabled"
    }
    BoolView.prototype.create.call(this, a, b);
    this.ctrl.appendChild(this.view.create(a, b));
    return this.ctrl
};
NotView.prototype.realized = function () {
    this.view.realized()
};
NotView.prototype.getView = function (a) {
    if (this.attrs.name == a) {
        return this
    }
    return this.view.getView(a)
};
NotView.prototype.load = function (a) {
    var b = ftype(this.attrs).get(this.attrs, a);
    this.setValue(b ? b[0] : 0);
    this.label.setOriginal();
    this.view.load(a);
    this.notify()
};
NotView.prototype.save = function (a) {
    ftype(this.attrs).put(this.attrs, a, this.value ? 1 : 0);
    this.view.save(a);
    return null
};
NotView.prototype.enable = function (a) {
    this.view.enable(a);
    var b = !a || this.disabled || this.ro;
    this.chk.className = b ? "not_disabled" : "not";
    this.label.enable(a)
};
NotView.prototype.makeRO = function (a) {
    this.view.makeRO(a);
    BoolView.prototype.makeRO.call(this, a)
};
NotView.prototype.setLimit = function (a) {
    this.view.setLimit(a)
};
NotView.prototype.show = function () {
    this.view.show();
    BoolView.prototype.show.call(this)
};
NotView.prototype.hide = function () {
    this.view.hide();
    BoolView.prototype.hide.call(this)
};
NotView.prototype.destroy = function () {
    this.view.destroy()
};
NotView.prototype.getValue = function () {
    return this.value
};
NotView.prototype.setValue = function (a) {
    this.value = a;
    this.chk.firstChild.src = a ? "not-checked.png" : "not.png"
};

function MultiView(b, c, a) {
    View.call(this, b, el(null, "div"));
    this.ro = c;
    this.createView = a;
    this.values = [];
    this.rows = [];
    this.zeroRow = null
}

MultiView.prototype = inherit(View.prototype);
MultiView.prototype.createRow = function (b, a, d) {
    if (this.ro) {
        return View.prototype.createRow.call(this, b, a, d)
    }
    var c = new Label(new viewLabel(a, this.attrs.name));
    b.addRow(c, -1, this)
};
MultiView.prototype.create = function (a, b) {
    this.label = b;
    this.viewCtrl = a;
    return this.ctrl
};
MultiView.prototype.load = function (c) {
    this.findLimit(c);
    var b = ftype(this.attrs).get(this.attrs, c);
    if (b == null) {
        b = []
    }
    while (this.rows.length > b.length) {
        this.removeRow(this.rows[0])
    }
    for (var a in this.rows) {
        this.rows[a].view.load(b[a])
    }
    while (this.rows.length < b.length) {
        this.addRow(null, b[this.rows.length])
    }
    if (this.rows.length == 0) {
        this.addZeroRow()
    } else {
        this.removeZeroRow()
    }
    this.label.setOriginal()
};
MultiView.prototype.save = function (b) {
    for (var a in this.rows) {
        if (this.rows[a].view.save(this.values[a]) != null) {
            return "Invalid value in " + this.getName()
        }
    }
    ftype(this.attrs).put(this.attrs, b, this.values);
    return null
};
MultiView.prototype.isChanged = function () {
    if (this.label.isChanged()) {
        return true
    }
    for (var a in this.rows) {
        if (this.rows[a].view.isChanged()) {
            return true
        }
    }
    return false
};
MultiView.prototype.enable = function (a) {
    this.label.enable(a);
    var c = this.disabled || !a;
    var e = !c && this.rows.length < (this.attrs.max || 30);
    for (var b in this.rows) {
        var d = this.rows[b];
        d.view.enable(a);
        d.view.makeRO(this.disabled);
        if (d.addBtn) {
            d.addBtn.firstChild.src = e ? "down.png" : "down-gray.png";
            d.addBtn.className = e ? "sbtn" : "sbtn_disabled"
        }
        if (d.removeBtn) {
            d.removeBtn.firstChild.src = !c ? "up.png" : "up-gray.png";
            d.removeBtn.className = !c ? "sbtn" : "sbtn_disabled"
        }
    }
    if (this.zeroRow) {
        this.zeroAddBtn.firstChild.src = !c ? "down.png" : "down-gray.png";
        this.zeroAddBtn.className = !c ? "sbtn" : "sbtn_disabled"
    }
};
MultiView.prototype.makeRO = function (a) {
    this.disabled = a;
    this.enable(this.isEnabled())
};
MultiView.prototype.setLimit = function (a) {
    this.limit = a;
    for (var b in this.rows) {
        this.rows[b].view.setLimit(a)
    }
};
MultiView.prototype.show = function () {
    for (var a in this.rows) {
        this.rows[a].view.show()
    }
    View.prototype.show.call(this)
};
MultiView.prototype.hide = function () {
    for (var a in this.rows) {
        this.rows[a].view.hide()
    }
    View.prototype.hide.call(this)
};
MultiView.prototype.addRow = function (d, c) {
    if (this.rows.length >= (this.attrs.max || 30)) {
        return
    }
    var b = this;
    var e = {};
    e.node = el(null, "div");
    e.label = this.label.clone();
    e.view = this.createView();
    e.node.appendChild(e.view.create(this.viewCtrl, e.label));
    e.view.setLimit(this.limit);
    if (this.attrs.c[0].postfix) {
        txt(e.node, this.attrs.c[0].postfix)
    }
    e.view.load(c);
    if (!this.ro) {
        e.addBtn = imgbtn(null, "down.png");
        e.addBtn.onclick = function () {
            if (b.label.isEnabled()) {
                var f = b.findRow(e);
                b.addRow(f + 1 < b.rows.length ? b.rows[f + 1] : null, {})
            }
        };
        e.node.insertBefore(e.addBtn, e.node.firstChild);
        e.removeBtn = imgbtn(e.node, "up.png");
        e.removeBtn.style.marginLeft = "0";
        e.removeBtn.onclick = function () {
            if (b.label.isEnabled()) {
                b.removeRow(e)
            }
        }
    }
    if (d) {
        this.ctrl.insertBefore(e.node, d.node)
    } else {
        this.ctrl.appendChild(e.node)
    }
    e.view.realized();
    var a = d ? this.findRow(d) : this.rows.length;
    this.values.splice(a, 0, c);
    this.rows.splice(a, 0, e);
    this.label.setChanged();
    this.enable(this.label.isEnabled())
};
MultiView.prototype.removeRow = function (b) {
    var a = this.findRow(b);
    b.label.destroy();
    b.view.destroy();
    this.ctrl.removeChild(b.node);
    this.values.splice(a, 1);
    this.rows.splice(a, 1);
    if (this.rows.length == 0) {
        this.addZeroRow()
    }
    this.label.setChanged();
    this.enable(this.label.isEnabled())
};
MultiView.prototype.findRow = function (b) {
    for (var a in this.rows) {
        if (this.rows[a] == b) {
            return parseInt(a)
        }
    }
    return null
};
MultiView.prototype.addZeroRow = function () {
    if (this.zeroRow || this.ro) {
        return
    }
    var a = this;
    this.zeroRow = el(this.ctrl, "div");
    this.zeroAddBtn = imgbtn(this.zeroRow, "down.png");
    this.zeroAddBtn.onclick = function () {
        if (a.label.isEnabled()) {
            a.removeZeroRow();
            a.addRow(0, {})
        }
    }
};
MultiView.prototype.removeZeroRow = function () {
    if (this.zeroRow) {
        this.ctrl.removeChild(this.zeroRow);
        this.zeroRow = null
    }
};

function TupleView(a) {
    View.call(this, a);
    this.views = []
}

TupleView.prototype = inherit(View.prototype);
TupleView.prototype.createRow = function (e, d, g) {
    for (var f in this.attrs.c) {
        var c = this.attrs.c[f];
        var b = e.newView(g, c, false, this.ro || c.ro);
        if (b) {
            b.attach(e, g);
            this.views.push(b)
        }
    }
    if (this.views.length == 0) {
        return
    }
    this.label = null;
    if (this.attrs.name) {
        this.label = new Label(new viewLabel(d, this.attrs.name))
    }
    e.addRow(this.label, null, this.views, this.attrs.sep ? "\u00A0" : "/")
};
TupleView.prototype.create = function (d, e) {
    this.label = e;
    var g = el(null, "span");
    var h = true;
    for (var f in this.attrs.c) {
        var c = this.attrs.c[f];
        if (!h) {
            txt(g, this.attrs.sep ? "\u00A0" : "/")
        }
        var b = d.newView(null, c, false, this.ro || c.ro);
        if (b) {
            b.attach(d, null);
            g.appendChild(b.create(d, e ? e.clone() : null));
            var j = b.getPostfix();
            if (j) {
                txt(g, j)
            }
            this.views.push(b);
            h = false
        }
    }
    this.ctrl = g;
    return this.ctrl
};
TupleView.prototype.getView = function (b) {
    for (var c in this.views) {
        var a = this.views[c].getView(b);
        if (a) {
            return a
        }
    }
    return null
};
TupleView.prototype.realized = function () {
    for (var a in this.views) {
        this.views[a].realized()
    }
};
TupleView.prototype.load = function (b) {
    for (var a in this.views) {
        this.views[a].load(b)
    }
};
TupleView.prototype.save = function (c) {
    for (var a in this.views) {
        var b = this.views[a].save(c);
        if (b != null) {
            return b
        }
    }
    return null
};
TupleView.prototype.isChanged = function (b) {
    for (var a in this.views) {
        if (this.views[a].isChanged()) {
            return true
        }
    }
    return false
};
TupleView.prototype.enable = function (a) {
    for (var b in this.views) {
        this.views[b].enable(a)
    }
    this.label.enable(a)
};
TupleView.prototype.makeRO = function (b) {
    for (var a in this.views) {
        this.views[a].makeRO(b)
    }
};
TupleView.prototype.setLimit = function (a) {
    var b = [];
    if (a && a.limits) {
        b = a.limits
    }
    for (var c in this.views) {
        this.views[c].setLimit(b[c])
    }
};
TupleView.prototype.show = function () {
    for (var a in this.views) {
        this.views[a].show()
    }
    View.prototype.show.call(this)
};
TupleView.prototype.hide = function () {
    for (var a in this.views) {
        this.views[a].hide()
    }
    View.prototype.hide.call(this)
};
TupleView.prototype.destroy = function () {
    for (var a in this.views) {
        this.views[a].destroy()
    }
};

function StatusView(a) {
    View.call(this, a);
    this.obj = {};
    this.obj._type = a;
    a.ro = 1
}

StatusView.prototype = inherit(View.prototype);
StatusView.prototype.attach = function (a, b) {
    this.viewCtrl = a;
    this.attrs.owner = b._type;
    a.addAllViews(this.obj)
};
StatusView.prototype.load = function (a) {
    this.id = a.ufe0001;
    if (this.id != null || a._type.type == "item") {
        this.fetch(a._type.path)
    }
};
StatusView.prototype.destroy = function () {
    if (this.timer != null) {
        clearTimeout(this.timer)
    }
    this.dead = true
};
StatusView.prototype.fetch = function (c) {
    if (this.onreply) {
        return
    }
    var b = {};
    b.Uff0001 = this.attrs.path || c;
    b.uff0007 = this.attrs.cmd || 16646160;
    b.ufe0001 = this.id;
    var a = this;
    this.onreply = function (d) {
        if (a.dead) {
            return
        }
        if (d.ufe0003) {
            b.ufe0003 = d.ufe0003;
            post(b, a.onreply)
        } else {
            if (a.timer == null) {
                a.timer = setTimeout(function () {
                    a.onreply = null;
                    a.timer = null;
                    a.fetch(c)
                }, a.attrs.autorefresh || 2000)
            }
        }
        update(a.obj, d);
        a.viewCtrl.update()
    };
    post(b, this.onreply)
};
StatusView.prototype.hasRow = function () {
    return false
};

function GroupView(a, b) {
    TupleView.call(this, a);
    this.ro = b;
    this.open = true;
    this.changed = false
}

GroupView.prototype = inherit(TupleView.prototype);
GroupView.prototype.attach = function (b, d) {
    for (var c in this.attrs.c) {
        var a = b.createView(d, this, this.attrs.c[c], this.ro);
        if (a) {
            this.views.push(a)
        }
    }
};
GroupView.prototype.createRow = function (b, a, d) {
    this.bttn = imgbtn();
    this.bttn.firstChild.src = "up.png";
    var c = this;
    this.bttn.onclick = function () {
        c.showGroup(!c.open);
        c.changed = true
    };
    this.label = new Label(viewLabel(a, this.attrs.name));
    b.addRow(this.label, this.bttn, this)
};
GroupView.prototype.create = function (a, b) {
    return el(null, "span")
};
GroupView.prototype.load = function (a) {
    TupleView.prototype.load.call(this, a);
    this.showGroup(ftype(this.attrs).get(this.attrs, a));
    this.changed = false
};
GroupView.prototype.save = function (b) {
    ftype(this.attrs).put(this.attrs, b, this.open ? 1 : 0);
    if (!this.open) {
        for (var a in this.views) {
            this.views[a].load({_type: b._type})
        }
    }
    return TupleView.prototype.save.call(this, b)
};
GroupView.prototype.isChanged = function () {
    if (this.changed) {
        return true
    }
    return TupleView.prototype.isChanged.call(this)
};
GroupView.prototype.showGroup = function (a) {
    if (this.open == a) {
        return
    }
    this.bttn.firstChild.src = a ? "up.png" : "down.png";
    for (var b in this.views) {
        if (a) {
            this.views[b].show()
        } else {
            this.views[b].hide()
        }
    }
    this.open = a
};
GroupView.prototype.getVisualClass = function () {
    return "group"
};

function GridView(a, b) {
    TupleView.call(this, a);
    this.ro = b
}

GridView.prototype = inherit(TupleView.prototype);
GridView.prototype.createRow = function (h, c) {
    var j = this.attrs;
    var f = 0;
    var k;
    for (var b in j.c) {
        var g = ftype(j.c[b]).view(j.c[b], this.ro);
        this.views.push(g);
        if (f % j.cols == 0) {
            k = h.createRow()
        }
        var a = (f % j.cols) + 1 == j.cols;
        var e = elc(k, "td", a ? "value" : "tvalue");
        if (a) {
            e.colSpan = 19 - j.cols
        }
        e.appendChild(g.create(h));
        ++f
    }
};
GridView.prototype.getTabName = function () {
    return this.attrs.name
};

function GridMultiView(a, b) {
    TupleView.call(this, a);
    this.ro = b
}

GridMultiView.prototype = inherit(TupleView.prototype);
GridMultiView.prototype.createRow = function (k, c) {
    var l = this.attrs;
    var g = enm[l.values.type];
    var a = g ? g.getMap(l.values) : {};
    var m = {};
    var f = 0;
    var n;
    for (var b in a) {
        var j = new Label(el(null, "span", a[b]));
        var h = this.ro ? new ROTextView(l.c[0]) : new TextView(l.c[0]);
        var e;
        if (f % 2 == 0) {
            n = k.createRow(j.getNode());
            e = elc(n, "td", "tvalue")
        } else {
            elc(n, "td", "label").appendChild(j.getNode());
            elc(n, "td", "extra");
            e = elc(n, "td", "value");
            e.colSpan = 18 - 2
        }
        e.appendChild(h.create(k, j));
        if (l.c[0].postfix) {
            txt(e, l.c[0].postfix)
        }
        m[b] = h;
        ++f
    }
    this.views = m
};
GridMultiView.prototype.load = function (b) {
    var c = ftype(this.attrs).get(this.attrs, b);
    for (var a in this.views) {
        this.views[a].load({_type: b._type, 0: c[a]})
    }
};
GridMultiView.prototype.save = function (e) {
    var f = {};
    for (var a in this.views) {
        var e = {};
        var c = this.views[a].save(e);
        if (c != null) {
            var b = enm[this.attrs.values.type];
            var d = b ? b.getMap(this.attrs.values) : {};
            return "Invalid value in " + d[a]
        }
        f[a] = e[0]
    }
    return null
};
GridMultiView.prototype.getTabName = function () {
    return this.attrs.name
};

function DeckView(a, b) {
    View.call(this, a);
    this.ro = b;
    this.active = null;
    this.panes = []
}

DeckView.prototype = inherit(View.prototype);
DeckView.prototype.attach = function (a, c) {
    View.prototype.attach.call(this, a, c);
    this.viewCtrl = a;
    for (var b in this.attrs.panes) {
        this.panes.push(this.createPane(c, this.attrs.panes[b]))
    }
};
DeckView.prototype.createPane = function (d, e) {
    var c = {};
    c.vals = e.vals;
    c.on = this.viewCtrl.getCondition(e.on);
    c.views = [];
    for (var b in e.c) {
        var a = this.viewCtrl.createView(d, this, e.c[b], this.ro);
        if (a) {
            a.hide();
            c.views.push(a)
        }
    }
    return c
};
DeckView.prototype.getView = function (b) {
    for (var d in this.panes) {
        var e = this.panes[d];
        for (var c in e.views) {
            var a = e.views[c].getView(b);
            if (a) {
                return a
            }
        }
    }
    return null
};
DeckView.prototype.load = function (d) {
    if (!this.attrs.oncommited) {
        if (!this.view) {
            this.view = this.viewCtrl.getView(this.attrs.on);
            var b = this;
            this.lstn = function () {
                b.selectPane()
            };
            this.view.listen(this.lstn)
        }
    } else {
        if (this.attrs.on) {
            this.onAttr = getAttr(d._type, this.attrs.on)
        }
    }
    for (var a in this.panes) {
        var e = this.panes[a];
        for (var c in e.views) {
            e.views[c].load(d)
        }
    }
    this.selectPane(d);
    return this.ctrl
};
DeckView.prototype.save = function (c) {
    if (this.active) {
        for (var b in this.active.views) {
            var a = this.active.views[b].save(c);
            if (a != null) {
                return a
            }
        }
    }
    return null
};
DeckView.prototype.isChanged = function () {
    if (this.active) {
        for (var a in this.active.views) {
            if (this.active.views[a].isChanged()) {
                return true
            }
        }
    }
    return false
};
DeckView.prototype.destroy = function () {
    for (var b in this.panes) {
        var c = this.panes[b];
        for (var a in c.views) {
            c.views[a].destroy()
        }
    }
    if (this.view) {
        this.view.unlisten(this.lstn)
    }
};
DeckView.prototype.selectPane = function (c) {
    var b;
    if (this.attrs.oncommited) {
        if (this.onAttr) {
            b = this.findPane(ftype(this.onAttr).get(this.onAttr, c))
        } else {
            for (var a in this.panes) {
                var d = this.panes[a];
                if (d.on.isTrue(c)) {
                    b = d;
                    break
                }
            }
        }
    } else {
        b = this.findPane(this.view.getValue() || 0)
    }
    if (this.active != b) {
        if (this.active) {
            this.showPane(this.active, false)
        }
        this.active = b;
        if (this.active) {
            this.showPane(this.active, true)
        }
        this.readdTabs()
    }
};
DeckView.prototype.findPane = function (c) {
    for (var b in this.panes) {
        var d = this.panes[b];
        for (var a in d.vals) {
            if (d.vals[a] == c) {
                return d
            }
        }
    }
    return null
};
DeckView.prototype.showPane = function (d, a) {
    for (var c in d.views) {
        var b = d.views[c];
        if (a) {
            b.show()
        } else {
            b.hide()
        }
    }
};
DeckView.prototype.hasRow = function () {
    return false
};
DeckView.prototype.getTabName = function () {
    return this.attrs.name
};

function FlagView(b, c, a) {
    View.call(this, b);
    this.hide = c;
    this.name = a || b.name
}

FlagView.prototype = inherit(View.prototype);
FlagView.prototype.getView = function (a) {
    if (this.attrs.secondname == a) {
        return this
    }
    return this.name == a ? this : null
};
FlagView.prototype.createRow = function (b, a, c) {
    var e = null;
    if (this.attrs.band != null) {
        e = document.getElementById(name)
    }
    if (e == null) {
        var d = document.getElementById("statusbar");
        e = el(d.firstChild.firstChild, "td");
        if (this.attrs.band != null) {
            e.id = "flag" + this.attrs.band
        }
        b.createSkinCntrl(this, e)
    }
    this.ctrl = el(e, "span")
};
FlagView.prototype.load = function (a) {
    this.value = ftype(this.attrs).get(this.attrs, a);
    if (!this.ctrl) {
        return
    }
    var b = ftype(this.attrs).tostr(this.attrs, this.value);
    if (!this.value && b == "") {
        if (this.hide && !skinMode) {
            this.ctrl.parentNode.style.display = "none"
        } else {
            if (this.attrs.band == null) {
                b = "not " + ftype(this.attrs).tostr(this.attrs, !this.value);
                this.ctrl.parentNode.className = "disabled"
            }
        }
    } else {
        this.ctrl.parentNode.className = "enabled";
        if (this.hide && !skinMode) {
            this.ctrl.parentNode.style.display = ""
        }
    }
    replaceText(this.ctrl, b != "" ? b : "\u00a0")
};
FlagView.prototype.getValue = function () {
    return this.value
};
FlagView.prototype.hasRow = function () {
    return false
};
FlagView.prototype.isRO = function () {
    return true
};

function StatusBar(a) {
    View.call(this, a)
}

StatusBar.prototype = inherit(View.prototype);
StatusBar.prototype.attach = function (a, d) {
    for (var c in this.attrs.c) {
        var b = this.attrs.c[c];
        a.addView(d, null, null, new StatusBarView(b), b, getAttrProp(d, b, b.name || "statusbar"), true)
    }
};
StatusBar.prototype.createRow = function (b, a, c) {
    return null
};
StatusBar.prototype.hasRow = function () {
    return false
};

function StatusBarView(b, a, c) {
    View.call(this, b)
}

StatusBarView.prototype = inherit(View.prototype);
StatusBarView.prototype.createRow = function (b, a, c) {
    var e = document.getElementById("statusbar");
    var d = el(e.firstChild.firstChild, "td");
    this.ctrl = el(d, "span");
    this.ctrl.style.minWidth = "100px";
    if (b) {
        b.createSkinCntrl(this, d)
    }
};
StatusBarView.prototype.load = function (b) {
    if (!this.ctrl) {
        return
    }
    var a = this.attrs;
    var c = toString(a, b);
    if (c != "") {
        if (a.name) {
            c = a.name + ": " + c
        }
        if (a.postfix) {
            c += " " + a.postfix
        }
    } else {
        c = "\u00A0"
    }
    replaceText(this.ctrl, c)
};
StatusBarView.prototype.hasRow = function () {
    return false
};
StatusBarView.prototype.isRO = function () {
    return true
};

function AboutView(a) {
    View.call(this, a)
}

AboutView.prototype = inherit(View.prototype);
AboutView.prototype.createRow = function (b, a, c) {
};
AboutView.prototype.load = function (d) {
    var g = document.getElementById("statusbar");
    var e = ftype(this.attrs).get(this.attrs, d);
    if (!e) {
        e = []
    }
    var a;
    var b = g.firstChild.nextSibling;
    for (a = 0; a < e.length && b; ++a) {
        replaceText(b.firstChild.firstChild, e[a]);
        b = b.nextSibling
    }
    if (a == e.length) {
        while (b) {
            var c = b.nextSibling;
            g.removeChild(b);
            b = c
        }
    }
    for (; a < e.length; ++a) {
        var f = elc(el(el(g, "tbody"), "tr"), "td", "about");
        f.colSpan = g.firstChild.firstChild.cells.length;
        txt(f, e[a])
    }
};
AboutView.prototype.hasRow = function () {
    return false
};
AboutView.prototype.isRO = function () {
    return true
};

function TableView(a) {
    TupleView.call(this, a);
    this.cont = new ObjectMap({path: a.path, c: a.c})
}

TableView.prototype = inherit(TupleView.prototype);
TableView.prototype.attach = function (a, b) {
    this.viewCtrl = a;
    if (!this.attrs.views) {
        return
    }
    this.attrs.owner = b._type;
    this.viewObj = {};
    this.viewObj._type = {c: this.attrs.views, owner: this.attrs};
    this.viewObj._owner = new Listeners();
    a.addAllViews(this.viewObj, null, this.views)
};
TableView.prototype.createRow = function (b, a, f) {
    var g = b.createSingleItemRow();
    g.style.padding = "2px 6px 0 0";
    var c = elc(null, "iframe", "table");
    c.style.display = "block";
    c.style.height = "199px";
    c.style.margin = "2px 0 4px 2px";
    c.style.border = "1px solid #888";
    c.frameBorder = "0";
    g.appendChild(c);
    var d = this;

    function e() {
        if (d.table) {
            return
        }
        d.doc = c.contentDocument || c.contentWindow.document;
        var h = iel(d.doc, d.doc.body, "link");
        h.href = document.styleSheets[0].href;
        h.rel = "stylesheet";
        h.type = "text/css";
        var j = d.create(b);
        j.width = "100%";
        j.style.border = "0";
        j.style.boxShadow = "none";
        j.style.webkitBoxShadow = "none";
        j.style.mozBoxShadow = "none";
        d.doc.body.appendChild(j);
        if (d.obj) {
            d.load(d.obj)
        }
    }

    c.onload = e;
    if (c.attachEvent) {
        c.attachEvent("onload", e)
    }
    setTimeout(e, 100)
};
TableView.prototype.create = function (b) {
    if (!this.doc) {
        this.doc = document
    }
    this.table = ielc(this.doc, null, "table", "table");
    this.table.style.background = "#ffffff";
    var c = this;

    function a(d) {
        c.updateRow(d)
    }

    this.cont.listen(a, true);
    this.cont.foreach(function (d) {
        c.updateRow(d)
    });
    return this.table
};
TableView.prototype.destroy = function () {
    if (this.cb) {
        this.cont.unlisten(this.cb, true)
    }
};
TableView.prototype.load = function (a) {
    if (!this.table) {
        this.obj = a;
        return
    }
    this.createTable(a);
    var b = ftype(this.attrs).get(this.attrs, a);
    if (!b) {
        return
    }
    this.updateTable(b)
};
TableView.prototype.save = function (a) {
    return null
};
TableView.prototype.updateTable = function (d) {
    var a = {};
    for (var b in this.rows) {
        a[b] = 1
    }
    for (var b in d) {
        var c = d[b];
        c.ufe0001 = b;
        this.updateRow(c);
        delete a[b]
    }
    for (var b in a) {
        this.udpateRow({ufe0001: b, ufe0013: 1})
    }
};
TableView.prototype.createTable = function (g) {
    if (this.rows) {
        return
    }
    var f = {owner: g._type};
    var h = iel(this.doc, iel(this.doc, this.table, "thead"), "tr");
    var b = 0;
    this.columns = [];
    for (var e in this.attrs.c) {
        var c = this.attrs.c[e];
        var d = !c.nonpublic ? ftype(c).column(c, this, f) : null;
        if (d && d[1] && d[1] != 4294967295) {
            iel(this.doc, h, "th", d[0]).width = d[1];
            this.columns.push(c)
        } else {
            this.columns.push(null)
        }
        if (!ftype(c).alias && c.id == null) {
            c.id = b++
        }
    }
    this.cols = b;
    this.rows = {}
};
TableView.prototype.attachHandler = function (c, b) {
    var a = this;
    c.onclick = function (d) {
        if (a.selectedRow) {
            removeClass(a.selectedRow, "selected")
        }
        if (b.ufe0001 == null) {
            return
        }
        addClass(c, "selected");
        a.selectedRow = c;
        a.selected = b.ufe0001;
        a.updateViews(b);
        return false
    }
};
TableView.prototype.updateRow = function (j) {
    var s = this.rows[j.ufe0001];
    if (j.ufe0013) {
        if (s) {
            this.table.removeChild(s.parentNode);
            delete this.rows[j.ufe0001]
        }
        return
    }
    if (!s) {
        s = iel(this.doc, iel(this.doc, this.table, "tbody"), "tr");
        this.rows[j.ufe0001] = s;
        if (this.flags) {
            iel(this.doc, s, "td")
        }
        for (var n in this.columns) {
            if (!this.columns[n]) {
                continue
            }
            iel(this.doc, s, "td")
        }
    }
    if (this.flags) {
        var g = s.cells[0];
        clearNodes(g);
        var h = {};
        for (var k in this.flags) {
            var q = this.flags[k][0];
            var r = this.flags[k][1];
            if (r && h[r]) {
                continue
            }
            var e = ftype(q).get(q, j);
            var l = ftype(q).flag(this.doc, q, e);
            if (l) {
                g.appendChild(l);
                if (r) {
                    h[r] = true
                }
            }
        }
    }
    var b = this.flags ? 1 : 0;
    for (var k in this.columns) {
        if (!this.columns[k]) {
            continue
        }
        var o = this.attrs.c[k];
        var e = ftype(o).get(o, j);
        var p = s.cells[b];
        var m = ftype(o).cell(this.doc, o, j, e, p.firstChild);
        if (m != p.firstChild) {
            clearNodes(p);
            if (m) {
                p.appendChild(m)
            }
        }
        ++b
    }
    if (this.attrs.views) {
        this.attachHandler(s.parentNode, j)
    }
    if (this.selected != null && this.selected == j.ufe0001) {
        this.selectedRow = s.parentNode;
        this.updateViews(j)
    }
};
TableView.prototype.updateViews = function (a) {
    if (this.viewObj) {
        update(this.viewObj, a);
        this.viewObj._owner.notify(this.viewObj)
    }
};
TableView.prototype.addFlag = function (a, c) {
    if (!this.flags) {
        this.flags = [];
        var d = this.table.firstChild.firstChild;
        var b = iel(this.doc, null, "th");
        b.width = 20;
        iel(this.doc, b, "span", "\u00a0");
        d.insertBefore(b, d.firstChild)
    }
    this.flags.push([a, c])
};
TableView.prototype.isRO = function () {
    return true
};

function NumberTableView(a) {
    TableView.call(this, a)
}

NumberTableView.prototype = inherit(TableView.prototype);
NumberTableView.prototype.createRow = function (b, a, c) {
    b.addRow(null, null, this)
};
NumberTableView.prototype.load = function (e) {
    this.createTable(e);
    var h = ftype(this.attrs).get(this.attrs, e);
    if (!h) {
        return
    }
    var g = [];
    var b = 0;
    while (b < h.length) {
        var f = {};
        for (var d in this.attrs.c) {
            var c = this.attrs.c[d];
            if (c.id != null) {
                f[c.id] = h[b++]
            }
        }
        g.push(f)
    }
    this.updateTable(g)
};
NumberTableView.getTabName = function () {
    return attrs.name
};

function ObjectView(a) {
    View.call(this, a);
    this.views = []
}

ObjectView.prototype = inherit(View.prototype);
ObjectView.prototype.attach = function (c, d) {
    if (this.attrs.id) {
        this.obj = ftype(this.attrs).get(this.attrs, d);
        c.addAllViews(this.obj, null, this.views)
    } else {
        var b = inherit(this.attrs);
        b.owner = d._type;
        c.addAllViews(d, {c: b.c, owner: b}, this.views)
    }
};
ObjectView.prototype.load = function (a) {
    if (this.obj) {
        this.obj._owner.notify(this.obj)
    }
};
ObjectView.prototype.save = function (a) {
    return null
};
ObjectView.prototype.show = function () {
    for (var a in this.views) {
        this.views[a].show()
    }
};
ObjectView.prototype.hide = function () {
    for (var a in this.views) {
        this.views[a].hide()
    }
};

function GraphBox(a) {
    TupleView.call(this, a)
}

GraphBox.prototype = inherit(TupleView.prototype);
GraphBox.prototype.attach = function (b, d) {
    for (var c in this.attrs.graphs) {
        var a = b.createView(d, this, this.attrs.graphs[c], true);
        this.views.push(a)
    }
};
GraphBox.prototype.createRow = function (b, a) {
};
GraphBox.prototype.hasRow = function () {
    return false
};

function GraphView(a) {
    View.call(this, a);
    this.curves = [];
    for (var b in a.curves) {
        this.curves[b] = {values: []}
    }
}

GraphView.prototype = inherit(View.prototype);
GraphView.prototype.createRow = function (b, a, d) {
    if (this.attrs.name) {
        return View.prototype.createRow.call(this, b, a, d)
    }
    var c = this.create(b);
    if (!c) {
        return
    }
    var e = b.createSingleItemRow();
    e.appendChild(c)
};
GraphView.prototype.create = function () {
    var o = this.attrs.height || 144;
    var f = createGraphic(document, null, 1024, o, 340, o, "graph");
    if (!f) {
        return null
    }
    this.g = f;
    this.width = f.viewBox.width;
    this.height = f.viewBox.height;
    f.canvas.style.display = "block";
    f.canvas.style.height = this.height;
    f.strokeColor = "#808080";
    f.strokeWidth = 1;
    var a = (this.height - 14) / 5;
    for (var d = 1; d < 6; ++d) {
        var j = a * d - 0.5;
        f.line(0, j, this.width, j)
    }
    this.xlabels = [];
    var n = 0;
    for (var l = this.width; l > 60; l -= 120) {
        f.line(l - 0.5, 0, l - 0.5, this.height - 4);
        var k = f.text(l - 3, this.height - 14, 8, true);
        if (!this.attrs.model) {
            if (n > 0) {
                k.text(n + " min ago")
            }
            ++n
        }
        this.xlabels.push(k)
    }
    this.ylabels = [];
    for (var d = 0; d < 5; ++d) {
        var j = a * d;
        this.ylabels[5 - d] = f.text(this.width - 120 - 2, j, 9, true)
    }
    f.strokeWidth = 2;
    for (var d in this.curves) {
        var h = this.curves[d];
        var n = d + 1;
        this.curves[d].color = "#" + (n & 2 ? "ff" : "00") + (n & 4 ? "ff" : "00") + (n & 1 ? "ff" : "00");
        f.strokeColor = "#000";
        f.strokeOpacity = 0;
        f.fillOpacity = 0.3;
        f.fillColor = h.color;
        h.polygon = f.polygon();
        f.strokeColor = h.color;
        f.strokeOpacity = 0.4;
        f.fillOpacity = 0;
        h.polyline = f.polyline()
    }
    this.horizontal = [];
    var m = el(null, "table");
    m.width = "100%";
    m.cellSpacing = 0;
    m.cellPadding = 0;
    m.style.margin = "2px 0 0 0";
    for (var d in this.curves) {
        var h = this.curves[d];
        var q = el(el(m, "tbody"), "tr");
        var p = createGraphic(document, null, 20, 2, 20, 2);
        p.strokeColor = h.color;
        p.strokeOpacity = 0.9;
        p.strokeWidth = 2;
        p.line(0, 0, 20, 0);
        p.canvas.style.verticalAlign = "middle";
        p.canvas.style.margin = "0 4px 0 0";
        var b = el(q, "td");
        b.appendChild(p.canvas);
        el(b, "span", this.attrs.curves[d].name);
        h.cur = el(q, "td", "cur:");
        h.avg = el(q, "td", "avg:");
        h.max = el(q, "td", "max:")
    }
    var e = elc(null, "div", "graph");
    e.appendChild(f.canvas);
    e.appendChild(m);
    return e
};
GraphView.prototype.load = function (g) {
    if (!this.g) {
        return
    }
    var a = this.width / 2 + 1;
    var h = false;
    if (this.attrs.model) {
        var f = this.attrs.offset || 0;
        var k = this.attrs.model;
        var l = ftype(k).get(k, g);
        if (!l) {
            l = []
        }
        for (var j in this.curves) {
            this.curves[j].value = this.attrs.curves[j].value;
            this.curves[j].values = []
        }
        var o = 0;
        var n = [];
        while (o < l.length) {
            n.push(l[o++][0]);
            for (var j in this.curves) {
                var m = this.curves[j];
                var d = ftype(m.value).get(m.value, l[o++]);
                m.values.push(d + f);
                h = true
            }
        }
        this.times = [];
        for (var j = n.length - 1; j >= 0; j -= 60) {
            this.times.push(n[j])
        }
    } else {
        for (var j in this.curves) {
            var m = this.curves[j];
            if (!m.value) {
                m.ovalue = getAttr(g._type, this.attrs.curves[j].value, true);
                m.value = m.ovalue
            }
            if (m.time == null) {
                m.time = 0;
                if (this.attrs.curves[j].time) {
                    m.time = getAttr(g._type, this.attrs.curves[j].time, true)
                }
            }
            var d = ftype(m.ovalue).get(m.ovalue, g);
            if (d == null) {
                continue
            }
            var e;
            if (m.time) {
                var e = ftype(m.time).get(m.time, g);
                if (e == null) {
                    continue
                }
            } else {
                e = getUptime()
            }
            if (m.lastTime != null) {
                var b = e - m.lastTime;
                if (b < 1) {
                    continue
                }
                while (b-- > 1) {
                    m.values.push(null)
                }
            }
            m.lastTime = e;
            if (d instanceof Array) {
                m.value = m.ovalue.c[0];
                for (var j in d) {
                    m.values.push(ftype(m.value).get(m.value, d[j]));
                    h = true
                }
            } else {
                m.values.push(d);
                h = true
            }
        }
    }
    for (var j in this.curves) {
        var m = this.curves[j];
        if (m.values.length > a) {
            m.values.splice(0, m.values.length - a)
        }
    }
    if (h) {
        this.update()
    }
};
GraphView.prototype.update = function () {
    var z = function (v, t) {
        var c = v.value;
        var j = ftype(c).tostr(c, t);
        if (c.postfix) {
            j += " " + c.postfix
        }
        return j.replace(" ", "\u00a0")
    };
    var f = this.attrs.offset || 0;
    var a = 10 - f;
    for (var w in this.curves) {
        var A = this.curves[w];
        var u = 0 - f;
        var b = 0;
        for (var s in A.values) {
            var m = A.values[s] - f;
            if (u < m) {
                u = m
            }
            b += m
        }
        var q = 0;
        var e = 0;
        if (A.values.length > 0) {
            q = Math.round(b / A.values.length);
            e = A.values[A.values.length - 1] - f
        }
        replaceText(A.cur, "cur: " + z(A, e));
        replaceText(A.avg, "avg: " + z(A, q));
        replaceText(A.max, "max: " + z(A, u));
        if (a < u) {
            a = u
        }
    }
    if (this.attrs.max) {
        a = this.attrs.max
    } else {
        a += f;
        var d = Math.pow(10, Math.ceil(Math.log(a) / Math.LN10));
        a = d / 2 >= a ? d / 2 : d
    }
    if (this.max != a) {
        this.max = a;
        var p;
        for (var w in this.curves) {
            p = this.curves[w];
            if (p.values.length > 0) {
                break
            }
        }
        var g = a / 5;
        for (var w = 1; w <= 5; ++w) {
            this.ylabels[w].text(z(p, w * g - f))
        }
    }
    var o = this.height - 14;
    for (var w in this.curves) {
        var A = this.curves[w];
        A.polyline.reset();
        A.polygon.reset();
        var h = null;
        for (var s in A.values) {
            if (A.values[s] == null) {
                continue
            }
            var l = this.width - (A.values.length - 1 - s) * 2;
            var k = Math.round(o - (A.values[s] / a) * o);
            A.polyline.add(l, k);
            if (h == null) {
                A.polygon.add(l, o)
            }
            A.polygon.add(l, k);
            h = l
        }
        if (h != null) {
            A.polygon.add(h, o);
            A.polyline.draw();
            A.polygon.draw()
        }
    }
    if (this.times) {
        for (var w in this.xlabels) {
            var r = "";
            if (this.times[w] != null) {
                var n = this.times[w] - sysres.uptimediff - getTZOffset();
                r = dateAndTime2string(getDate(n), getTime(n), false, true)
            }
            this.xlabels[w].text(r)
        }
    }
};

function FileUploadView(a) {
    View.call(this, a)
}

FileUploadView.prototype = inherit(View.prototype);
FileUploadView.prototype.create = function (g, f) {
    var j = this.attrs;
    this.ctrl = el(null, "span");
    var a = el(null, "iframe");
    a.id = "uframe";
    a.scrolling = "no";
    a.width = "270px";
    a.height = "26px";
    a.frameBorder = "0";
    a.style.cssFloat = "none";
    a.style.display = "inline";
    a.style.margin = "2px";
    a.src = "uploader.html";
    this.ctrl.appendChild(a);
    var c;
    if (!j.uploadonly) {
        var e = document.getElementById("statusbar");
        c = el(e.firstChild.firstChild, "td")
    } else {
        c = el(this.ctrl, "span", "");
        c.style.display = "none"
    }
    var d = false;
    var b = function () {
        var n = document.getElementById("uframe");
        var m = n.contentDocument || n.document;
        var l = m.getElementById("file");
        replaceText(c, d ? "uploaded" : "\u00a0");
        if (j.uploadonly) {
            n.style.display = "inline";
            c.style.display = "none"
        }
        if (d) {
            if (j.cmd) {
                var k = {};
                k.Uff0001 = j.path;
                k.uff0007 = j.cmd;
                post(k)
            }
            d = false;
            l.disabled = false
        }
        l.onchange = function () {
            var q = l.value.split("\\");
            var o = q[q.length - 1];
            if (j.filter && !o.match(new RegExp(j.filter, "i"))) {
                alert(j.error || "Wrong file!");
                l.value = "";
                return
            }
            d = true;
            replaceText(c, "uploading " + o);
            if (j.uploadonly) {
                c.style.display = "inline";
                n.style.display = "none"
            }
            var p = m.getElementById("form");
            p.action = "/jsproxy/upload?" + session.encryptURI("");
            p.submit();
            l.disabled = true
        }
    };
    if (a.attachEvent) {
        a.attachEvent("onload", b)
    } else {
        a.onload = b
    }
    var h = el(null, "iframe");
    h.id = "downloader";
    h.style.display = "none";
    this.ctrl.appendChild(h);
    return this.ctrl
};

function ToggleView(a) {
    View.call(this, a);
    this.value = 0
}

ToggleView.prototype = inherit(View.prototype);
ToggleView.prototype.createRow = function (b, a, d) {
    this.viewCtrl = b;
    this.obj = d;
    if (!skinMode && a._hide) {
        return el(null, "span")
    }
    this.ctrl = current.addButton(this.attrs.modes[1], a);
    b.createSkinCntrl(this, this.ctrl, this.ctrl.firstChild, true);
    var c = this;
    this.ctrl.onclick = function (f) {
        if (isSkinEvent(f)) {
            return true
        }
        c.value = c.value ? 0 : 1;
        c.update(c.obj);
        c.notify()
    }
};
ToggleView.prototype.getValue = function () {
    return this.value
};
ToggleView.prototype.update = function (c) {
    if (!this.ctrl) {
        return
    }
    var b = this.attrs.modes[this.value ? 0 : 1];
    var a = getAttrProp(this.obj, this.attrs, b);
    if (!skinMode) {
        replaceText(this.ctrl.lastChild, a.name || b)
    } else {
        this.ctrl.removeChild(this.ctrl.lastChild);
        this.ctrl.appendChild(viewLabel(a, b))
    }
};
ToggleView.prototype.hasRow = function () {
    return false
};

function getAttr(f, b, e) {
    for (var c in f.c) {
        if (ftype(f.c[c]).alias) {
            continue
        }
        if (f.c[c].name == b) {
            return f.c[c]
        }
        if (e && f.c[c].type != "tuple") {
            continue
        }
        if (f.c[c].c) {
            var a = getAttr(f.c[c], b);
            if (a) {
                return a
            }
        }
        if (f.c[c].panes) {
            var d = f.c[c].panes;
            for (var g in d) {
                a = getAttr(d[g], b);
                if (a) {
                    return a
                }
            }
        }
    }
    if (b == "dynamic" || b == "enable") {
        for (var c in f.c) {
            if (f.c[c].type == b) {
                return f.c[c]
            }
        }
    }
    return null
}

function AliasView(a, b) {
    View.call(this, a);
    this.ro = b
}

AliasView.prototype = inherit(View.prototype);
AliasView.prototype.attach = function (c, d) {
    var b = getAttr(d._type, this.attrs.name);
    if (b) {
        this.view = c.createView(d, null, b, this.ro)
    }
};
AliasView.prototype.load = function (a) {
    if (this.view) {
        this.view.load(a)
    }
};
AliasView.prototype.save = function (a) {
    if (this.view) {
        return this.view.save(a)
    }
    return null
};
AliasView.prototype.isChanged = function () {
    return this.view && this.view.isChanged()
};
AliasView.prototype.show = function () {
    if (this.view) {
        this.view.show()
    }
};
AliasView.prototype.hide = function () {
    if (this.view) {
        this.view.hide()
    }
};
AliasView.prototype.hasRow = function () {
    return false
};

function Condition(b, a, c) {
    Listeners.call(this);
    this.cond = b;
    this.on = [];
    this.views = [];
    this.value = true;
    this.obj = c;
    if (b.oron && a) {
        this.oron = a[b.oron]
    }
}

Condition.prototype = inherit(Listeners.prototype);
Condition.prototype.init = function (e) {
    if (!this.hasRegular()) {
        return
    }
    var d = this;
    var f = function () {
        d.check();
        d.notify()
    };
    if (!this.cond.makero && !this.cond.hide) {
        for (var b in this.cond.c) {
            var g = this.cond.c[b];
            var a;
            if (g.on instanceof Array) {
                a = e.getView(g.on[g.on.length - 1], this.obj)
            } else {
                a = e.getView(g.on, this.obj)
            }
            this.on[b] = a;
            a.listen(f)
        }
    }
    if (this.oron) {
        this.oron.listen(f)
    }
    this.check()
};
Condition.prototype.check = function () {
    var b = (this.cond.makero || this.cond.hide) ? this.oron.isTrue() : this.isTrue();
    if (b == this.value) {
        return
    }
    this.value = b;
    for (var a in this.views) {
        if (this.cond.hidedynamicly) {
            if (b) {
                this.views[a].show()
            } else {
                this.views[a].hide()
            }
        } else {
            this.views[a].enable(b)
        }
    }
};
Condition.prototype.hasRegular = function () {
    if (!this.cond.hide && !this.cond.makero) {
        return true
    }
    if (this.oron) {
        return this.oron.hasRegular()
    }
    return false
};
Condition.prototype.canHide = function () {
    if (this.cond.hide) {
        return true
    }
    if (this.oron) {
        return this.oron.canHide()
    }
    return false
};
Condition.prototype.shouldHide = function (a) {
    if (this.cond.hide && !this.isItselfTrue(a)) {
        return true
    }
    if (this.oron) {
        return this.oron.shouldHide(a)
    }
    return false
};
Condition.prototype.shouldMakeRO = function (a) {
    if (this.cond.makero && !this.isItselfTrue(a)) {
        return true
    }
    if (this.oron) {
        return this.oron.shouldMakeRO(a)
    }
    return false
};
Condition.prototype.isItselfTrue = function (d) {
    for (var b in this.cond.c) {
        var f = this.cond.c[b];
        if (!f.on) {
            if (!isTrue(f.pred, null)) {
                return false
            }
            continue
        }
        if (!d) {
            if (!this.on[b]) {
                return true
            }
            if (!isTrue(f.pred, this.on[b].getValue())) {
                return false
            }
        } else {
            if (f.on instanceof Array) {
                return true
            }
            var a = getAttr(d._type, f.on);
            if (a == null) {
                return false
            }
            var e = ftype(a).getvalue(a, d);
            if (!isTrue(f.pred, e)) {
                return false
            }
        }
    }
    return true
};
Condition.prototype.isTrue = function (a) {
    if (this.isItselfTrue(a)) {
        return true
    }
    if (this.oron) {
        return this.oron.isTrue()
    }
    return false
};
Condition.prototype.addView = function (a) {
    this.views.push(a)
};
var conv = {};
conv.put = function (c, a, b) {
    return c.val
};
conv.u32vector_u32 = function (c, a, b) {
    return b && b[0] ? b[0] : 0
};
conv.u32_network = function (c, a, b) {
    return [b, (b ? 4294967295 : 0)]
};
conv.u32_vector_u32pair = function (c, a, b) {
    return b
};
conv.u32_u32 = function (c, a, b) {
    return b
};
conv.id_str = function (c, a, b) {
    return a._owner.toString(a)
};

function convert(m, a, h, j) {
    var d = {};
    d._type = h._type;
    d._owner = h._owner;
    for (var e in m) {
        var b;
        var f;
        if (m[e].src) {
            if (m[e].presave && j) {
                var k = j.getView(m[e].src);
                var c = k.save(a);
                if (k.isVisible() && k.isEnabled() && c != null) {
                    alert(c);
                    return false
                }
            }
            f = getAttr(a._type, m[e].src);
            b = ftype(f).get(f, a)
        } else {
            b = a.ufe0001;
            f = null
        }
        var l = getAttr(h._type, m[e].dst);
        if (m[e].conv) {
            b = conv[m[e].conv](m[e], a, b)
        } else {
            if (f) {
                var g = ftype(f).tostr(f, b);
                b = ftype(l).fromstr(l, g)
            }
        }
        if (b != null) {
            ftype(l).put(l, d, b)
        }
    }
    update(h, d);
    return true
}

function defTrue(a) {
    switch (a) {
        case OP_IS_NOT:
        case OP_CONTAIN_NOT:
        case OP_IN_NOT:
            return true
    }
    return false
}

function ftype(a) {
    return types[a.type] || types.def
}

var types = {};
types.def = {};
types.def.get = function (a, b) {
    return b[a.id || 0]
};
types.def.getvalue = function (a, b) {
    return ftype(a).get(a, b)
};
types.def.put = function (a, b, c) {
    b[a.id || 0] = c
};
types.def.remove = function (a, b) {
    delete b[a.id || 0]
};
types.def.tostr = function (a, b) {
    return b
};
types.def.fromstr = function (a, b) {
    return b
};
types.def.hasValue = function (a, b) {
    return true
};
types.def.less = function (a, c, b) {
    return c < b
};
types.def.cfg = function (a, b) {
    return getAttrProp(b, a)
};
types.def.view = function (b, c) {
    if (c) {
        if (b.opt) {
            return new ROOptTextView(b)
        }
        return new ROTextView(b)
    }
    if (b.values) {
        var a = new ComboView(b);
        if (b.opt) {
            a = new OptView(b, a)
        }
        return a
    }
    if (b.opt) {
        return new OptView(b)
    }
    return new TextView(b)
};
types.def.column = function (d, f, e) {
    if (d.on && d.cond == null) {
        var g = getAttr(e, d.on);
        d.cond = g ? new Condition(g) : 0;
        if (d.cond && !(d.cond.canHide() || d.cond.hasRegular())) {
            d.cond = 0
        }
    }
    if (d.cond && d.cond.shouldHide()) {
        return
    }
    var a = getAttrProp(e, d);
    if (shouldHide(a)) {
        return
    }
    var b = a.name || d.name;
    if (!d.inlinepostfix && d.postfix) {
        b += " (" + d.postfix + ")"
    }
    return [b, d.width]
};
types.def.cell = function (c, a, b, e) {
    if (a.cond && !a.cond.isTrue(b)) {
        return null
    }
    var d = "";
    if (e != null || !a.opt) {
        d = ftype(a).tostr(a, e)
    }
    if (d.length > 0 && a.inlinepostfix) {
        d += a.postfix
    }
    return d != "" ? itxt(c, null, d) : null
};
types.def.listen = function (d, b) {
    if (d.values) {
        var f = enm[d.values.type];
        if (f && f.listen) {
            f.listen(d.values, b)
        }
    }
    if (!d.c) {
        return
    }
    for (var e in d.c) {
        var c = d.c[e];
        ftype(c).listen(c, b)
    }
};
types.def.unlisten = function (d, b) {
    if (d.values) {
        var f = enm[d.values.type];
        if (f && f.unlisten) {
            f.unlisten(d.values, b)
        }
    }
    if (!d.c) {
        return
    }
    for (var e in d.c) {
        var c = d.c[e];
        ftype(c).unlisten(c, b)
    }
};
types.def.deflimit = function (a) {
    return null
};
types.def.addlimit = function (b, a, c) {
    return false
};
types.def.limit = function (d, f) {
    var a = {};
    var g = f.split("\n");
    for (var e in g) {
        if (g[e].length == 0) {
            continue
        }
        var b = g[e].split(",");
        for (var c in b) {
            var f = trim(b[c]);
            if (f.length == 0) {
                continue
            }
            if (!ftype(d).addlimit(d, a, f)) {
                return null
            }
        }
    }
    return a
};
types.def.lookup = function (c, a, b) {
    if (a && (!c.owner || c.owner.name != a)) {
        return null
    }
    if (c.name == b) {
        return c
    }
    return null
};
types.def.alias = false;
types.def.matcher = function (a, b, c) {
    return null
};
types.bool = inherit(types.def);
types.bool.get = function (a, b) {
    var c = b[a.id || 0];
    if (a.bit) {
        c = c & a.bit ? 1 : 0
    }
    return a.inv ? (c != null ? !c : null) : c
};
types.bool.put = function (c, d, e) {
    var a = c.bit || 1;
    d[c.id || 0] = c.inv ? (e ? 0 : a) : (e ? a : 0)
};
types.bool.fromstr = function (a, b) {
    if (b == "yes" || b == "true") {
        return 1
    }
    if (b == "no" || b == "false") {
        return 0
    }
    return null
};
types.bool.tostr = function (a, b) {
    if (b == null) {
        b = a.def || false
    }
    return b ? "yes" : "no"
};
types.bool.view = function (a, b) {
    return new BoolView(a, b)
};
types.bool.matcher = function (a, b, c) {
    c = this.fromstr(c);
    if (c == null) {
        return null
    }
    if (b == OP_IS) {
        return function (d) {
            return d == c
        }
    }
    return function (d) {
        return true
    }
};
types.bool.filter = function (a, b) {
    if (b) {
        return [OP_IS]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.number = inherit(types.def);
types.number.get = function (a, b) {
    var c = b[a.id || 0];
    return c instanceof Array ? c[0] : c
};
types.number.put = function (a, b, c) {
    if (c == null) {
        c = a.optval != null ? a.optval : (a.def || 0)
    }
    b[a.id] = c
};
types.number.hasValue = function (a, b) {
    return b != (a.optval || a.def || 0)
};
types.number.fromstr = function (b, c, a) {
    var d = lossyenum_fromstr(b, c, function (e, f) {
        var g = string2int(f, e.radix || 10);
        if (g == null || g < 0) {
            return null
        }
        if (!minmax(g, e.min, e.max)) {
            return null
        }
        return g
    });
    if (d == null || !fitsRangeLimit(d, a)) {
        return null
    }
    return d
};
types.number.tostr = function (a, b) {
    if (b == null) {
        b = a.def || 0;
        if (!minmax(b, a.min, a.max)) {
            b = a.min || 0
        }
    }
    return lossyenum_tostr(a, b, b.toString(a.radix || 10))
};
types.number.deflimit = function (a) {
    var b;
    if (a.values) {
        b = (a.min || 0).toString(a.radix || 10) + "..";
        if (a.max != null) {
            b += a.max.toString(a.radix || 10)
        }
        return b
    }
    b = this.tostr(a, a.min || 0) + "..";
    if (a.max != null) {
        b += this.tostr(a, a.max)
    }
    return b
};
types.number.addlimit = function (b, a, c) {
    if (!a.ranges) {
        a.ranges = []
    }
    return parseLimit(a.ranges, c, b.min || 0, b.max || 4294967295, function (d) {
        return ftype(b).fromstr(b, d)
    })
};
types.number.matcher = function (a, c, d) {
    var b = ftype(a).fromstr(a, trim(d));
    if (b == null) {
        return null
    }
    switch (c) {
        case OP_IS:
            return function (e) {
                return e == b
            };
        case OP_IS_NOT:
            return function (e) {
                return e != b
            };
        case OP_LS:
            return function (e) {
                return e < b
            };
        case OP_LEQ:
            return function (e) {
                return e <= b
            };
        case OP_GT:
            return function (e) {
                return e > b
            };
        case OP_GEQ:
            return function (e) {
                return e >= b
            }
    }
    return function (e) {
        return true
    }
};
types.number.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.bignumber = inherit(types.number);
types.bignumber.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.integer = inherit(types.number);
types.integer.get = function (a, b) {
    var c = b[a.id || 0];
    return c != null ? num2int(c) : null
};
types.integer.put = function (a, b, c) {
    if (c == null) {
        c = a.optval != null ? a.optval : (a.def || 0)
    }
    b[a.id || 0] = c
};
types.integer.hasValue = function (a, b) {
    return b != num2int(a.optval || a.def || 0)
};
types.integer.tostr = function (a, b) {
    if (b == null) {
        b = num2int(a.def || 0);
        if (!iminmax(b, a.min, a.max)) {
            if (a.max && b > num2int(a.max)) {
                b = num2int(a.max)
            } else {
                b = num2int(a.min || 0)
            }
        }
    }
    return num2int(b).toString()
};
types.integer.fromstr = function (c, e, b) {
    var f = string2int(e);
    if (f == null || !iminmax(f, c.min, c.max)) {
        return null
    }
    if (b && b.ranges) {
        var a = b.ranges;
        for (var d = 0; d < a.length; d += 2) {
            if (iminmax(f, a[d], a[d + 1])) {
                return f
            }
        }
        return null
    }
    return f
};
types.integer.addlimit = function (b, a, c) {
    if (!a.ranges) {
        a.ranges = []
    }
    return parseLimit(a.ranges, c, b.min != null ? b.min : num2int(2147483648), b.max != null ? b.max : num2int(2147483647), function (d) {
        return ftype(b).fromstr(b, d)
    })
};
types.integer.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.decimal = inherit(types.number);
types.decimal.tostr = function (a, f) {
    var e = types.integer.tostr(a, f);
    var c = "";
    var d = e.length % 3;
    if (d) {
        c = e.substr(0, d)
    }
    for (var b = d; b < e.length; b += 3) {
        if (b > 0) {
            c = c + " "
        }
        c = c + e.substr(b, 3)
    }
    return c
};
types.bigdecimal = inherit(types.decimal);
types.bytes = inherit(types.number);
types.bytes.tostr = function (a, b) {
    if (!b) {
        return "0 B"
    }
    b *= a.scale || 1;
    if (b < 5000) {
        return b + " B"
    }
    if (b < 5000000) {
        return (b / 1024).toFixed(1) + " KiB"
    }
    if (b < 5000000000) {
        return (b / (1024 * 1024)).toFixed(1) + " MiB"
    }
    return (b / (1024 * 1024 * 1024)).toFixed(1) + " GiB"
};
types.bigbytes = inherit(types.bytes);
types.bitrate = inherit(types.number);
types.bitrate.tostr = function (a, b) {
    if (!b) {
        return "0 bps"
    }
    if (b < 2000 && b != 1000) {
        return b + " bps"
    }
    if (b < 2000000 && b != 1000000) {
        return (b / 1000).toFixed(1) + " kbps"
    }
    if (b < 2000000000 && b != 1000000000) {
        return (b / 1000000).toFixed(1) + " Mbps"
    }
    return (b / 1000000000).toFixed(1) + " Gbps"
};
types.bigbitrate = inherit(types.bitrate);
types.kbytes = inherit(types.number);
types.kbytes.tostr = function (a, b) {
    if (!b) {
        return "0 kB"
    }
    if (b < 5000) {
        return b + " kB"
    }
    if (b < 5000000) {
        return (b / 1000).toFixed(1) + " MB"
    }
    return (b / 1000000).toFixed(1) + " GB"
};
types.unit = inherit(types.number);
types.unit.units = ["", "k", "M", "G"];
types.unit.tostr = function (a, c) {
    c = c || 0;
    for (var b in this.units) {
        if (c < 1000 || c % 1000 != 0) {
            return c + this.units[b]
        }
        c /= 1000
    }
    return c.toString()
};
types.unit.fromstr = function (b, f, a) {
    if (f.length < 1) {
        return null
    }
    var d = f.substr(f.length - 1).toLowerCase();
    var e = 1;
    for (var c = 0; c < this.units.length; ++c) {
        if (this.units[c].toLowerCase() == d) {
            var g = string2int(f.substr(0, f.length - 1));
            if (g == null || g < 0) {
                return null
            }
            g *= e;
            if (!minmax(g, b.min, b.max)) {
                return null
            }
            if (!fitsRangeLimit(g, a)) {
                return null
            }
            return g
        }
        e *= 1000
    }
    return types.number.fromstr(b, f)
};
types.bigunit = inherit(types.unit);
types.changerate = inherit(types.def);
types.changerate.getRate = function (b, f, h) {
    if (!b.v) {
        b.v = getAttr(f._type, b.value)
    }
    var g = ftype(b.v).get(b.v, f);
    if (g == null) {
        return null
    }
    if (!f._timestamp) {
        f._timestamp = {}
    }
    var a = (new Date()).getTime();
    var e = f._timestamp[b.value];
    var d = 0;
    if (e) {
        var c = a - e[0];
        if (c <= 900) {
            return e[2]
        }
        d = Math.floor((g - e[1]) * h * 1000 / c)
    }
    f._timestamp[b.value] = [a, g, d];
    return d
};
types.changerate.get = function (a, b) {
    return this.getRate(a, b, a.scale || 1)
};
types.changerate.tostr = types.decimal.tostr;
types.changerate.view = function (a, b) {
    return types.def.view(a, 1)
};
types.bigchangerate = inherit(types.changerate);
types.bigchangerate.tostr = types.bigdecimal.tostr;
types.bigbitchangerate = inherit(types.changerate);
types.bigbitchangerate.get = function (a, b) {
    return this.getRate(a, b, 8)
};
types.bigbitchangerate.tostr = types.bigbitrate.tostr;
types.fixedpoint = inherit(types.number);
types.fixedpoint.tostr = function (a, c) {
    var b = a.scale || 1;
    c = c || a.def || 0;
    return Math.floor(c / b).toString() + "." + fraction2string(c, b)
};
types.fixedpoint.fromstr = function (c, g, a) {
    var e = c.scale || 1;
    var b = g.split(".");
    var h = string2int(b[0]);
    if (h == null || h < 0 || b.length > 2) {
        return null
    }
    h *= e;
    if (b[1]) {
        var d = string2fraction(b[1], e);
        if (d == null) {
            return null
        }
        h += d
    }
    if (!iminmax(h, c.low, c.high)) {
        return null
    }
    if (!fitsRangeLimit(h, a)) {
        return null
    }
    return h
};
types.fixedpoint.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.integerrange = inherit(types.def);
types.integerrange.get = function (b, d) {
    var a = d[b.id || 0];
    var c = d[b.idhigh || 1];
    return [a != null ? num2int(a) : a, c != null ? num2int(c) : c]
};
types.integerrange.put = function (a, b, c) {
    if (c == null) {
        c = [a.low || 0, a.high || 2147483647]
    }
    b[a.id || 0] = c[0];
    b[a.idhigh || 1] = c[1]
};
types.integerrange.remove = function (a, b) {
    delete b[a.id || 0];
    delete b[a.idhigh || 0]
};
types.integerrange.hasValue = function (a, b) {
    return b[0] != (a.low || 0) || b[1] != (a.high || 2147483647)
};
types.integerrange.tostr = function (b, d) {
    var a = d[0];
    var c = d[1];
    if (a == null) {
        a = b.deflow != null ? b.deflow : b.low || 0
    }
    if (c == null) {
        c = b.defhigh != null ? b.defhigh : b.high || 2147483647
    }
    if (a == c) {
        return a.toString()
    }
    return num2int(a).toString() + ".." + num2int(c).toString()
};
types.integerrange.fromstr = function (e, h, c) {
    var d = h.split("..");
    var a = string2int(d[0]);
    if (a == null || !iminmax(a, e.low, e.high)) {
        return null
    }
    if (d.length == 1) {
        return [a, a]
    }
    var g = string2int(d[1]);
    if (g == null || !iminmax(g, e.low, e.high)) {
        return null
    }
    if (c && c.ranges) {
        var b = c.ranges;
        for (var f = 0; f < b.length; f += 2) {
            if (iminmax(a, b[f], b[f + 1]) && iminmax(g, b[f], b[f + 1])) {
                return [a, g]
            }
        }
        return null
    }
    return [a, g]
};
types.integerrange.deflimit = function (a) {
    str = "";
    if (a.low != null) {
        str = num2int(a.low).toString()
    }
    str += "..";
    if (a.high != null) {
        str += num2int(a.high).toString()
    }
    return str
};
types.integerrange.addlimit = function (b, a, c) {
    if (!a.ranges) {
        a.ranges = []
    }
    return parseLimit(a.ranges, c, b.low != null ? b.low : num2int(2147483648), b.high != null ? b.high : num2int(2147483647), function (e) {
        var d = string2int(e);
        if (d == null || !iminmax(d, b.low, b.high)) {
            return null
        }
        return d
    })
};
types.integerrange.matcher = function (a, b, c) {
    return types.numberrange.matcher(a, b, c)
};
types.integerrange.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.numberlist = inherit(types.def);
types.numberlist.tostr = function (a, d) {
    if (d == null) {
        return ""
    }
    var c = "";
    for (var b in d) {
        if (c.length > 0) {
            c += ","
        }
        c += d[b].toString(a.radix || 10)
    }
    return c
};
types.numberlist.fromstr = function (c, f) {
    var b = [];
    var e = f.split(",");
    for (var d in e) {
        var g = string2int(e[d], c.radix);
        if (g == null || g < 0 || !minmax(g, c.min, c.max)) {
            return null
        }
        b.push(g)
    }
    return b
};
types.numberrange = inherit(types.def);
types.numberrange.get = function (b, d) {
    var a = d[b.id || 0];
    var c = d[b.highid || 1];
    return [a, c]
};
types.numberrange.put = function (a, b, c) {
    if (c == null) {
        c = [a.min || 0, a.max || int2num(-1)]
    }
    b[a.id || 0] = c[0];
    b[a.highid || 1] = c[1]
};
types.numberrange.remove = function (a, b) {
    delete b[a.id || 0];
    delete b[a.highid || 0]
};
types.numberrange.hasValue = function (a, b) {
    return b[0] != (a.min || 0) || b[1] != (a.max || int2num(-1))
};
types.numberrange.tostr = function (b, e) {
    var a = e[0];
    var d = e[1];
    if (a == null) {
        a = b.deflow != null ? b.deflow : b.min || 0
    }
    if (d == null) {
        d = b.defhigh != null ? b.defhigh : b.max || int2num(-1)
    }
    var c = b.radix || 10;
    if (a == d) {
        return a.toString(c)
    }
    return a.toString(c) + "-" + d.toString(c)
};
types.numberrange.fromstr = function (e, h, c) {
    var d = h.split("-");
    var a = string2int(d[0], e.radix);
    if (a == null || !minmax(a, e.min, e.max) || a < 0) {
        return null
    }
    var g = a;
    if (d.length > 1) {
        if (d.length > 2) {
            return null
        }
        g = string2int(d[1], e.radix);
        if (g == null || !minmax(g, e.min, e.max) || g < 0) {
            return null
        }
    }
    if (c && c.ranges) {
        var b = c.ranges;
        for (var f = 0; f < b.length; f += 2) {
            if (minmax(a, b[f], b[f + 1]) && minmax(g, b[f], b[f + 1])) {
                return [a, g]
            }
        }
        return null
    }
    return [a, g]
};
types.numberrange.deflimit = function (a) {
    var b = (a.min || 0).toString(a.radix || 10) + "..";
    if (a.max != null) {
        b += a.max.toString(a.radix || 10)
    }
    return b
};
types.numberrange.addlimit = function (b, a, c) {
    if (!a.ranges) {
        a.ranges = []
    }
    return parseLimit(a.ranges, c, b.min || 0, b.max || 4294967295, function (d) {
        var e = string2int(d);
        if (e == null || e < 0) {
            return null
        }
        if (!minmax(e, b.min, b.max)) {
            return null
        }
        return e
    })
};
types.numberrange.matcher = function (a, c, d) {
    var b = ftype(a).fromstr(a, trim(d));
    if (b == null) {
        return null
    }
    switch (c) {
        case OP_IS:
            return function (e) {
                return e[0] == b && e[1] == b
            };
        case OP_CONTAIN:
            return function (e) {
                return e[0] <= b && b <= e[1]
            };
        case OP_CONTAIN_NOT:
            return function (e) {
                return b < e[0] || b > e[1]
            };
        case OP_LS:
            return function (e) {
                return e[1] < b
            };
        case OP_LEQ:
            return function (e) {
                return e[1] <= b
            };
        case OP_GT:
            return function (e) {
                return e[0] > b
            };
        case OP_GEQ:
            return function (e) {
                return e[0] >= b
            }
    }
    return function (e) {
        return true
    }
};
types.numberrange.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_CONTAIN, OP_CONTAIN_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.numberrangelist = inherit(types.def);
types.numberrangelist.hasValue = function (a, b) {
    return b.length > 0
};
types.numberrangelist.fromstr = function (f, k, c) {
    var d = k.split(",");
    var b = [];
    for (var g in d) {
        if (d[g] == "") {
            continue
        }
        var j = string2enum(f.values, d[g]);
        if (j != null) {
            if (!fitsRangeLimit(j, c)) {
                return null
            }
            b.push(j);
            b.push(j)
        } else {
            var h = types.numberrange.fromstr(f, d[g], c);
            if (h == null) {
                return h
            }
            b.push(h[0]);
            b.push(h[1])
        }
    }
    return b
};
types.numberrangelist.tostr = function (b, e) {
    if (e == null) {
        return ""
    }
    var d = "";
    for (var c = 0; c < e.length; c += 2) {
        if (c > 0) {
            d += ","
        }
        var a = enum2string(b.values, e[c]);
        if (a) {
            d = d + a
        } else {
            d = d + types.numberrange.tostr(b, [e[c], e[c + 1]])
        }
    }
    return d
};
types.numberrangelist.deflimit = function (a) {
    return types.numberrange.deflimit(a)
};
types.numberrangelist.addlimit = function (b, a, c) {
    return types.numberrange.addlimit(b, a, c)
};
types.numbertable = inherit(types.def);
types.numbertable.view = function (a, b) {
    return new NumberTableView(a)
};
types.table = inherit(types.def);
types.table.view = function (a, b) {
    return new TableView(a)
};
types.object = inherit(types.def);
types.object.get = function (c, d) {
    var e = d[c.id];
    if (!e) {
        e = d[c.id] = {}
    }
    if (!e._type) {
        var b = inherit(c);
        b.owner = d._type;
        e._type = {c: c.c, owner: b};
        e._owner = new Listeners()
    }
    return e
};
types.object.view = function (a, b) {
    return new ObjectView(a)
};
types.interval = inherit(types.integer);
types.interval.fromstr = function (c, e, b) {
    var f = string2enum(c.values, e);
    if (f == null) {
        f = string2interval(e, c.scale);
        if (f == null || !iminmax(c, f)) {
            return null
        }
    }
    if (b && b.ranges) {
        var a = b.ranges;
        for (var d = 0; d < a.length; d += 2) {
            if (iminmax(f, a[d], a[d + 1])) {
                return f
            }
        }
        return null
    }
    return f
};
types.interval.tostr = function (a, b) {
    if (!b) {
        b = a.def || 0
    }
    return enum2string(a.values, b) || interval2string(b, a.scale || 1)
};
types.interval.deflimit = function (a) {
    var b = this.tostr(a, a.min || 0) + "..";
    if (a.max != null) {
        b += this.tostr(a, a.max)
    }
    return b
};
types.interval.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.age = inherit(types.def);
types.age.get = function (a, b) {
    var c = b[a.id || 0];
    if (c == null) {
        return null
    }
    if (a.scale) {
        c = Math.floor(c / a.scale)
    }
    return c
};
types.age.tostr = function (a, c) {
    var b = getUptime();
    c = Math.abs(c - b);
    return enum2string(a.values, c) || interval2string(c, 1)
};
types.age.listen = function (b, a) {
    ticker.listen(a)
};
types.age.unlisten = function (b, a) {
    ticker.unlisten(a)
};
types.age.matcher = function (a, b, c) {
    return types.number.matcher(a, b, c)
};
types.age.filter = function (a, b) {
    if (b) {
        return [OP_IS, OP_IS_NOT, OP_LS, OP_LEQ, OP_GT, OP_GEQ]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.as = inherit(types.number);
types.as.fromstr = function (c, f) {
    var e = f.split(".");
    if (e.length == 2) {
        var d = string2int(e[0]);
        if (d == null || d < 0 || d >= 65536) {
            return null
        }
        var a = string2int(e[1]);
        if (a == null || a < 0 || a >= 65536) {
            return null
        }
        return d * 65536 + a
    }
    var b = string2int(f);
    if (b == null || b < 0) {
        return null
    }
    return b
};
types.community = inherit(types.def);
types.community.values = {
    type: "static",
    map: {0: "internet", 4294967041: "no export", 4294967042: "no advertise", 4294967043: "local as"}
};
types.community.get = function (a, b) {
    if (b[a.id || 0] == null) {
        return null
    }
    return [b[a.id || 0], b[a.highid || 1] || 0]
};
types.community.put = function (a, b, c) {
    if (c == null) {
        c = [0, 0]
    }
    b[a.id || 0] = c[0];
    b[a.highid || 1] = c[1]
};
types.community.remove = function (a, b) {
    delete b[a.id || 0];
    delete b[a.highid || 0]
};
types.community.tostr = function (a, c) {
    if (c == null) {
        c = [0, 0]
    }
    var b = enum2string(this.values, c[0]);
    if (b) {
        return b
    }
    return c[0] + ":" + c[1]
};
types.community.fromstr = function (b, f) {
    var e = string2enum(this.values, f);
    if (e != null) {
        return [e, 0]
    }
    var a = f.split(":");
    if (a.length != 2) {
        return null
    }
    var d = string2int(a[0]);
    if (d == null || d < 0) {
        return null
    }
    var c = string2int(a[1]);
    if (c == null || c < 0) {
        return null
    }
    return [d, c]
};
types.community.view = function (a, b) {
    a.values = types.community.values;
    return types.def.view(a, b)
};
types.string = inherit(types.def);
types.string.hasValue = function (a, b) {
    return b.length > 0
};
types.string.tostr = function (a, b) {
    if (b != null) {
        return b
    }
    if (a.defuser) {
        return sysres.user
    }
    return a.def || ""
};
types.string.fromstr = function (b, c, a) {
    if (!minmax(c.length, b.min, b.max)) {
        return null
    }
    if (a && a.prefixes) {
        if (!hasOneOfPrefixes(a.prefixes, c)) {
            return null
        }
    }
    return c
};
types.string.less = function (d, e, c) {
    function f(k) {
        for (var j = k.length - 1; j >= 0; --j) {
            var l = k.charCodeAt(j);
            if (l < 48 || l > 57) {
                return j + 1
            }
        }
        return 0
    }

    var b = f(e);
    if (b != e.length) {
        var a = f(c);
        if (a != c.length && b == a) {
            var h = e.slice(0, b);
            var g = c.slice(0, a);
            if (h < g) {
                return true
            }
            if (h > g) {
                return false
            }
            return parseInt(e.slice(b)) < parseInt(c.slice(a))
        }
    }
    return e < c
};
types.string.deflimit = function (a) {
    return ""
};
types.string.addlimit = function (b, a, c) {
    if (!a.prefixes) {
        a.prefixes = []
    }
    a.prefixes.push(c);
    return true
};
types.string.matcher = function (a, c, d) {
    var b = ftype(arr).fromstr(a, trim(d));
    if (b == null) {
        return null
    }
    switch (c) {
        case OP_CONTAIN:
            return function (e) {
                return e.indexOf(b) != -1
            };
        case OP_CONTAIN_NOT:
            return function (e) {
                return e.indexOf(b) == -1
            };
        case OP_IS:
            return function (e) {
                return e == b
            };
        case OP_IS_NOT:
            return function (e) {
                return e != b
            }
    }
    return function (e) {
        return true
    }
};
types.string.filter = function (a, b) {
    if (b) {
        return [OP_CONTAIN, OP_CONTAIN_NOT, OP_IS, OP_IS_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.version = inherit(types.string);
types.version.less = function (a, c, b) {
    return string2version(c) < string2version(b)
};
types.secret = inherit(types.string);
types.secret.cell = function (d, b, c, f) {
    if (b.cond && !b.cond.isTrue(c)) {
        return null
    }
    var e = "";
    if (f != null || !b.opt) {
        e = ftype(b).tostr(b, f)
    }
    if (hidePasswords) {
        var a = "";
        while (a.length < e.length) {
            a += "*"
        }
        e = a
    }
    return e != "" ? itxt(d, null, e) : null
};
types.secret.listen = function (b, a) {
    hidePasswordsLstn.listen(a)
};
types.secret.unlisten = function (b, a) {
    hidePasswordsLstn.unlisten(a)
};
types.secret.view = function (a, b) {
    if (b || a.values) {
        return types.def.view(a, b)
    }
    if (a.opt) {
        return new OptView(a, new SecretView(a))
    }
    return new SecretView(a)
};
types.script = inherit(types.string);
types.script.view = function (a, b) {
    if (b) {
        return ROTextView(a, 5)
    }
    return new TextAreaView(a)
};
types.packet = inherit(types.string);
types.packet.view = function (a, b) {
    return new ROPreTextView(a)
};
types.multilinestring = inherit(types.string);
types.multilinestring.view = function (a, b) {
    if (b) {
        return new ROTextView(a, a.lines)
    }
    return new TextAreaView(a)
};
types.stringarray = inherit(types.def);
types.stringarray.tostr = function (a, b) {
    if (b == null) {
        return null
    }
    return b.join("\n")
};
types.stringarray.view = function (a, b) {
    return new ROTextView(a, a.rows)
};
types.ipaddr = inherit(types.def);
types.ipaddr.hasValue = function (a, b) {
    return b != 0
};
types.ipaddr.tostr = function (a, b) {
    return ipaddr2string(b || a.def || 0)
};
types.ipaddr.fromstr = function (a, b) {
    var c = string2ipaddr(b);
    if (c == null) {
        return null
    }
    if (a.zeroinvalid && (c == 0)) {
        return null
    }
    return c
};
types.ipaddr.less = function (a, c, b) {
    c = ntohl(c);
    b = ntohl(b);
    if (c < 0) {
        if (b >= 0) {
            return false
        }
        return c < b
    } else {
        if (b < 0) {
            return true
        }
    }
    return c < b
};
types.ipaddr.matcher = function (a, c, d) {
    var b = types.network.fromstr({range: 1}, d);
    if (b == null) {
        return null
    }
    switch (c) {
        case OP_IN:
            return function (e) {
                return (e >= b[1] && e <= b[0]) ^ 0
            };
        case OP_IN_NOT:
            return function (e) {
                return (e >= b[1] && e <= b[0]) ^ 1
            }
    }
    return function (e) {
        return true
    }
};
types.ipaddr.filter = function (a, b) {
    if (b) {
        return [OP_IN, OP_IN_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.ipaddrandport = inherit(types.def);
types.ipaddrandport.get = function (a, b) {
    return [b[a.id || 0], b[a.portid || 1]]
};
types.ipaddrandport.put = function (a, b, c) {
    if (c == null) {
        c = [0, 0]
    }
    b[a.id || 0] = c[0];
    b[a.portid || 1] = c[1]
};
types.ipaddrandport.remove = function (a, b) {
    delete b[a.id || 0];
    delete b[a.portid || 0]
};
types.ipaddrandport.tostr = function (a, c) {
    var b = ipaddr2string(c[0]);
    if (c[1]) {
        b += ":" + c[1]
    }
    return b
};
types.ipaddrandport.fromstr = function (a, b) {
    return null
};
types.ipaddrandport.less = function (c, e, d) {
    var b = ntohl(e[0]);
    var a = ntohl(d[0]);
    if (b < a) {
        return true
    }
    if (b > a) {
        return false
    }
    return e[1] < d[2]
};
types.netmask = inherit(types.def);
types.netmask.fromstr = function (b, c) {
    var a = string2int(c);
    if (a != null) {
        if (a < 0 || a > 32) {
            return null
        }
        return len2netmask(a)
    }
    return string2ipaddr(c)
};
types.netmask.tostr = function (a, b) {
    return netmask2len(b).toString()
};
types.netmask.less = function (a, c, b) {
    return ntohl(c) < ntohl(b)
};
types.network = inherit(types.def);
types.network.get = function (b, c) {
    var d = c[b.id || 0];
    if (d == null) {
        return null
    }
    var a = c[b.maskid || 1];
    return [d, a]
};
types.network.put = function (a, b, c) {
    if (c == null) {
        c = [0, 0]
    }
    b[a.id || 0] = c[0];
    b[a.maskid || 1] = c[1]
};
types.network.remove = function (a, b) {
    delete b[a.id || 0];
    delete b[a.maskid || 0]
};
types.network.tostr = function (c, f) {
    if (f == null) {
        f = [0, 0]
    }
    var g = f[0] || 0;
    var b = f[1];
    if (b == undefined) {
        b = c.deflen || 0
    }
    var e = ipaddr2string(g);
    if (c.range) {
        if (g == b) {
            return e
        }
        for (var d = 31; d >= 0; --d) {
            var a = int2num(~len2netmask(d));
            if (int2num(g | a) == int2num(b) && (g & a) == 0) {
                return e + "/" + d
            }
        }
        return e + "-" + ipaddr2string(b)
    }
    return e + "/" + netmask2len(b)
};
types.network.fromstr = function (e, h) {
    if (e.range) {
        var d = h.split("-", 2);
        if (d.length == 2) {
            var g = string2ipaddr(d[0]);
            var f = string2ipaddr(d[1]);
            if (g === null || f === null) {
                return null
            }
            return [g, f]
        }
    }
    var d = h.split("/", 2);
    var j = string2ipaddr(d[0]);
    if (j == null) {
        return null
    }
    var c = 4294967295;
    if (d.length == 2) {
        c = string2ipaddr(d[1]);
        if (c == null) {
            var b = string2int(d[1]);
            if (b == null || b > 32) {
                return null
            }
            c = len2netmask(b)
        }
    }
    if (e.range) {
        return [j & c, j | ~c]
    }
    if (!e.hostnonzero && (j & ~c) != 0) {
        return null
    }
    if (e.zeroinvalid && (j == 0)) {
        return null
    }
    return [j, c]
};
types.network.less = function (c, e, d) {
    var b = ntohl(e[0]);
    var a = ntohl(d[0]);
    if (b < 0) {
        if (a >= 0) {
            return false
        }
    } else {
        if (a < 0) {
            return true
        }
    }
    if (b < a) {
        return true
    }
    if (b > a) {
        return false
    }
    return ntohl(e[1]) < ntohl(d[1])
};
types.network.matcher = function (a, c, e) {
    var b = this.fromstr(a, e);
    if (b == null) {
        return null
    }
    if ((b[0] & ~b[1]) != 0) {
        return null
    }
    var d = null;
    if (a.range) {
        b[0] = ntohl(b[0]);
        b[1] = ntohl(b[1]);
        d = function (f) {
            var h = ntohl(f[0]);
            var g = ntohl(f[1]);
            return h >= b[0] && h <= b[1] && g <= b[1]
        }
    } else {
        d = function (f) {
            var h = f[0];
            var g = h | (~f[1]);
            return b[0] == (h & b[1]) && b[0] == (g & b[1])
        }
    }
    switch (c) {
        case OP_IS:
            return function (f) {
                return b[0] == f[0] && b[1] == f[1]
            };
        case OP_IN:
            return function (f) {
                return d(f) ^ 0
            };
        case OP_IN_NOT:
            return function (f) {
                return d(f) ^ 1
            }
    }
    return function (f) {
        return true
    }
};
types.network.filter = function (a, b) {
    if (b) {
        if (a.range) {
            return [OP_IN, OP_IN_NOT]
        }
        return [OP_IN, OP_IS, OP_IN_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.ip6addr = inherit(types.def);
types.ip6addr.get = function (a, b) {
    var c = b[a.id || 0];
    if (c == null) {
        return null
    }
    if (a.ifaceid) {
        return [c, b[a.ifaceid] || 0]
    }
    return c
};
types.ip6addr.put = function (a, b, c) {
    if (a.ifaceid) {
        if (c == null) {
            c = [fillarray(0, 16), 0]
        }
        b[a.id] = c[0];
        b[a.ifaceid] = c[1]
    } else {
        b[a.id || 0] = c != null ? c : fillarray(0, 16)
    }
};
types.ip6addr.remove = function (a, b) {
    delete b[a.id || 0];
    if (a.ifaceid) {
        delete b[a.ifaceid]
    }
};
types.ip6addr.tostr = function (a, c) {
    if (c == null) {
        return "::"
    }
    if (a.ifaceid) {
        if (!a.ifaces) {
            a.ifaces = {type: "dynamic", path: [20, 0]}
        }
        var b = ip6addr2string(c[0]);
        if (c[1]) {
            var d = enum2string(a.ifaces, c[1]) || "unknown";
            return b + "%" + d
        }
        return b
    }
    return ip6addr2string(c)
};
types.ip6addr.fromstr = function (d, g) {
    var c = 0;
    if (d.ifaceid) {
        if (!d.ifaces) {
            d.ifaces = {type: "dynamic", path: [20, 0]}
        }
        var b = g.split("%");
        if (b.length > 2) {
            return null
        }
        if (b.length == 2) {
            g = b[0];
            c = string2enum(d.ifaces, b[1]);
            if (c == null) {
                return null
            }
        }
    }
    var h = string2ip6addr(g);
    if (h == null) {
        return null
    }
    if (d.zeroinvalid) {
        var f = false;
        for (var e = 0; e < 16; ++e) {
            if (h[e]) {
                f = true;
                break
            }
        }
        if (!f) {
            return null
        }
    }
    return d.ifaceid ? [h, c] : h
};
types.ip6addr.listen = function (b, a) {
    if (b.ifaceid) {
        if (!b.ifaces) {
            b.ifaces = {type: "dynamic", path: [20, 0]}
        }
        enm.dynamic.listen(b.ifaces, a)
    }
    types.def.listen(b, a)
};
types.ip6addr.unlisten = function (b, a) {
    if (b.ifaceid) {
        enm.dynamic.unlisten(b.ifaces, a)
    }
    types.def.unlisten(b, a)
};
types.network6 = inherit(types.network);
types.network6.put = function (a, b, c) {
    if (c == null) {
        c = [fillarray(0, 16), 0]
    }
    b[a.id || 0] = c[0];
    b[a.maskid || 1] = c[1]
};
types.network6.tostr = function (a, b) {
    if (b == null) {
        return "::/" + (a.deflen || 0)
    }
    var c = b[0] != null ? ip6addr2string(b[0]) : "::";
    if (b[1] == 128) {
        return c
    }
    return c + "/" + (b[1] || 0)
};
types.network6.fromstr = function (c, f) {
    var b = f.split("/");
    var g = string2ip6addr(b[0]);
    if (g == null) {
        return null
    }
    var a = 128;
    if (b.length == 2) {
        a = string2int(b[1]);
        if (a == null || a < 0 || a > 128) {
            return null
        }
    }
    if (!c.hostnonzero && a != 128) {
        var d = 15;
        for (var e = 128; e - 8 > a; e -= 8) {
            if (g[d--]) {
                return null
            }
        }
        if (g[d] & ((1 << (8 - (a & 7))) - 1)) {
            return null
        }
    }
    if (c.zeroinvalid) {
        for (var d = 0; d < 16; ++d) {
            if (g[d]) {
                return [g, a]
            }
        }
        return null
    }
    return [g, a]
};
types.macaddr = inherit(types.def);
types.macaddr.put = function (a, b, c) {
    if (c == null) {
        c = [0, 0, 0, 0, 0, 0]
    }
    b[a.id || 0] = c
};
types.macaddr.hasValue = function (a, c) {
    if (c == null) {
        return false
    }
    for (var b = 0; b < 6; ++b) {
        if (c[b]) {
            return true
        }
    }
    return false
};
types.macaddr.tostr = function (a, f) {
    if (f == null || f.length == 0) {
        if (a.randomdef) {
            f = [];
            f.push(2);
            for (var b = 1; b < 6; ++b) {
                f.push(Math.floor(Math.random() * 257))
            }
        } else {
            var e = a.def || 0;
            f = [e, e, e, e, e, e]
        }
    }
    var c = "";
    for (var b = 0; b < 6; ++b) {
        if (c.length > 0) {
            c += ":"
        }
        if (f[b] < 16) {
            c += "0"
        }
        c += (f[b].toString(16)).toUpperCase()
    }
    return c
};
types.macaddr.fromstr = function (d, g, b) {
    if (b && b.prefixes) {
        if (!hasOneOfPrefixes(b.prefixes, g)) {
            return null
        }
    }
    var e = 0;
    var c = false;
    var h = [];
    while (e < g.length) {
        var f = g.substr(e, 1);
        if (!isNaN(parseInt(f, 16))) {
            var a = 1;
            if (e + 1 < g.length) {
                if (!isNaN(parseInt(g.substr(e + 1, 1), 16))) {
                    ++a
                }
            }
            h.push(parseInt(g.substr(e, a), 16));
            e += a;
            c = true
        } else {
            if (f == " ") {
                ++e
            } else {
                if (f == ":" || f == "-") {
                    if (!c) {
                        return null
                    }
                    c = false;
                    ++e
                } else {
                    return null
                }
            }
        }
    }
    if (h.length == 0) {
        h = [0, 0, 0, 0, 0, 0]
    }
    if (h.length != 6) {
        return null
    }
    return h
};
types.macaddr.deflimit = function (a) {
    return ""
};
types.macaddr.addlimit = function (b, a, c) {
    if (!a.prefixes) {
        a.prefixes = []
    }
    a.prefixes.push(c);
    return true
};
types.macaddr.matcher = function (a, c, d) {
    var b = this.fromstr(a, d);
    if (b == null) {
        return null
    }
    switch (c) {
        case OP_IN:
            return function (e) {
                if (e.length == 0) {
                    return ((b.length == 0) ^ 0)
                }
                if (e.length != 6) {
                    return false
                }
                for (var f in e) {
                    if (e[f] != b[f]) {
                        return false
                    }
                }
                return true
            };
        case OP_IN_NOT:
            return function (e) {
                if (e.length == 0) {
                    return ((b.length == 0) ^ 1)
                }
                if (e.length != 6) {
                    return false
                }
                for (var f in e) {
                    if (e[f] != b[f]) {
                        return true
                    }
                }
                return false
            }
    }
    return function (e) {
        return true
    }
};
types.macaddr.filter = function (a, b) {
    if (b) {
        return [OP_IN, OP_IN_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.macnetwork = inherit(types.def);
types.macnetwork.get = function (b, c) {
    var d = c[b.id];
    var a = c[b.maskid];
    if (d == null || a == null) {
        return null
    }
    return [d, a]
};
types.macnetwork.put = function (a, b, c) {
    b[a.id] = c[0];
    b[a.maskid] = c[1]
};
types.macnetwork.hasValue = function (a, c) {
    if (c == null) {
        return false
    }
    for (var b = 0; b < 6; ++b) {
        if (c[0][b] || c[1][b]) {
            return true
        }
    }
    return false
};
types.macnetwork.tostr = function (a, c) {
    if (c == null || c[0].length == 0) {
        return types.macaddr.tostr(a, null)
    }
    var b = types.macaddr.tostr(a, c[0]);
    if (hasall(c[0], 0)) {
        if (hasall(c[1], 0)) {
            return b
        }
    } else {
        if (hasall[1], 255) {
            return b
        }
    }
    return b + "/" + types.macaddr.tostr(a, c[1])
};
types.macnetwork.fromstr = function (c, e, b) {
    var d = e.split("/");
    var f = types.macaddr.fromstr(c, d[0], b);
    if (f == null) {
        return null
    }
    var a;
    if (d[1]) {
        a = types.macaddr.fromstr(c, d[1]);
        if (a == null) {
            return null
        }
    } else {
        if (!hasall(f, 0)) {
            a = [255, 255, 255, 255, 255, 255]
        } else {
            a = [0, 0, 0, 0, 0, 0]
        }
    }
    return [f, a]
};
types.macnetwork.deflimit = function (a) {
    return types.macaddr.deflimit(a)
};
types.macnetwork.addlimit = function (b, a, c) {
    return types.macaddr.addlimit(b, a, c)
};
types.date = inherit(types.def);
types.date.tostr = function (a, b) {
    return dateAndTime2string(getDate(b), getTime(b), false)
};
types.date.fromstr = function (b, a, c) {
    return null
};
types.dateandtime = inherit(types.def);
types.dateandtime.get = function (a, b) {
    if (a.timeid) {
        if (b[a.id] == null) {
            return null
        }
        return [b[a.id], b[a.timeid]]
    }
    var c = b[a.id];
    if (c == null) {
        return null
    }
    return [getDate(c), getTime(c)]
};
types.dateandtime.put = function (a, b, c) {
    if (a.timeid) {
        b[a.id] = c[0];
        b[a.timeid] = c[1]
    } else {
        b[a.id] = c[0] + c[1]
    }
};
types.dateandtime.remove = function (a, b) {
    delete b[a.id];
    if (a.timeid) {
        delete b[a.timeid]
    }
};
types.dateandtime.tostr = function (a, e) {
    if (e == null) {
        var c = a.todaydef ? getDate(getNow()) : (a.def || 0);
        e = [c, 0]
    }
    var b = enum2string(a.values, e[0]);
    return b != null ? b : dateAndTime2string(e[0], e[1], true)
};
types.dateandtime.fromstr = function (e, g) {
    var c = string2enum(e.values, g);
    if (c != null) {
        return [c, 0]
    }
    var b = g.split(" ");
    var f = 0;
    if (b.length > 2) {
        return null
    }
    if (b.length == 2) {
        f = string2interval(b[1]);
        if (f == null) {
            return null
        }
    }
    var d = string2date(b[0]);
    if (d == null) {
        return null
    }
    return [d, f]
};
types.clocktime = inherit(types.def);
types.clocktime.put = function (a, b, c) {
    b[a.id] = getDate(b[a.id] || 0) + c
};
types.clocktime.tostr = function (a, b) {
    if (b == null) {
        b = getNow()
    }
    return interval2string(getTime(b))
};
types.clocktime.fromstr = function (a, b) {
    return string2interval(b)
};
types.clockdate = inherit(types.def);
types.clockdate.put = function (a, b, c) {
    b[a.id] = getTime(b[a.id] || 0) + c
};
types.clockdate.tostr = function (a, b) {
    if (b == null) {
        b = getNow()
    }
    return date2string(getDate(b))
};
types.clockdate.fromstr = function (a, b) {
    return string2date(b)
};
types.timezone = inherit(types.def);
types.timezone.tostr = function (a, b) {
    return timezone2string(num2int(b) || 0)
};
types.timezone.fromstr = function (a, b) {
    return string2timezone(b)
};
types.enm = inherit(types.def);
types.enm.get = function (a, b) {
    var c = b[a.id || 0];
    return c != null ? int2num(c) : null
};
types.enm.tostr = function (a, c) {
    if (c == null) {
        if (a.def != null) {
            c = a.def
        } else {
            if (a.c) {
                var b = ftype(a.c[0]).tostr(a.c[0], null);
                c = ftype(a.c[0]).fromstr(a.c[0], b)
            } else {
                c = 0
            }
        }
    }
    var b = enum2string(a.values, c);
    if (b != null) {
        return b
    }
    if (a.c) {
        return ftype(a.c[0]).tostr(a.c[0], c)
    }
    if (a.opt) {
        return ""
    }
    return "unknown"
};
types.enm.fromstr = function (c, e, b) {
    if (e == "") {
        return null
    }
    if (b && b.prefixes && !hasOneOfPrefixes(b.prefixes, e)) {
        return null
    }
    var d = string2enum(c.values, e);
    if (d != null) {
        if (!c.c || !b || !b.inner || ftype(c.c[0]).fromstr(c.c[0], e) == null) {
            return d
        }
    }
    if (c.c) {
        var a = b ? b.inner : null;
        return ftype(c.c[0]).fromstr(c.c[0], e, a)
    }
    return null
};
types.enm.less = function (a, c, b) {
    return types.enm.tostr(a, c) < types.enm.tostr(a, b)
};
types.enm.hasValue = function (a, b) {
    if (a.c && ftype(a.c[0]).hasValue(a.c[0], b)) {
        return true
    }
    return enum2string(a.values, b) != null
};
types.enm.view = function (b, c) {
    if (c) {
        return new ROTextView(b)
    }
    var a;
    if (b.c) {
        a = new ComboView(b)
    } else {
        if (b.radio) {
            a = new RadioView(b)
        } else {
            a = new EnumView(b)
        }
    }
    if (b.opt) {
        a = new OptView(b, a)
    }
    return a
};
types.enm.deflimit = function (b) {
    if (b.c) {
        var a = ftype(b.c[0]).deflimit(b.c[0]);
        if (a != null) {
            return a
        }
    }
    return ""
};
types.enm.addlimit = function (b, a, e) {
    var d = false;
    if (e[0] == "!") {
        d = true;
        e = e.substr(1)
    }
    if (a.invert && !d) {
        return
    }
    if (!a.invert && d) {
        a.prefixes = null;
        a.invert = true
    }
    if (!d && b.c) {
        var c = enm[b.values.type];
        if (!c || !hasPrefixIn(e, c.getMap(b.values))) {
            if (!a.inner) {
                a.inner = {}
            }
            if (ftype(b.c[0]).addlimit(b.c[0], a.inner, e)) {
                return true
            }
        }
    }
    if (!a.prefixes) {
        a.prefixes = []
    }
    a.prefixes.push(e);
    return true
};
types.enm.matcher = function (b, d, g) {
    var e = this;
    var a = -1;
    var f = enm.defenum.getMap(b);
    for (var c in f) {
        if (f[c] == g) {
            a = c;
            break
        }
    }
    switch (d) {
        case OP_CONTAIN:
            return function (h) {
                return e.tostr(b, h).indexOf(g) != -1
            };
        case OP_CONTAIN_NOT:
            return function (h) {
                return e.tostr(b, h).indexOf(g) == -1
            };
        case OP_IS:
            return function (h) {
                return h == a
            };
        case OP_IS_NOT:
            return function (h) {
                return h == a
            }
    }
    return function (h) {
        return true
    }
};
types.enm.filter = function (a, b) {
    if (b) {
        if (a.c) {
            return ftype(a.c[0]).filter(a.c[0], true)
        }
        return [OP_CONTAIN, OP_CONTAIN_NOT, OP_IS, OP_IS_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.set = inherit(types.def);
types.set.get = function (b, c) {
    var d = c[b.id || 0];
    if (d == null) {
        return null
    }
    if (b.id && b.id.charAt(0) == "U") {
        if (d.length == 0) {
            return null
        }
        return [d[0], (d[1] != null ? d[1] : ~d[0])]
    }
    var a = null;
    if (b.maskid) {
        a = c[b.maskid]
    }
    if (!b.id) {
        a = c[1]
    }
    return [d, (a != null ? a : ~d)]
};
types.set.put = function (a, b, c) {
    if (a.id && a.id.charAt(0) == "U") {
        b[a.id] = c
    } else {
        b[a.id || 0] = c[0];
        if (!a.id || a.maskid) {
            b[a.maskid || 1] = c[1]
        }
    }
};
types.set.remove = function (a, b) {
    delete b[a.id || 0];
    if (a.maskid) {
        delete b[a.maskid]
    }
};
types.set.tostr = function (b, f) {
    if (f == null) {
        return ""
    }
    var a = b.values;
    var e = enm[a.type];
    if (!e) {
        return "###"
    }
    var c = "";
    for (i = 0; i < 32; ++i) {
        if (f[0] & (1 << i)) {
            var d = e.toString(i, a);
            if (d) {
                if (c != "") {
                    c += ", "
                }
                c += d
            }
        }
    }
    return c
};
types.set.less = function (a, c, b) {
    return types.set.tostr(a, c) < types.set.tostr(a, b)
};
types.set.listen = function (b, a) {
    var c = enm[b.values.type];
    if (c && c.listen) {
        c.listen(b.values, a)
    }
};
types.set.unlisten = function (b, a) {
    var c = enm[b.values.type];
    if (c && c.unlisten) {
        c.unlisten(b.values, a)
    }
};
types.set.view = function (a, b) {
    return new SetView(a, b)
};
types.set.deflimit = function (a) {
    return ""
};
types.set.addlimit = function (b, a, d) {
    var c = false;
    if (d[0] == "!") {
        c = true;
        d = d.substr(1)
    }
    if (a.invert && !c) {
        return
    }
    if (!a.invert && c) {
        a.prefixes = null;
        a.invert = true
    }
    if (!a.prefixes) {
        a.prefixes = []
    }
    a.prefixes.push(d);
    return true
};
types.set.matcher = function (a, c, e) {
    var d = enm.defenum.getMap(a);
    var f = null;
    for (var b in d) {
        if (d[b] == e) {
            f = b;
            break
        }
    }
    if (f == null) {
        return null
    }
    switch (c) {
        case OP_CONTAIN:
            return function (g) {
                return ((g[0] & (1 << f)) != 0) ^ 0
            };
        case OP_CONTAIN_NOT:
            return function (g) {
                return ((g[0] & (1 << f)) != 0) ^ 1
            }
    }
    return function (g) {
        return true
    }
};
types.set.filter = function (a, b) {
    if (b) {
        return [OP_CONTAIN, OP_CONTAIN_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.objtype = inherit(types.def);
types.objtype.view = function (a, b) {
    return new ROTextView(a)
};
types.objtype.get = function (a, b) {
    return b._type ? b._type.title : "unknown"
};
types.objtype.matcher = function (a, b, c) {
    return types.string.matcher(a, b, c)
};
types.objtype.filter = function (a, b) {
    if (b) {
        return [OP_CONTAIN, OP_CONTAIN_NOT, OP_IS, OP_IS_NOT]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.label = inherit(types.def);
types.label.view = function (a, b) {
    return null
};
types.tuple = inherit(types.def);
types.tuple.get = function (c, e, b) {
    if (c.own) {
        return e[0]
    }
    var f = [];
    for (var d in c.c) {
        var a = ftype(c.c[d]).get(c.c[d], e);
        if (b && a == null) {
            return null
        }
        f.push(a)
    }
    return f
};
types.tuple.put = function (a, c, d) {
    if (a.own) {
        c[0] = d;
        return
    }
    for (var b in a.c) {
        ftype(a.c[b]).put(a.c[b], c, d[b])
    }
};
types.tuple.remove = function (a, c) {
    if (a.own) {
        delete c[0];
        return
    }
    for (var b in a.c) {
        ftype(a.c[b]).remove(a.c[b], c)
    }
};
types.tuple.tostr = function (b, f) {
    var e = "";
    var a = b.sep || "/";
    for (var c in f) {
        var d = tostr(b.c[c], f[c]);
        if (d.length > 0 && e.length > 0) {
            e += a
        }
        e += d
    }
    return e
};
types.tuple.fromstr = function (b, f) {
    var d = [];
    var e = f.split(b.sep || "/");
    for (var c in b.c) {
        var a = ftype(b.c[c]).fromstr(b.c[c], c < e.length ? e[c] : "");
        if (a == null) {
            return null
        }
        d.push(a)
    }
    return d
};
types.tuple.less = function (a, d, c) {
    for (var b in a.c) {
        if (d[b] == null) {
            return c[b] != null
        }
        if (c[b] == null) {
            return false
        }
        if (ftype(a.c[b]).less(a.c[b], d[b], c[b])) {
            return true
        }
        if (ftype(a.c[b]).less(a.c[b], c[b], d[b])) {
            return false
        }
    }
    return false
};
types.tuple.view = function (a, b) {
    if (!a.separate || b) {
        return types.def.view(a, b)
    }
    return new TupleView(a)
};
types.tuple.deflimit = function (a) {
    if (a.separate) {
        return ""
    }
    return null
};
types.tuple.addlimit = function (a) {
    return null
};
types.tuple.limit = function (c, e) {
    if (!c.separate) {
        return types.def.limit(c, e)
    }
    var b = [];
    var f = e.split(";");
    for (var d in f) {
        if (f[d].length == 0) {
            continue
        }
        if (c.c[d] == null) {
            return null
        }
        if (c.c[d].ro) {
            return null
        }
        var a = ftype(c.c[d]).limit(c.c[d], f[d]);
        if (a == null) {
            return null
        }
        b[d] = a
    }
    if (f.length == 1) {
        for (var d = 1; d < c.c.length; ++d) {
            b[d] = b[0]
        }
    }
    return {limits: b}
};
types.union = inherit(types.def);
types.union.get = function (b, e) {
    if (b.id) {
        var c = e[b.id] || 0;
        if (c < b.c.length) {
            var f = ftype(b.c[c]).get(b.c[c], e, true);
            if (f != null) {
                return [c, f]
            }
        }
        return null
    } else {
        if (b.single) {
            for (var c in b.c) {
                var f = ftype(b.c[c]).get(b.c[c], e, true);
                if (f != null) {
                    return [c, f]
                }
            }
            return [(b.def || 0), null]
        } else {
            var a = [];
            for (var c in b.c) {
                a.push(ftype(b.c[c]).get(b.c[c], e))
            }
            return a
        }
    }
};
types.union.put = function (c, e, f) {
    if (c.single) {
        if (f == null) {
            f = [0, null];
            for (var d in c.c) {
                if (c.c[d].opt) {
                    f[0] = d;
                    break
                }
            }
        }
        for (var d in c.c) {
            var b = c.c[d];
            if (d != f[0]) {
                ftype(b).remove(b, e)
            }
        }
        var b = c.c[f[0]];
        ftype(b).put(b, e, f[1]);
        if (c.id) {
            e[c.id] = f[0]
        }
    } else {
        if (f == null) {
            f = []
        }
        for (var d in c.c) {
            if (f[d] != null) {
                ftype(c.c[d]).put(c.c[d], e, f[d])
            }
        }
    }
};
types.union.remove = function (a, c) {
    for (var b in a.c) {
        ftype(a.c[b]).remove(a.c[b], c)
    }
};
types.union.hasValue = function (c, e) {
    if (c.single) {
        if (e[1] == null) {
            return false
        }
        var b = c.c[e[0]];
        return ftype(b).hasValue(b, e[1])
    }
    for (var d in e) {
        if (e[d] != null && ftype(c.c[d]).hasValue(c.c[d], e[d])) {
            return true
        }
    }
    return false
};
types.union.tostr = function (c, e) {
    if (c.single) {
        var b = c.c[e[0]];
        return ftype(b).tostr(b, e[1])
    } else {
        for (var d in e) {
            if (e[d] != null && ftype(c.c[d]).hasValue(c.c[d], e[d])) {
                return ftype(c.c[d]).tostr(c.c[d], e[d])
            }
        }
        return ftype(c.c[0]).tostr(c.c[0], e[0])
    }
};
types.union.fromstr = function (b, e) {
    if (b.single) {
        for (var c in b.c) {
            var a = ftype(b.c[c]).fromstr(b.c[c], e);
            if (a != null) {
                return [c, a]
            }
        }
        return null
    } else {
        var d = new Array(b.c.length);
        for (var c in b.c) {
            d[c] = ftype(b.c[c]).fromstr(b.c[c], e);
            if (d[c] != null) {
                break
            }
        }
        for (var c in b.c) {
            if (d[c] != null) {
                continue
            }
            var e = ftype(b.c[c]).tostr(b.c[c], null);
            d[c] = ftype(b.c[c]).fromstr(b.c[c], e)
        }
        return d
    }
};
types.union.less = function (d, h, g) {
    if (d.single) {
        if (h[0] < g[0]) {
            return true
        }
        if (h[0] > g[0]) {
            return false
        }
        if (h[1] == null) {
            return g[1] != null
        }
        if (g[1] == null) {
            return false
        }
        var b = d.c[h[0]];
        return ftype(b).less(b, h[1], g[1])
    }
    for (var f in h) {
        var e = h[f] != null && ftype(d.c[f]).hasValue(d.c[f], h[f]);
        var c = g[f] != null && ftype(d.c[f]).hasValue(d.c[f], g[f]);
        if (e) {
            if (!c) {
                return false
            }
            return ftype(d.c[f]).less(d.c[f], h[f], g[f])
        } else {
            if (c) {
                return true
            }
        }
    }
    return false
};
types.union.view = function (a, d) {
    if (!a.values) {
        var e = [];
        for (var b in a.c) {
            if (a.c[b].values) {
                e.push(a.c[b].values)
            }
        }
        if (e.length > 0) {
            a.values = {type: "pair", c: e}
        }
    }
    if (!d && !a.single && a.c.length > 1) {
        for (var b = 0; b < a.c.length - 1; ++b) {
            if (!a.c[b].ro) {
                return types.def.view(a, d)
            }
        }
        var c = a.c[a.c.length - 1];
        return ftype(c).view(c, d)
    }
    return types.def.view(a, d)
};
types.union.matcher = function (b, e, f) {
    var c = null;
    var a = null;
    for (var d in b.c) {
        c = ftype(b.c[d]).matcher(b.c[d], e, f);
        if (c) {
            a = d;
            break
        }
    }
    if (a == null) {
        return null
    }
    return function (g) {
        if (b.single) {
            if (g[0] == a) {
                if (c(g[1])) {
                    return true
                }
            }
        } else {
            for (var h in g) {
                if (g[h][0] == a) {
                    if (c(g[h][1])) {
                        return true
                    }
                }
            }
        }
        return false
    }
};
types.union.filter = function (a, b) {
    if (b) {
        return ftype(a.c[0]).filter(a.c[0], true)
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.password = inherit(types.string);
types.password.view = function (a, b) {
    if (b) {
        return new ROTextView(a)
    }
    return new TextView(a, input(null, "password"))
};
types.prefix = inherit(types.def);
types.prefix.get = function (a, b) {
    return ftype(a.c[0]).get(a, b)
};
types.prefix.put = function (a, b, c) {
    ftype(a.c[0]).put(a, b, c)
};
types.prefix.remove = function (a, b) {
    ftype(a.c[0]).remove(a, b)
};
types.prefix.tostr = function (a, c) {
    var b = ftype(a.c[0]).tostr(a.c[0], c);
    if (b == null) {
        return null
    }
    if (b != "") {
        b = a.name + b
    }
    return b
};
types.gridcell = inherit(types.def);
types.gridcell.view = function (a, b) {
    return new CustomView(a, true, function (c, d) {
        c.createGrid()
    })
};
types.separator = inherit(types.def);
types.separator.cfg = function (a, b) {
    return {}
};
types.separator.outside = true;
types.separator.view = function (a, b) {
    return new CustomView(a, true, function (c, d) {
        c.addSeparatorForNext()
    })
};
types.separator.column = function (a, c, b) {
    return null
};
types.tab = inherit(types.def);
types.tab.column = function (a, c, b) {
    return null
};
types.not = inherit(types.def);
types.not.get = function (a, b) {
    return [b[a.id], ftype(a.c[0]).get(a.c[0], b)]
};
types.not.getvalue = function (a, b) {
    return b[a.id]
};
types.not.put = function (a, b, c) {
    if (c instanceof Array) {
        b[a.id] = c[0];
        ftype(a.c[0]).put(a.c[0], b, c[1])
    } else {
        b[a.id] = c
    }
};
types.not.remove = function (a, b) {
    delete b[a.id];
    ftype(a.c[0]).remove(a, b)
};
types.not.tostr = function (a, b) {
    if (b == null) {
        return ftype(a.c[0]).tostr(a.c[0], b)
    }
    return (b[0] ? "!" : "") + ftype(a.c[0]).tostr(a.c[0], b[1])
};
types.not.less = function (a, c, b) {
    if (c[0] < b[0]) {
        return true
    }
    if (c[0] > b[0]) {
        return false
    }
    return ftype(a.c[0]).less(a.c[0], c[1], b[1])
};
types.not.view = function (a, b) {
    return new NotView(a, b, ftype(a.c[0]).view(a.c[0], b))
};
types.not.deflimit = function (a) {
    return ftype(a.c[0]).deflimit(a.c[0])
};
types.not.addlimit = function (b, a, c) {
    return ftype(b.c[0]).addlimit(b.c[0], a, c)
};
types.not.matcher = function (a, b, c) {
    return ftype(a.c[0]).matcher(a.c[0], b, c)
};
types.not.filter = function (a, b) {
    if (b) {
        return ftype(a.c[0]).filter(a.c[0], true)
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.opt = inherit(types.def);
types.opt.VALUE = {};
types.opt.get = function (a, b) {
    if (a.id != null) {
        if (!b[a.id] ^ a.inv) {
            return null
        }
    }
    var c = ftype(a.c[0]).get(a.c[0], b);
    return c != null && ftype(a.c[0]).hasValue(a.c[0], c) ? c : null
};
types.opt.getvalue = function (a, b) {
    if (a.id != null) {
        return b[a.id]
    }
    return ftype(a.c[0]).get(a.c[0], b) != null
};
types.opt.put = function (a, b, c) {
    if (c == null) {
        if (a.id != null) {
            b[a.id] = !a.inv ? 0 : 1
        }
    } else {
        if (a.id != null) {
            b[a.id] = !a.inv ? 1 : 0
        }
        if (c != types.opt.VALUE) {
            ftype(a.c[0]).put(a.c[0], b, c)
        }
    }
};
types.opt.remove = function (a, b) {
    delete b[a.id];
    ftype(a.c[0]).remove(a, b)
};
types.opt.tostr = function (a, b) {
    if (b == null) {
        return ""
    }
    return ftype(a.c[0]).tostr(a.c[0], b)
};
types.opt.hasValue = function (a, b) {
    return b != null
};
types.opt.less = function (a, c, b) {
    return ftype(a.c[0]).less(a.c[0], c, b)
};
types.opt.view = function (a, b) {
    if (b) {
        return new ROTextView(a)
    }
    return new OptView(a, ftype(a.c[0]).view(a.c[0], b))
};
types.opt.deflimit = function (a) {
    return ftype(a.c[0]).deflimit(a.c[0])
};
types.opt.addlimit = function (b, a, c) {
    return ftype(b.c[0]).addlimit(b.c[0], a, c)
};
types.opt.matcher = function (a, b, c) {
    return ftype(a.c[0]).matcher(a.c[0], b, c)
};
types.opt.filter = function (a, b) {
    if (b) {
        return ftype(a.c[0]).filter(a.c[0], true)
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.tristate = inherit(types.def);
types.tristate.get = function (a, b) {
    return [b[0], b[1]]
};
types.tristate.put = function (a, b, c) {
    if (c instanceof Array) {
        b[0] = c[0];
        b[1] = c[1]
    } else {
        b[0] = c
    }
};
types.tristate.remove = function (a, b) {
    delete b[0];
    delete b[1]
};
types.tristate.tostr = function (a, b) {
    if (b == null) {
        return ""
    }
    return (b[0] ? "!" : "") + enum2string(a.values, b[1])
};
types.tristate.less = function (a, c, b) {
    if (c[0] < b[0]) {
        return true
    }
    if (c[0] > b[0]) {
        return true
    }
    return types.tristate.tostr(a, c) < types.tristate.tostr(a, b)
};
types.tristate.view = function (b, c) {
    if (!b.c) {
        var a = {};
        a.type = "enm";
        a.id = 1;
        a.values = b.values;
        b.c = [a]
    }
    return new NotView(b, c, ftype(b.c[0]).view(b.c[0], c))
};
types.tristate.deflimit = function (a) {
    return ""
};
types.tristate.addlimit = function (b, a, c) {
    if (!b.c) {
        return false
    }
    return ftype(b.c[0]).addlimit(b.c[0], a, c)
};
types.multi = inherit(types.def);
types.multi.get = function (a, b) {
    return b[a.id]
};
types.multi.put = function (a, b, c) {
    b[a.id] = c;
    if (a.optid) {
        b[a.optid] = c.length > 0 ? 1 : 0
    }
};
types.multi.remove = function (a, b) {
    delete b[a.id];
    if (a.optid) {
        delete b[a.optid]
    }
};
types.multi.tostr = function (b, e) {
    var d = "";
    for (var c in e) {
        if (d.length > 0) {
            d += ", "
        }
        var a = ftype(b.c[0]).get(b.c[0], e[c]);
        d += ftype(b.c[0]).tostr(b.c[0], a)
    }
    return d
};
types.multi.less = function (c, h, g) {
    var b = c.c[0];
    for (var d in h) {
        if (d == g.length) {
            return false
        }
        var f = ftype(c.c[0]).get(c.c[0], h[d]);
        var e = ftype(c.c[0]).get(c.c[0], g[d]);
        if (f == null) {
            return e != null
        }
        if (e == null) {
            return true
        }
        if (ftype(b).less(b, f, e)) {
            return true
        }
        if (ftype(b).less(b, e, f)) {
            return false
        }
    }
    return h.length < g.length
};
types.multi.view = function (a, b) {
    return new MultiView(a, b, function () {
        return ftype(a.c[0]).view(a.c[0], b)
    })
};
types.multi.deflimit = function (a) {
    return ftype(a.c[0]).deflimit(a.c[0])
};
types.multi.addlimit = function (b, a, c) {
    return ftype(b.c[0]).addlimit(b.c[0], a, c)
};
types.multi.matcher = function (a, c, d) {
    var b = ftype(a.c[0]).matcher(a.c[0], c, d);
    return function (e) {
        var g = defTrue(c);
        for (var f in e) {
            g = b(ftype(a.c[0]).get(a.c[0], e[f]));
            if (g != null) {
                break
            }
        }
        if (c == OP_CONTAIN) {
            if (g == null) {
                g = false
            }
        } else {
            if (g == null) {
                g = true
            }
        }
        return g
    }
};
types.multi.filter = function (b, d) {
    if (d) {
        var c = b.c[0];
        return ftype(c).filter(c, d)
    }
    if (b.name) {
        return b.name
    }
    return ""
};
types.multinumber = inherit(types.multi);
types.multinumber.get = function (c, e) {
    var f = e[c.id];
    if (f == null) {
        return f
    }
    var b = new Array(f.length);
    for (var d in f) {
        b[d] = {0: f[d]}
    }
    return b
};
types.multinumber.put = function (c, e, f) {
    var b = [];
    for (var d in f) {
        if (f[d][0] != null) {
            b.push(f[d][0])
        }
    }
    e[c.id] = b
};
types.multinumberrange = inherit(types.multi);
types.multinumberrange.get = function (c, e) {
    var f = e[c.id];
    if (f == null) {
        return f
    }
    var b = new Array(f.length / 2);
    for (var d = 0; d < f.length; d += 2) {
        b[d / 2] = {0: f[d], 1: f[d + 1]}
    }
    return b
};
types.multinumberrange.put = function (c, e, f) {
    var b = [];
    for (var d in f) {
        if (f[d][0] != null && f[d][1] != null) {
            b.push(f[d][0]);
            b.push(f[d][1])
        }
    }
    e[c.id] = b
};
types.multibignumber = inherit(types.multinumber);
types.multiipaddr = inherit(types.multinumber);
types.multinetwork = inherit(types.multinumberrange);
types.multiip6addr = inherit(types.multinumber);
types.multistring = inherit(types.multinumber);
types.multiraw = inherit(types.multinumber);
types.multibits = inherit(types.multi);
types.multibits.get = function (c, e) {
    var f = e[c.id];
    if (f == null) {
        return null
    }
    var b = [];
    for (var d = 0; d < 32; ++d) {
        if (f & (1 << d)) {
            b.push({0: d})
        }
    }
    return b
};
types.multibits.put = function (b, d, e) {
    var a = 0;
    for (var c in e) {
        if (e[c][0] == null) {
            continue
        }
        a |= 1 << e[c][0]
    }
    d[b.id] = a;
    if (b.maskid) {
        d[b.maskid] = ~a
    }
};
types.multibits.remove = function (a, b) {
    delete b[a.id];
    if (a.maskid) {
        delete b[a.maskid]
    }
};
types.multitristate = inherit(types.multibits);
types.multitristate.get = function (d, f) {
    var g = f[d.id];
    if (g == null) {
        return g
    }
    var b = g;
    if (f[d.maskid] != null) {
        b |= f[d.maskid]
    }
    var c = [];
    for (var e = 0; e < 32; ++e) {
        if (b & (1 << e)) {
            c.push({0: (g & (1 << e)) == 0, 1: e})
        }
    }
    return c
};
types.multitristate.put = function (b, e, f) {
    var a = 0;
    var d = 0;
    for (var c in f) {
        if (f[c][0] == null) {
            continue
        }
        if (f[c][0] == 0) {
            a |= 1 << f[c][1]
        } else {
            d |= 1 << f[c][1]
        }
    }
    e[b.id] = a;
    e[b.maskid] = d
};
types.multitristatearray = inherit(types.multi);
types.multitristatearray.get = function (d, f) {
    var c = f[d.id];
    var g = f[d.oid];
    if (c == null || g == null) {
        return null
    }
    var b = [];
    for (var e in c) {
        b.push({0: 0, 1: c[e]})
    }
    for (var e in g) {
        b.push({0: 1, 1: g[e]})
    }
    return b
};
types.multitristatearray.put = function (b, d, f) {
    var a = [];
    var e = [];
    for (var c in f) {
        if (f[c][0] == null) {
            continue
        }
        if (!f[c][0]) {
            a.push(f[c][1])
        } else {
            e.push(f[c][1])
        }
    }
    d[b.id] = a;
    d[b.oid] = e
};
types.multitristatearray.remove = function (a, b) {
    delete b[a.id];
    delete b[a.oid]
};
types.multituple = inherit(types.multi);
types.multituple.get = function (e, g) {
    var c = [];
    for (var f in e.c) {
        var b = ftype(e.c[f]).get(e.c[f], g);
        for (var d in b) {
            if (c[d] == null) {
                c[d] = {0: new Array(e.c.length)}
            }
            c[d][0][f] = toarray(c[d])
        }
    }
    return c
};
types.multituple.put = function (d, f, g) {
    var b = new Array(d.c.length);
    for (var e in d.c) {
        b[e] = new Array(g.length)
    }
    for (var e in g) {
        if (g[e][0] == null) {
            continue
        }
        for (var c in d.c) {
            b[e][c] = fromarray(g[e][0][c])
        }
    }
    for (var e in d.c) {
        ftype(d.c[e]).put(d.c[e], f, b[e])
    }
};
types.multituple.remove = function (a, c) {
    for (var b in a.c) {
        ftype(a.c[b]).remove(a.c[b], c)
    }
};
types.multituple.tostr = function (c, f) {
    var b = this.attrs(c);
    var e = "";
    for (var d in f) {
        if (e.length > 0) {
            e += ", "
        }
        ftype(b).tostr(b, f[d][0])
    }
    return e
};
types.multituple.view = function (c, d) {
    var b = this.attrs(c);
    return new MultiView(c, d, function () {
        return ftype(b).view(b, d)
    })
};
types.multituple.attrs = function (c) {
    if (c.tuple) {
        return c.tuple
    }
    var b = {type: "tuple", own: 1, c: []};
    for (var d in c.c) {
        b.c.push(c.c[d].c[0])
    }
    return c.tuple = b
};

function findAttr(b, a) {
    for (var c in b) {
        if (b[c].name == a) {
            return b[c]
        }
    }
    return null
}

types.group = inherit(types.def);
types.group.get = function (c, e) {
    if (c.id) {
        return e[c.id]
    }
    if (!c.keys) {
        for (var d in c.c) {
            var b = c.c[d];
            var f = ftype(b).get(b, e);
            if (f != null && ftype(b).hasValue(b, f)) {
                return 1
            }
        }
    }
    for (var d in c.keys) {
        var b = findAttr(c.c, c.keys[d]);
        var f = ftype(b).get(b, e);
        if (f != null && ftype(b).hasValue(b, f)) {
            return 1
        }
    }
    return 0
};
types.group.put = function (a, b, c) {
    if (a.id) {
        b[a.id] = c
    }
};
types.group.remove = function (a, b) {
    if (a.id) {
        delete b[a.id]
    }
};
types.group.view = function (a, b) {
    return new GroupView(a, b)
};
types.deck = inherit(types.def);
types.deck.view = function (a, b) {
    return new DeckView(a, b)
};
types.deck.lookup = function (e, b, d) {
    if (b) {
        if (e.name) {
            if (b != e.name) {
                return null
            }
        } else {
            if (!e.owner || e.owner.name != b) {
                return null
            }
        }
    }
    for (var g in e.panes) {
        var h = e.panes[g];
        for (var f in h.c) {
            var c = ftype(h.c[f]).lookup(h.c[f], null, d);
            if (c != null) {
                return c
            }
        }
    }
    return null
};
types.grid = inherit(types.def);
types.grid.view = function (a, b) {
    return new GridView(a, b)
};
types.gridmultinumber = inherit(types.def);
types.gridmultinumber.get = function (a, d) {
    var e = d[a.id];
    if (!e) {
        return {}
    }
    var c = {};
    for (var b = 0; b + 1 < e.length; b += 2) {
        c[e[b]] = e[b + 1]
    }
    return c
};
types.gridmultinumber.put = function (c, e, f) {
    var b = [];
    for (var d in f) {
        b.push(d);
        b.push(f[d])
    }
    e[c.id] = b
};
types.gridmultinumber.view = function (a, b) {
    return new GridMultiView(a, b)
};
types.flag = inherit(types.def);
types.flag.outside = true;
types.flag.get = function (a, b) {
    var c = b[a.id] || 0;
    return a.inv ? (c ? 0 : 1) : c
};
types.flag.put = function (a, b, c) {
};
types.flag.tostr = function (a, b) {
    return b ? a.name : ""
};
types.flag.cfg = function (b, c) {
    var a = b.name || ftype(b).tostr(b, true);
    if (b.band != null) {
        a = "flag" + b.band
    }
    return getAttrProp(c, b, a)
};
types.flag.view = function (a, b) {
    if (a.status) {
        return new BoolView(a, true)
    }
    return new FlagView(a, false)
};
types.flag.column = function (b, d, c) {
    var a = b.name || ftype(b).tostr(b, true);
    if (b.band != null) {
        a = "flag" + b.band
    }
    if (shouldHide(getAttrProp(c, b, a))) {
        return null
    }
    d.addFlag(b, b.band);
    return null
};
types.flag.flag = function (c, a, d) {
    if (!d) {
        return null
    }
    var b = iel(c, null, "span", a.hint);
    if (a.name) {
        b.title = a.name
    }
    return b
};
types.flag.lookup = function (c, a, b) {
    if (types.def.lookup(c, a, b) != null) {
        c = inherit(c);
        c.status = 1;
        c.order = null;
        return c
    }
    return null
};
types.flag.matcher = function (a, b, c) {
    return types.bool.matcher(a, b, c)
};
types.flag.filter = function (a, b) {
    if (b) {
        return [OP_IS]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.numflag = inherit(types.flag);
types.numflag.get = function (a, b) {
    return b[a.id]
};
types.numflag.tostr = function (b, c) {
    var a = b.c[c || 0];
    return a != null ? a[0] : ""
};
types.numflag.view = function (a, b) {
    return new FlagView(a, true)
};
types.numflag.flag = function (c, a, d) {
    d = a.c[d || a.def];
    if (!d) {
        return null
    }
    var b = iel(c, null, "span", d[1]);
    b.title = d[0];
    return b
};
types.numflag.filter = function (a, b) {
    if (b) {
        return [OP_IS]
    }
    if (a.name) {
        return a.name
    }
    return ""
};
types.enable = inherit(types.flag);
types.enable.name = "Enabled";
types.enable.secondname = "enable";
types.enable.get = function (a, b) {
    if (a.id) {
        return b[a.id] ? 1 : 0
    }
    return b.bfe000a && !b.bfe0007 ? 0 : 1
};
types.enable.put = function (a, b, c) {
    if (a.id) {
        b[a.id] = c ? 1 : 0
    } else {
        b.bfe000a = c ? 0 : 1
    }
};
types.enable.tostr = function (a, b) {
    return b ? "enabled" : "disabled"
};
types.enable.cfg = function (a, b) {
    return getAttrProp(b, a, "Enabled")
};
types.enable.view = function (a, b) {
    if (!a.status) {
        a.order = 0
    }
    return new BoolView(a, b)
};
types.enable.column = function (b, d, c) {
    var a = getAttrProp(c, b, "Enabled");
    if (shouldHide(a)) {
        return null
    }
    d.addFlag(b);
    if (!c.ro) {
        d.addEnable(b)
    }
    return null
};
types.enable.flag = function (c, a, d) {
    if (d) {
        return null
    }
    var b = iel(c, null, "span", "X");
    b.title = "disabled";
    b.className = "disabled";
    return b
};
types.enable.filter = function (a, b) {
    if (b) {
        return [OP_IS]
    }
    return a.name
};
types.enable.lookup = function (c, a, b) {
    return types.flag.lookup(c, a, b)
};
types.invalid = inherit(types.flag);
types.invalid.name = "Invalid";
types.invalid.secondname = "invalid";
types.invalid.get = function (a, b) {
    return b.bfe0008 && !b.bfe000a
};
types.invalid.tostr = function (a, b) {
    return b ? "invalid" : ""
};
types.invalid.view = function (a, b) {
    return types.flag.view(a, b)
};
types.invalid.flag = function (c, a, d) {
    if (!d) {
        return null
    }
    var b = iel(c, null, "span", "I");
    b.className = "disabled";
    b.title = "invalid";
    return b
};
types.invalid.lookup = function (c, a, b) {
    return types.flag.lookup(c, a, b)
};
types.dynamic = inherit(types.flag);
types.dynamic.name = "Dynamic";
types.dynamic.secondname = "dynamic";
types.dynamic.get = function (a, b) {
    return b.bfe0007
};
types.dynamic.tostr = function (a, b) {
    return b ? "dynamic" : ""
};
types.dynamic.view = function (a, b) {
    if (a.status) {
        return new BoolView(a, true)
    }
    return new FlagView(a, true, "dynamic")
};
types.dynamic.flag = function (c, a, d) {
    if (!d) {
        return null
    }
    var b = iel(c, null, "span", "D");
    b.title = "dynamic";
    return b
};
types.dynamic.filter = function (a, b) {
    if (b) {
        return [OP_IS]
    }
    return a.name
};
types.dynamic.lookup = function (c, a, b) {
    return types.flag.lookup(c, a, b)
};
types.preset = inherit(types.flag);
types.preset.name = "Default";
types.preset.secondname = "default";
types.preset.get = function (a, b) {
    return b.bfe000d
};
types.preset.tostr = function (a, b) {
    return b ? "default" : ""
};
types.preset.view = function (a, b) {
    if (a.status) {
        return new BoolView(a, true)
    }
    return new FlagView(a, true, "default")
};
types.preset.flag = function (c, a, d) {
    if (!d) {
        return null
    }
    var b = iel(c, null, "span", "*");
    b.title = "default";
    return b
};
types.preset.filter = function (a, b) {
    if (b) {
        return [OP_IS]
    }
    return a.name
};
types.preset.lookup = function (c, a, b) {
    return types.flag.lookup(c, a, b)
};
types.toggle = inherit(types.def);
types.toggle.outside = true;
types.toggle.cfg = function (b, c) {
    var a = b.modes[0];
    return getAttrProp(c, b, a)
};
types.toggle.view = function (a, b) {
    return new ToggleView(a)
};
types.status = inherit(types.def);
types.status.outside = true;
types.status.view = function (a, b) {
    return new StatusView(a)
};
types.status.lookup = function (e, b, d) {
    if (b) {
        return null
    }
    for (var f in e.c) {
        var c = ftype(e.c[f]).lookup(e.c[f], null, d);
        if (c != null) {
            e = inherit(e);
            e.c = [c];
            return e
        }
    }
    return null
};
types.statusbar = inherit(types.def);
types.statusbar.outside = true;
types.statusbar.cfg = function (a, b) {
    return getAttrProp(b, a, a.name || "statusbar")
};
types.statusbar.view = function (a) {
    if (a.path || a.cmd) {
        return null
    }
    return new StatusBar(a)
};
types.statusbar.column = function (b, g, f) {
    if (!b.path && !b.cmd) {
        return null
    }
    var e = {};
    e.owner = f;
    e.path = b.path || f.path;
    e.getcmd = b.cmd;
    e.c = b.c;
    e.ro = true;
    var d = new ObjectHolder(e);
    var a = [];
    for (var c in b.c) {
        a.push(new StatusBarView(b.c[c], null, d.getObject()))
    }
    var h = function () {
        for (var j in a) {
            a[j].load(d.getObject())
        }
    };
    d.listen(h);
    g.onDestroy(function () {
        d.unlisten(h)
    });
    return null
};
types.comment = inherit(types.string);
types.comment.outside = true;
types.comment.get = function (a, b) {
    return b.sfe0009
};
types.comment.put = function (a, b, c) {
    b.sfe0009 = c
};
types.comment.tostr = function (a, b) {
    return b || ""
};
types.comment.column = function (b, d, c) {
    var a = getAttrProp(c, b, "Comment");
    if (shouldHide(a)) {
        return null
    }
    d.addComment(b);
    return null
};
types.comment.view = function (a, b) {
    if (!a.name) {
        a.name = "Comment"
    }
    if (!a.status) {
        a.order = -1
    }
    if (b) {
        return new ROTextView(a, 5)
    }
    return new TextAreaView(a)
};
types.comment.filter = function (a, b) {
    if (b) {
        return [OP_CONTAIN, OP_CONTAIN_NOT]
    }
    if (a.name) {
        return a.name
    }
    return "Comment"
};
types.comment.lookup = function (c, a, b) {
    if (!c.name) {
        c.name = "Comment"
    }
    if (types.def.lookup(c, a, b) != null) {
        c = inherit(c);
        c.order = null;
        c.status = 1;
        return c
    }
    return null
};
types.about = inherit(types.def);
types.about.outside = true;
types.about.get = function (a, b) {
    return b.Sfe001c
};
types.about.column = function (a, c, b) {
    c.addAboutInfo(a)
};
types.about.view = function (a, b) {
    return new AboutView(a)
};
types.columnalias = inherit(types.def);
types.columnalias.alias = true;
types.columnalias.column = function (a, d, b) {
    if (!a.alias) {
        a.alias = getAttr(b, a.name)
    }
    if (a.alias) {
        var e = ftype(a.alias).column(a.alias, d, b);
        if (e) {
            return [e[0], a.width]
        }
    }
    return null
};
types.columnalias.cell = function (d, b, c, e, a) {
    if (b.alias) {
        e = ftype(b.alias).get(b.alias, c);
        return ftype(b.alias).cell(d, b.alias, c, e, a)
    }
    return null
};
types.columnalias.listen = function (b, a) {
    if (b.alias) {
        ftype(b.alias).listen(b.alias, a)
    }
};
types.columnalias.unlisten = function (b, a) {
    if (b.alias) {
        ftype(b.alias).unlisten(b.alias, a)
    }
};
types.columnalias.view = function () {
    return null
};
types.columnalias.lookup = function (c, a, b) {
    return null
};
types.alias = inherit(types.def);
types.alias.alias = true;
types.alias.view = function (a, b) {
    return new AliasView(a, b)
};
types.alias.lookup = function (c, a, b) {
    return null
};
types.graph = inherit(types.def);
types.graph.get = function (a, b) {
    return ftype(a.model).get(a.model, b)
};
types.graph.view = function (a) {
    return new GraphView(a)
};
types.graph.column = function (a, c, b) {
    if (a.model && a.width) {
        return types.def.column(a, c, b)
    }
    return null
};
types.graph.cell = function (m, p, e, b, a) {
    if (b == null) {
        return null
    }
    var j = createGraphic(m, a, 200, 16, 80, 16);
    if (j == null) {
        return null
    }
    clearNodes(j.canvas);
    j.canvas.style.display = "block";
    j.strokeWidth = 3;
    var n = b.length - 1;
    var q = j.viewBox.height;
    var k = p.max;
    var c = p.offset || 0;
    for (var l = j.viewBox.width - 1.5; l > 0 && n >= 0; l -= 4, n -= 2) {
        var o = num2int(b[n][0]) + c;
        var f = Math.floor(Math.max(o * q / k, 1));
        j.strokeColor = "#40bbef";
        if (p.colors) {
            for (var d in p.colors) {
                if (o < p.colors[d].level) {
                    j.strokeColor = p.colors[d].color;
                    break
                }
            }
        }
        j.line(l, q, l, q - f)
    }
    return j.canvas
};
types.graphbox = inherit(types.def);
types.graphbox.view = function (a) {
    a.name = "Graph";
    return new GraphBox(a)
};
types.graphbox.lookup = function (c, a, b) {
    if (a && (!c.owner || c.owner.name != a)) {
        return null
    }
    for (var d in c.graphs) {
        if (c.graphs[d].name == b) {
            return c.graphs[d]
        }
    }
    return null
};
types.file = inherit(types.def);
types.file.column = function (c, e, d) {
    if (c.uploadonly) {
        return null
    }
    if (!(sysres.policy & (1 << 4))) {
        return null
    }
    if (sysres.policy & (1 << 7)) {
        var b = current.getToolbar();
        var g = elc(b, "li", "custom");
        g.style.padding = "10px 0.5em 0 1em";
        var f = el(g, "span", "Upload:");
        var a = new FileUploadView(c);
        g = elc(b, "li", "custom");
        g.appendChild(a.create())
    }
    if (!(sysres.policy & (1 << 6))) {
        return null
    }
    return ["", 80]
};
types.file.cell = function (f, c, e, g) {
    if (!c.typeAttr) {
        c.typeAttr = getAttr(e._type, "type")
    }
    if (c.typeAttr) {
        var d = ftype(c.typeAttr).get(c.typeAttr, e);
        if (d == 5 || d == 9) {
            return iel(f, null, "span")
        }
    }
    var a = tbtn(null, "Download");
    a.onclick = function () {
        var h = e._owner.toString(e);
        var b = document.getElementById("downloader");
        b.src = "/jsproxy/?" + session.encryptURI(h);
        return true
    };
    return a
};
types.file.view = function (a, b) {
    if (a.uploadonly) {
        return new FileUploadView(a)
    }
    return null
};
types.custom = inherit(types.def);
types.custom.view = function () {
    return null
};
types.filter = inherit(types.def);
types.filter.view = function () {
    return null
};
types.filter.column = function (a, c, b) {
    c.addFilter(a);
    return null
};
types.doit = inherit(types.def);
types.doit.outside = true;
types.doit.createButton = function (e, g, j, f, d, h) {
    var c = getAttrProp(f, e);
    if (shouldHide(c)) {
        return
    }
    if (e.global && j && j._type.type == "item") {
        g = true
    }
    var a;
    if (e.c) {
        a = current.addButton(e.name, c, getPath(f) + "." + normalize(e.name))
    } else {
        if ((e.global || false) == g) {
            if (e.name == "" || e.name == null) {
                current.addButton();
                return
            }
            a = current.addButton(e.name, c);
            a.onclick = function (b) {
                if (isSkinEvent(b)) {
                    return true
                }
                if (!e.confirm || confirm(e.confirm)) {
                    var k = new Doit(e, f.path);
                    if (j) {
                        k.setID(j.ufe0001)
                    }
                    k.doit()
                }
            }
        }
    }
    if (a && skinMode) {
        if (h) {
            h.createSkinCntrl(d, a, a.firstChild, true)
        } else {
            new SkinCntrl(a, c, a.firstChild)
        }
    }
};
types.doit.view = function (b, d) {
    var c = this;
    var a = new CustomView(b, false, function (f, e, g) {
        c.createButton(b, false, g, g._type, a, f)
    });
    return a
};
types.doit.column = function (a, c, b) {
    this.createButton(a, true, null, b);
    return null
};
types.autoset = inherit(types.def);
types.autoset.view = function (a, b) {
    return new AutoSetView(a, b)
};
types.contextmenu = inherit(types.def);
types.contextmenu.outside = true;
types.contextmenu.view = function (a, b) {
    return new ContextButtonView(a)
};
types.toolbar = inherit(types.def);
types.toolbar.outside = true;
types.toolbar.view = function (a, b) {
    return new ToolbarView(a)
};
types.button = inherit(types.def);
types.button.view = function (a, b) {
    if (a.name == null) {
        return new CustomView(a, false, function (d, c, e) {
            current.addButton()
        })
    }
    return null
};
types.cond = inherit(types.def);
types.cond.view = function () {
    return null
};
types.concat = inherit(types.def);
types.concat.get = function (b, e) {
    var g = b.first;
    if (typeof g == "string") {
        g = getAttr(e._type, g)
    }
    var a = b.second;
    if (typeof a == "string") {
        a = getAttr(e._type, a)
    }
    var d = toString(g, e);
    var c = toString(a, e);
    if (c.length == 0) {
        return d
    }
    if (d.length == 0) {
        return c
    }
    return d + b.sep + c
};
var enm = {};
enm.def = {};
enm.def.toString = function (d, a, b) {
    var c = this.getMap(a, b)[d];
    return c != "" ? c : null
};
enm.def.getColor = function (a, b) {
    if (a.values) {
        return enm[a.values.type].getColor(a.values, b)
    }
    return null
};
enm.def.getMap = function (a, b) {
    if (a.values) {
        return enm[a.values.type].getMap(a.values, b)
    }
    return {}
};
enm.def.listen = function (b, a, c) {
    if (b.values) {
        enm[b.values.type].listen(b.values, a, c)
    }
};
enm.def.unlisten = function (b, a) {
    if (b.values) {
        enm[b.values.type].unlisten(b.values, a)
    }
};
enm.defenum = inherit(enm.def);
enm.defenum.getMap = function (a, c) {
    var b = enm[a.values.type].getMap(a.values, c);
    b[a.defid] = a.defname;
    return b
};
enm["static"] = inherit(enm.def);
enm["static"].getMap = function (a) {
    return a.map
};
enm.pair = inherit(enm.def);
enm.pair.toString = function (f, b, e) {
    for (var c in b.c) {
        var d = b.c[c];
        var a = enm[d.type].toString(f, d, e);
        if (a != null) {
            return a
        }
    }
    return null
};
enm.pair.getMap = function (b, g) {
    var d = {};
    for (var c in b.c) {
        var e = b.c[c];
        var f = enm[e.type].getMap(e, g);
        for (var a in f) {
            if (f[a] != "") {
                d[a] = f[a]
            }
        }
    }
    return d
};
enm.pair.listen = function (b, a) {
    for (var c in b.c) {
        var d = b.c[c];
        enm[d.type].listen(d, a)
    }
};
enm.pair.unlisten = function (b, a) {
    for (var c in b.c) {
        var d = b.c[c];
        enm[d.type].unlisten(d, a)
    }
};
enm.dynamic = inherit(enm.def);
enm.dynamic.toString = function (d, a) {
    if (a.cache) {
        return a.cache[d]
    }
    var c = getObjectMap(a.path);
    var b = c.getObject(d);
    if (b) {
        return c.toString(b)
    }
    return null
};
enm.dynamic.getMap = function (a) {
    if (a.cache) {
        return a.cache
    }
    var c = getObjectMap(a.path);
    var b = {};
    c.foreach(function (d) {
        if (a.pred && !isTrue(a.pred, d)) {
            return
        }
        b[d.ufe0001] = c.toString(d)
    });
    return b
};
enm.dynamic.listen = function (b, a) {
    if (!b.lstns) {
        b.lstns = new Listeners()
    }
    if (b.lstns.listen(a)) {
        var c = getObjectMap(b.path);
        b.cb = function (d) {
            if (b.cache) {
                if (d.ufe0013) {
                    delete b.cache[d.ufe0001]
                } else {
                    if (b.pred && !isTrue(b.pred, d)) {
                        return
                    }
                    b.cache[d.ufe0001] = c.toString(d)
                }
                b.lstns.notify(d)
            }
        };
        c.listen(b.cb, false);
        b.cache = this.getMap(b)
    }
};
enm.dynamic.unlisten = function (b, a) {
    if (b.lstns && b.lstns.unlisten(a)) {
        b.cache = null;
        getObjectMap(b.path).unlisten(b.cb, false)
    }
};
enm.enumfilter = inherit(enm.def);
enm.enumfilter.toString = function (b, a) {
    return enm[a.values.type].toString(b, a.values)
};
enm.enumfilter.getMap = function (c, g) {
    var f = enm[c.values.type].getMap(c.values);
    var e = {};
    for (var d in c.filters) {
        var b = c.filters[d];
        if (!b.pred || isTrue(b.pred, g)) {
            e[b.id] = f[b.id]
        }
    }
    return e
};
enm.enumfilter.listen = function (b, a, c) {
    if (!c) {
        return
    }
    var e = c.getMainObject();
    var d = function () {
        var h = enm[b.values.type].getMap(b.values);
        for (var g in b.filters) {
            var f = b.filters[g];
            var j = {ufe0001: f.id};
            if (f.pred && !isTrue(f.pred, e)) {
                j.ufe0013 = 1
            }
            a(j)
        }
    };
    a.lstn = d;
    e._owner.listen(a.lstn, true)
};
enm.enumfilter.unlisten = function (b, a, c) {
    if (!c) {
        return
    }
    if (a.lstn) {
        var d = c.getMainObject();
        d._owner.unlisten(a.lstn, true)
    }
};
enm.remapenum = inherit(enm.def);
enm.remapenum.getMap = function (a, c) {
    if (!a.obj) {
        if (a.view) {
            var b = getObjectMap(a.path);
            a.obj = b.getObject(a.view.getValue())
        }
        if (!a.obj) {
            return {}
        }
    }
    a.map = enm[a.values.type].getMap(a.values, a.obj);
    return a.map
};
enm.remapenum.listen = function (b, a, d) {
    if (!b.lstns) {
        b.lstns = new Listeners()
    }
    if (b.lstns.listen(a)) {
        var c = this;
        b.cb = function () {
            c.notify(b)
        };
        b.view = d.getView(b.master);
        b.view.listen(b.cb);
        getObjectMap(b.path).listen(b.cb, false);
        this.notify(b)
    }
};
enm.remapenum.unlisten = function (b, a) {
    if (b.lstns && b.lstns.unlisten(a)) {
        b.view.unlisten(b.cb);
        delete b.view;
        getObjectMap(b.path).unlisten(b.cb, false)
    }
};
enm.remapenum.notify = function (a) {
    var e = getObjectMap(a.path);
    var d = e.getObject(a.view.getValue());
    if (a.obj == d) {
        return
    }
    a.obj = d;
    if (!a.obj) {
        return
    }
    var c = {};
    if (a.map) {
        for (var b in a.map) {
            c[b] = a.map[b]
        }
    }
    a.map = this.getMap(a);
    for (var b in a.map) {
        if (c[b] != null) {
            delete c[b]
        } else {
            var d = {};
            d.ufe0001 = b;
            a.lstns.notify(d)
        }
    }
    for (var b in c) {
        var d = {};
        d.ufe0001 = parseInt(b);
        d.ufe0013 = 1;
        a.lstns.notify(d)
    }
};
enm.slotenum = inherit(enm.def);
enm.slotenum.getMap = function (a, f) {
    if (a.map && a.obj == f) {
        return a.map
    }
    if (!a.namesAttrs) {
        a.namesAttrs = getAttr(f._type, a.names)
    }
    if (!a.valuesAttrs) {
        a.valuesAttrs = getAttr(f._type, a.values)
    }
    var e = ftype(a.namesAttrs).get(a.namesAttrs, f);
    var c = ftype(a.valuesAttrs).get(a.valuesAttrs, f);
    if (!e || !c) {
        return {}
    }
    var d = {};
    for (var b in e) {
        d[c[b][0]] = e[b][0]
    }
    a.map = d;
    a.obj = f;
    return d
};
enm.slotenum.listen = function (b, a) {
};
enm.slotenum.unlisten = function (b, a) {
};
enm.offsetenum = inherit(enm.def);
enm.offsetenum.toString = function (c, a, b) {
    return enm[a.values.type].toString(c, a.values, b)
};
enm.queryenum = inherit(enm.def);
enm.queryenum.toString = function (c, a, b) {
    return c.toString()
};
enm.queryenum.getMap = function (a, b) {
    if (!a.map && b) {
        a.obj = b;
        if (a.obj) {
            this.query(a)
        }
        return {}
    }
    return a.map
};
enm.queryenum.getColor = function (a, c) {
    if (!a.bids) {
        return null
    }
    for (var b in a.bids) {
        if (a.bids[b] == c) {
            return null
        }
    }
    return "#888"
};
enm.queryenum.listen = function (c, a, f) {
    if (!f) {
        return
    }
    if (!c.lstns) {
        c.lstns = new Listeners()
    }
    if (c.lstns.listen(a)) {
        var e = this;
        c.cb = function () {
            if (!c.timer && c.obj) {
                c.timer = setTimeout(function () {
                    c.timer = null;
                    e.query(c)
                }, 1)
            }
        };
        c.views = [];
        for (var d in c.params) {
            if (!c.params[d].name) {
                c.views.push(null);
                continue
            }
            var b = f.getView(c.params[d].name);
            b.listen(c.cb);
            c.views.push(b)
        }
        if (c.obj) {
            this.query(c)
        }
    }
};
enm.queryenum.unlisten = function (b, a) {
    if (b.lstns && b.lstns.unlisten(a)) {
        for (var c in b.views) {
            if (b.views[c]) {
                b.views[c].unlisten(b.cb)
            }
        }
        delete b.cb;
        delete b.views;
        delete b.map
    }
};
enm.queryenum.query = function (a) {
    var c = {};
    c.Uff0001 = a.path;
    c.uff0007 = a.cmd;
    for (var b in a.views) {
        if (!a.views[b]) {
            c[a.params[b].id] = a.obj.ufe0001
        } else {
            c[a.params[b].id] = a.views[b].getValue()
        }
    }
    post(c, function (g) {
        var e = a.map;
        if (!e) {
            e = {}
        }
        a.map = {};
        var f = g[a.valuesid];
        a.bids = g[a.bvaluesid];
        if (f) {
            for (var d in f) {
                var j = f[d];
                a.map[j] = j;
                delete e[j];
                var h = {};
                h.ufe0001 = j;
                a.lstns.notify(h)
            }
        }
        for (var d in e) {
            var h = {};
            h.ufe0001 = parseInt(d);
            h.ufe0013 = 1;
            a.lstns.notify(h)
        }
    })
};

function isTrue(a, b) {
    return pred[a.type].isTrue(a, b)
}

var pred = {};
pred.number = {};
pred.number.isTrue = function (a, c) {
    c = c || 0;
    if (c instanceof Array) {
        c = c[0]
    }
    for (var b in a.value) {
        if (a.value[b] == c) {
            return true
        }
    }
    return false
};
pred.string = {};
pred.string.isTrue = function (a, b) {
    if (b == null) {
        b = ""
    }
    return b == a.value
};
pred.bool = {};
pred.bool.isTrue = function (a, b) {
    return a.value ? !!b : !b
};
pred.bitmap = {};
pred.bitmap.isTrue = function (a, b) {
    if (b instanceof Array) {
        b = b[0]
    }
    return (b & a.mask) == a.value
};
pred.object = {};
pred.object.isTrue = function (a, c) {
    if (!a.map) {
        a.map = getObjectMap(a.path)
    }
    var b = a.map[c];
    return b && isTrue(a.pred, b)
};
pred.slot = {};
pred.slot.isTrue = function (a, b) {
    if (!a.attrs) {
        a.attrs = getAttr(b._type, a.slot);
        if (!a.attrs) {
            return false
        }
    }
    var c = ftype(a.attrs).get(a.attrs, b);
    return c == null || isTrue(a.pred, c)
};
pred.or = {};
pred.or.isTrue = function (a, c) {
    for (var b in a.pred) {
        if (isTrue(a.pred[b], c)) {
            return true
        }
    }
    return false
};
pred.not = {};
pred.not.isTrue = function (a, b) {
    return !isTrue(a.pred, b)
};
pred.arch = {};
pred.arch.isTrue = function (a, b) {
    return a.value == sysres.arch
};
pred.board = {};
pred.board.isTrue = function (a, b) {
    return a.value == sysres.board || a.value == sysres.boardname
};
pred.daughterboard = {};
pred.daughterboard.isTrue = function (a, b) {
    return false
};
pred.quickset = {};
pred.quickset.isTrue = function (a, b) {
    return !!(sysres.qscaps & (1 << a.bit))
};
pred.addon = {};
pred.addon.isTrue = function (a, b) {
    return !!addons[a.value]
};
pred.statuspane = {};
pred.statuspane.isTrue = function (a, b) {
    return !isStatusPageEmpty()
};

function newRequest() {
    try {
        return new XMLHttpRequest()
    } catch (a) {
    }
    try {
        return new ActiveXObject("Msxml2.XMLHTTP")
    } catch (a) {
    }
    return new ActiveXObject("Microsoft.XMLHTTP")
}

function request(f, b, e, a, d) {
    if (!d) {
        d = onSessionError
    }
    var c = newRequest();
    c.onreadystatechange = function () {
        if (c.readyState == 4) {
            if (c.status == 200) {
                a(c.responseText)
            } else {
                if (c.status >= 400 || c.status == 0) {
                    if (urlCheker) {
                        clearInterval(urlCheker)
                    }
                    if (c.status == 410) {
                        d(null)
                    } else {
                        if (c.status == 403) {
                            d("Authentication failed: invalid username or password.")
                        } else {
                            if (c.status == 0) {
                                setTimeout(function () {
                                    d("ERROR: router has been disconnected.")
                                }, 1000)
                            } else {
                                d("ERROR: " + c.statusText)
                            }
                        }
                    }
                }
            }
            c = null
        }
    };
    c.open(f, b, true);
    c.send(e)
}

function fetchFile(c, a) {
    var b = "/jsproxy/?" + session.encryptURI(c);
    var d = newRequest();
    d.onreadystatechange = function () {
        if (d.readyState == 4) {
            if (d.status == 200) {
                a(d.responseText)
            } else {
                a(null)
            }
        }
    };
    d.open("GET", b, true);
    d.send()
}

function msg2json(g) {
    var f = "";
    for (var c in g) {
        var e = c.charAt(0);
        if (e == "_") {
            continue
        }
        if (f.length > 0) {
            f += ","
        }
        var d = g[c];
        switch (e) {
            case"b":
            case"u":
            case"q":
                f += c + ":" + (d || 0);
                break;
            case"s":
                d = d ? d.replace(/\'/g, "\\'") : "";
                f += c + ":'" + d + "'";
                break;
            case"r":
            case"a":
                f += c + ":[" + (d ? d : "") + "]";
                break;
            case"m":
                var b = "{}";
                if (d) {
                    b = msg2json(d);
                    if (b == null) {
                        return null
                    }
                }
                f += c + ":" + b;
                break;
            case"U":
            case"B":
            case"Q":
                f += c + ":[" + (d ? d : "") + "]";
                break;
            case"S":
                f += c + ":[";
                if (d) {
                    for (var a in d) {
                        if (a > 0) {
                            f += ","
                        }
                        f += "'" + d[a].replace(/\'/g, "\\'") + "'"
                    }
                }
                f += "]";
                break;
            case"R":
            case"A":
                f += c + ":[";
                if (d) {
                    for (var a in d) {
                        if (a > 0) {
                            f += ","
                        }
                        f += "[" + d[a] + "]"
                    }
                }
                f += "]";
                break;
            case"M":
                f += c + ":[";
                if (d) {
                    for (var a in d) {
                        var b = msg2json(d[a]);
                        if (b == null) {
                            return null
                        }
                        if (a > 0) {
                            f += ","
                        }
                        f += b
                    }
                }
                f += "]";
                break;
            default:
                return null
        }
    }
    return "{" + f + "}"
}

function post(b, a) {
    request("POST", "/jsproxy", session.encrypt(msg2json(b)), function (c) {
        session.decrypt(c, a);
        session.dequeue()
    })
}

var subscribers = {};

function receive(b) {
    var c = b.Uff0002;
    var a = subscribers[c];
    if (a) {
        a.notify(b)
    }
    post({}, receive)
}

function subscribe(c, a) {
    if (!subscribers[c]) {
        subscribers[c] = new Listeners()
    }
    if (subscribers[c].listen(a)) {
        var b = {};
        b.Uff0001 = c;
        b.uff0007 = 16646162;
        post(b)
    }
}

function unsubscribe(c, a) {
    if (subscribers[c].unlisten(a)) {
        var b = {};
        b.Uff0001 = c;
        b.uff0007 = 16646163;
        post(b)
    }
}

function isError(a) {
    return a.uff0008 != null
}

function getErrorDescription(a) {
    switch (a) {
        case 16646146:
        case 16646147:
            return "feature is not implemented";
        case 16646161:
        case 16646148:
            return "object doesn't exist";
        case 16646151:
            return "object already exists";
        case 16646153:
            return "not permitted";
        case 16646162:
            return "busy";
        case 16646157:
            return "timeout";
        default:
            return "action failed"
    }
}

function showError(a, c) {
    if (!isError(c)) {
        return
    }
    var b = c.sff0009;
    if (b == null) {
        b = getErrorDescription(c.uff0008)
    }
    alert(a + " - " + b + " (" + (c.uff0008 & 4095) + ")")
}

function removeSysFields(b) {
    for (var a in b) {
        if (parseInt(a.substr(1), 16) >= 16711680) {
            delete b[a]
        }
    }
}

var prefs = [];
var prefTimer;

function savePrefs() {
    prefTimer = null;
    post({Uff0001: [13, 7], uff0007: 16646158, s1: sysres.user, M1: prefs})
}

function getPrefs(b) {
    var a = b ? getPath(b) : "";
    for (var c in prefs) {
        if (prefs[c].sfe0010 == a) {
            return prefs[c]
        }
    }
    return {sfe0010: a}
}

function setPrefs(b) {
    for (var a in prefs) {
        if (prefs[a] == b) {
            prefs.splice(a, 1);
            break
        }
    }
    prefs.splice(0, 0, b);
    if (prefs.length > 100) {
        prefs.splice(prefs.length - 1, 1)
    }
    if (prefTimer == null) {
        prefTimer = setTimeout(savePrefs, 60000)
    }
}

function getProp(a, c) {
    var b = a[c];
    if (b == null) {
        b = a[c] = {}
    }
    return b
}

function getServiceProp(a) {
    var b = skin;
    if (a.group) {
        b = getProp(b, a.group)
    }
    return getProp(b, a.name)
}

function getContainerProp(b) {
    if (b._type) {
        b = b._type
    }
    while (b.owner) {
        b = b.owner
    }
    var a;
    if (b.container) {
        a = getContainerProp(b.container)
    } else {
        a = getServiceProp(b.service)
    }
    return getProp(a, b.title)
}

function getAttrProp(d, c, b) {
    var a = getContainerProp(d);
    if (c && c.owner) {
        a = getProp(a, c.owner.name)
    }
    var e = a;
    if (c.owner) {
        getProp(e, c.owner.name)
    }
    e = getProp(e, b ? b : c.name);
    if (!e._def && b != "*") {
        e._def = getProp(a, "*")
    }
    return e
}

function getSysProps(a) {
    return getProp(getContainerProp(a), "&")
}

function getSysProp(a, b) {
    return getProp(getSysProps(a), b)
}

function compactSkinProps(a) {
    if (a._hide) {
        return 0
    }
    var e = {};
    var f = false;
    for (var d in a) {
        var b = a[d];
        if (d == "_def") {
            continue
        }
        if (d == "_hide" && b == 0) {
            if (a._def && a._def._hide) {
                f = true
            }
            continue
        }
        if (typeof (b) != "object") {
            e[d] = b
        } else {
            if (b != null) {
                if (d == "separator") {
                    e[d] = b._hide ? 0 : 1
                } else {
                    if (d == "tab") {
                        if (b._hide) {
                            e[d] = 0
                        } else {
                            if (b.name != null) {
                                e[d] = b.name
                            }
                        }
                    } else {
                        var g = compactSkinProps(b);
                        if (g != null) {
                            e[d] = g
                        }
                    }
                }
            }
        }
    }
    if (!f && isempty(e)) {
        return null
    }
    return e
}

function compactSkin(a) {
    a = compactSkinProps(a);
    if (a && a.Status && a.Status.Status) {
        var c = a.Status.Status;
        for (var b in c) {
            if (c[b] == 0) {
                delete c[b]
            }
        }
    }
    return a
}

function normalizeSkin(a) {
    for (var c in a) {
        var b = a[c];
        if (b == 0 && c != "order") {
            a[c] = {_hide: 1}
        }
        if (typeof (b) == "object") {
            normalizeSkin(b)
        }
    }
}

function prop2json(b, f) {
    var g = "";
    f = f || "";
    var a = f + "    ";
    var e = 0;
    for (var d in b) {
        if (g.length > 0) {
            g += ","
        }
        g += "\n" + a;
        if (d.match(/^[A-Za-z]*$/)) {
            g += d + ": "
        } else {
            g += "'" + d + "': "
        }
        var c = b[d];
        if (typeof (c) == "string") {
            g += "'" + c.replace(/\'/g, "\\'") + "'"
        } else {
            if (typeof (c) != "object") {
                g += c;
                ++e
            } else {
                g += prop2json(c, a);
                e = 100
            }
        }
    }
    if (e <= 3) {
        g = g.split("\n").join("");
        return "{" + g.replace(/\s+/g, " ") + " }"
    }
    return "{" + g + "\n" + f + "}"
}

function loadSkin(name, cb) {
    fetchFile("skins/" + name + ".json", function (resp) {
        skin = {};
        if (resp) {
            try {
                var s = eval("(" + resp + ")");
                skin = s
            } catch (e) {
            }
        }
        normalizeSkin(skin);
        if (cb) {
            cb()
        } else {
            generateMenu();
            reopen()
        }
    })
}

function saveSkin(a) {
    var b = prop2json(compactSkin(skin)) + "\n";
    request("POST", "/jsproxy/put?" + session.encryptURI("skins/" + a + ".json"), b, function (c) {
    })
}

function getObjectName(c) {
    var b = c._owner.getFullName(c);
    var a = b.name;
    if (b.cfg && b.cfg[b.propname]) {
        a = b.cfg[b.propname]
    }
    if (b.postfix) {
        a += " " + b.postfix
    }
    return a
}

function ObjectHolder(a) {
    this.attrs = a;
    this.lstns = new Listeners();
    this.obj = {};
    this.obj._type = a;
    this.obj._owner = this
}

ObjectHolder.prototype.getNameType = function (a) {
    return null
};
ObjectHolder.prototype.getName = function (a) {
    return getObjectName(a)
};
ObjectHolder.prototype.getFullName = function (a) {
    return {name: this.attrs.title, cfg: getSysProps(this.attrs), propname: "title"}
};
ObjectHolder.prototype.getPath = function () {
    return getPath(this.attrs)
};
ObjectHolder.prototype.getObject = function () {
    return this.obj
};
ObjectHolder.prototype.setObject = function (d, a) {
    if (this.obj == d) {
        var c = {};
        update(c, d);
        c.Uff0001 = this.attrs.path;
        c.uff0007 = this.attrs.setcmd || 16646158;
        var b = this;
        post(c, function (e) {
            if (isError(e)) {
                showError("Couldn't change " + d._owner.getName(d), e);
                b.fetch()
            }
            if (a) {
                a(!isError(e))
            }
        });
        this.lstns.notify(d)
    }
};
ObjectHolder.prototype.autostart = function (a) {
    return false
};
ObjectHolder.prototype.listen = function (a) {
    if (this.lstns.listen(a)) {
        if (this.attrs.autorefresh) {
            this.autorefresh = this.attrs.autorefresh;
            if (!this.timer) {
                this.fetch()
            }
        } else {
            var b = this;
            this.notifyLstn = function (d) {
                var c = d.Mfe0002;
                if (!c) {
                    b.fetch()
                } else {
                    if (c[0]) {
                        update(b.obj, c[0]);
                        b.lstns.notify(b.obj)
                    }
                }
            };
            if (!(this.attrs.getcmd == null && this.attrs.setcmd != null)) {
                subscribe(this.attrs.path, this.notifyLstn);
                this.fetch()
            }
        }
    }
};
ObjectHolder.prototype.unlisten = function (a) {
    if (this.lstns.unlisten(a)) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null
        }
        this.autorefresh = 0;
        if (this.notifyLstn) {
            unsubscribe(this.attrs.path, this.notifyLstn);
            this.notifyLstn = null
        }
    }
};
ObjectHolder.prototype.fetch = function () {
    var b = this.attrs;
    if (b.getcmd == null && b.setcmd != null) {
        return
    }
    var d = {};
    d.Uff0001 = b.path;
    d.uff0007 = b.getcmd || 16646157;
    var c = this;
    var a = function (e) {
        if (isError(e)) {
            return
        }
        update(c.obj, e);
        c.lstns.notify(c.obj);
        if (c.autorefresh && !c.timer) {
            c.timer = setTimeout(function () {
                c.timer = null;
                c.fetch()
            }, c.autorefresh)
        }
    };
    post(d, a)
};

function ObjectMap(a, b) {
    this.attrs = a;
    this.lstns = b ? b : new Listeners();
    this.autorefresh = 0;
    this.map = {};
    this.acquired = {};
    this.objCount = null;
    this.size = 0
}

ObjectMap.prototype.getType = function () {
    return this.attrs
};
ObjectMap.prototype.setID = function (a) {
    this.id = a
};
ObjectMap.prototype.getCount = function () {
    return this.objCount
};
ObjectMap.prototype.getSize = function () {
    return this.size
};
ObjectMap.prototype.getNameType = function (b) {
    var a = b._type;
    if (!a.namevalAttr) {
        if (typeof a.nameval == "string") {
            a.namevalAttr = getAttr(a, a.nameval)
        } else {
            a.namevalAttr = this.attrs.nameval
        }
    }
    return a.namevalAttr
};
ObjectMap.prototype.toString = function (a) {
    return toString(this.getNameType(a), a)
};
ObjectMap.prototype.getName = function (a) {
    return getObjectName(a)
};
ObjectMap.prototype.getFullName = function (b) {
    var a = {name: this.attrs.name, cfg: getSysProps(this.attrs), propname: "title"};
    if (b._type.nameval) {
        if (b.ufe0001 != null) {
            a.propname = "name";
            a.postfix = "<" + this.toString(b) + ">"
        } else {
            a.name = "New " + a.name;
            a.propname = "newname"
        }
    }
    return a
};
ObjectMap.prototype.getPath = function (b) {
    var a = getPath(this.attrs);
    if (b) {
        if (!b._type.nameval && !b._type.name) {
            return null
        }
        a += b.ufe0001 == null ? ".new" : "." + b.ufe0001
    }
    return a
};
ObjectMap.prototype.getObject = function (b, a) {
    if (b == null) {
        return this.newObject()
    }
    return this.map[b]
};
ObjectMap.prototype.newObject = function (b) {
    var c = this.attrs;
    if (b) {
        c = this.getSubtype(this.attrs, b) || this.attrs
    }
    var d = {};
    d._type = c;
    d._owner = this;
    this.setSubtype(c, d);
    if (b && !this.attrs.generic && this.attrs.filter) {
        var a = getAttr(this.attrs, this.attrs.filter.on);
        if (a) {
            var e = ftype(a).fromstr(a, b);
            if (e != null) {
                ftype(a).put(a, d, e)
            }
        }
    }
    if (c.prefix) {
        this.setUniqueName(d)
    }
    return d
};
ObjectMap.prototype.acquireObject = function (b) {
    var a = this.acquired[b];
    if (a) {
        ++a._refcnt;
        return a
    }
    var a = this.getObject(b);
    if (!a) {
        a = this.newObject();
        a.ufe0001 = b
    }
    a._refcnt = 1;
    this.acquired[b] = a;
    return a
};
ObjectMap.prototype.releaseObject = function (a) {
    if (--a._refcnt == 0) {
        delete this.acquired[a.ufe0001]
    }
};
ObjectMap.prototype.setUniqueName = function (g) {
    var f = {};
    var e = g._type;
    for (var d in this.map) {
        var c = this.toString(this.map[d]);
        if (c.substr(0, e.prefix.length) == e.prefix) {
            var h = string2int(c.substr(e.prefix.length));
            if (h != null) {
                f[h] = true
            }
        }
    }
    var d = 1;
    while (f[d]) {
        ++d
    }
    this.toString(g);
    var b = e.namevalAttr;
    ftype(b).put(b, g, e.prefix + d)
};
ObjectMap.prototype.setObject = function (e, a) {
    var b = e.ufe0001 == null;
    var d = {};
    update(d, e);
    d.Uff0001 = this.attrs.path;
    d.uff0007 = !b ? 16646147 : 16646149;
    var c = this;
    post(d, function (f) {
        if (isError(f)) {
            showError("Couldn't " + (b ? "add " : "change ") + c.getName(e), f);
            if (a) {
                a(false)
            }
            c.fetch(e);
            return
        }
        if (b) {
            ++c.size;
            e.ufe0001 = f.ufe0001;
            c.map[e.ufe0001] = e;
            if (c.attrs.ordered) {
                c.linkBefore(e, null)
            }
        }
        if (c.attrs.refetchonchange) {
            c.fetch(e)
        }
        if (a) {
            a(true)
        }
        c.lstns.notify(e)
    })
};
ObjectMap.prototype.removeObject = function (d, a) {
    var c = {};
    c.ufe0001 = d.ufe0001;
    c.Uff0001 = this.attrs.path;
    c.uff0007 = 16646150;
    var b = this;
    post(c, function (e) {
        if (isError(e)) {
            showError("Couldn't remove " + b.getName(d), e);
            if (a) {
                a(false)
            }
            return
        }
        --b.size;
        b.remove(d);
        if (a) {
            a(true)
        }
    })
};
ObjectMap.prototype.moveObjectAfter = function (d, e) {
    var a = e != null ? e._next : this.first;
    var c = {};
    c.ufe0001 = d.ufe0001;
    c.Uff0001 = this.attrs.path;
    c.uff0007 = 16646151;
    c.ufe0005 = a != null ? a.ufe0001 : 4294967295;
    var b = this;
    post(c, function (f) {
        if (isError(f)) {
            showError("Couldn't move " + b.getName(d), f);
            return
        }
        b.unlink(d);
        b.linkBefore(d, a);
        b.lstns.notify(d)
    })
};
ObjectMap.prototype.remove = function (a) {
    if (this.attrs.ordered) {
        this.unlink(a)
    }
    a.ufe0013 = 1;
    delete this.map[a.ufe0001];
    --this.size;
    this.lstns.notify(a)
};
ObjectMap.prototype.getSubtypes = function () {
    if (!this.attrs.generic) {
        return null
    }
    var a = [];
    if (this.getSubtypesFor(this.attrs, a)) {
        return a
    }
    return null
};
ObjectMap.prototype.getSubtypesFor = function (e, b) {
    var d = 0;
    for (var a in e.subtypes) {
        var c = e.subtypes[a];
        if (c.generic) {
            d += this.getSubtypesFor(c, b)
        }
        if (c.nonaddable || (c.pred && !isTrue(c.pred))) {
            continue
        }
        b.push(c.title);
        ++d
    }
    for (var a in e.gensubtypes) {
        d += this.getSubtypesFor(e.gensubtypes[a], b)
    }
    return d
};
ObjectMap.prototype.getSubtype = function (c, d) {
    for (var b in c.subtypes) {
        if (c.subtypes[b].ntitle == d) {
            return c.subtypes[b]
        }
        if (c.subtypes[b].generic) {
            var a = this.getSubtype(c.subtypes[b], d);
            if (a) {
                return a
            }
        }
    }
    for (var b in c.gensubtypes) {
        var a = this.getSubtype(c.gensubtypes[b], d);
        if (a) {
            return a
        }
    }
    return null
};
ObjectMap.prototype.setSubtype = function (b, d, a) {
    if (b.typeon && a != null) {
        ftype(b.typeon).put(b.typeon, d, a)
    }
    if (b.inherit) {
        var c = b.typevalue;
        if (c == null || c == 4294967295) {
            c = a
        }
        this.setSubtype(b.inherit, d, c)
    }
};
ObjectMap.prototype.fetch = function (c) {
    var b = {};
    b.ufe0001 = c.ufe0001;
    b.Uff0001 = this.attrs.path;
    b.uff0007 = 16646146;
    var a = this;
    post(b, function (d) {
        if (isError(d)) {
            return
        }
        removeSysFields(d);
        update(c, d);
        c.ufe0001 = b.ufe0001;
        a.lstns.notify(c)
    })
};
ObjectMap.prototype.foreach = function (a) {
    if (this.attrs.ordered) {
        var c = this.last;
        while (c != null) {
            a(c);
            c = c._prev
        }
    } else {
        for (var b in this.map) {
            a(this.map[b])
        }
    }
};
ObjectMap.prototype.getFirst = function () {
    return this.first
};
ObjectMap.prototype.getNextID = function (a) {
    return a._next ? a._next.ufe0001 : null
};
ObjectMap.prototype.autostart = function (a) {
    this.setObject(a);
    return true
};
ObjectMap.prototype.listen = function (a, b) {
    if (b) {
        if (++this.autorefresh == 1 && this.attrs.autorefresh) {
            this.getall()
        }
    }
    if (!this.lstns.listen(a, b)) {
        return
    }
    var c = this;
    this.notifyLstn = function (k) {
        if (k.ufe0019 != null) {
            c.objCount = k.ufe0019
        }
        var j = k.Mfe0002;
        if (j == null) {
            c.getall();
            return
        }
        for (i in j) {
            var h = j[i];
            var l = h.ufe0001;
            if (l == null) {
                continue
            }
            var f = h.ufe0005;
            if (!h.ufe0013) {
                var d = c.map[l];
                if (!d) {
                    var e = c.acquired[l];
                    if (e) {
                        update(e, h);
                        h = e
                    }
                    h._type = c.getObjType(h);
                    h._owner = c;
                    ++c.size;
                    c.map[l] = h
                } else {
                    update(d, h);
                    h = d
                }
                if (c.attrs.ordered) {
                    var g = c.map[f];
                    if (h._next != g || !d) {
                        if (d) {
                            c.unlink(h)
                        }
                        c.linkBefore(h, g)
                    }
                }
            } else {
                h = c.map[l];
                if (!h) {
                    continue
                }
                h.ufe0013 = 1;
                --c.size;
                if (c.attrs.ordered) {
                    c.unlink(h)
                }
                delete c.map[l]
            }
            c.lstns.notify(h)
        }
    };
    subscribe(this.attrs.path, this.notifyLstn);
    this.getall()
};
ObjectMap.prototype.unlisten = function (a, b) {
    if (this.lstns.unlisten(a, b)) {
        unsubscribe(this.attrs.path, this.notifyLstn);
        this.notifyLstn = null
    }
    if (b) {
        --this.autorefresh
    }
};
ObjectMap.prototype.blockGetall = function (a) {
    this.block = a
};
ObjectMap.prototype.getall = function (a) {
    var d = this.attrs;
    if (this.getallinprogress || this.block) {
        return
    }
    var h = {};
    h.Uff0001 = d.path;
    h.uff0007 = d.getallcmd || 16646148;
    h.ufe000c = 5;
    h.ufe0018 = d.maxobjs;
    if (this.id != null) {
        h.ufe0001 = this.id
    }
    if (d.refreshfilter) {
        h.ufe000c |= d.refreshfilter
    }
    var c = {};
    for (var e in this.map) {
        c[e] = true
    }
    this.getallinprogress = true;
    var g = null;
    var f = this;
    var b = function (s) {
        if (s.ufe0019 != null) {
            f.objCount = s.ufe0019
        }
        var r = s.Mfe0002 || [];
        for (var q in r) {
            var p = r[q];
            var j = f.map[p.ufe0001];
            if (j) {
                update(j, p);
                p = j
            } else {
                var l = f.acquired[p.ufe0001];
                if (l) {
                    update(l, p);
                    p = l
                }
                ++f.size;
                f.map[p.ufe0001] = p
            }
            if (d.ordered) {
                if (p._prev != g || !j) {
                    if (j) {
                        f.unlink(p)
                    }
                    f.linkAfter(p, g)
                }
                g = p
            }
            p._type = f.getObjType(p);
            p._owner = f;
            delete c[p.ufe0001]
        }
        for (var q in r) {
            var p = f.map[r[q].ufe0001];
            f.lstns.notify(p)
        }
        if (a && !a(s)) {
            f.getallinprogress = false;
            return
        }
        if (isError(s)) {
            if (s.uff0008 == 16646158) {
                var m = document.getElementById("content");
                var n = m.lastChild;
                var o = el(el(el(null, "tbody"), "tr"), "td", f.attrs.maxobjsmsg);
                o.colSpan = 21;
                o.className = "tablerror";
                n.appendChild(o)
            }
            f.getallinprogress = false
        } else {
            if ((s.ufe0003 != null || s.mfe0015) && !f.block) {
                if (s.ufe0003 != null) {
                    h.ufe0003 = s.ufe0003
                }
                if (s.mfe0015 != null) {
                    h.mfe0015 = s.mfe0015
                }
                post(h, b)
            } else {
                for (var k in c) {
                    var p = f.map[k];
                    if (!p) {
                        continue
                    }
                    --f.size;
                    p.ufe0013 = 1;
                    if (d.ordered) {
                        f.unlink(p)
                    }
                    delete f.map[k];
                    f.lstns.notify(p)
                }
                f.getallinprogress = false;
                if (!f.block && !f.timer && f.autorefresh >= 1 && d.autorefresh) {
                    f.timer = setTimeout(function () {
                        f.timer = null;
                        if (f.autorefresh >= 1) {
                            f.getall(a)
                        }
                    }, d.autorefresh)
                }
            }
        }
    };
    post(h, b)
};
ObjectMap.prototype.getObjType = function (a) {
    return this.getObjSpecType(a, this.attrs) || this.attrs
};
ObjectMap.prototype.getObjSpecType = function (d, a) {
    if (!a.generic) {
        return null
    }
    var c = a.subtypes[d[a.typeon.id]];
    if (c) {
        return this.getObjSpecType(d, c) || c
    }
    for (var b in a.gensubtypes) {
        c = this.getObjSpecType(d, a.gensubtypes[b]);
        if (c) {
            return c
        }
    }
    return null
};
ObjectMap.prototype.renumurate = function (c, b) {
    if (!c) {
        return
    }
    var a = c._prev ? c._prev._num + 1 : 0;
    do {
        if (c._num == a) {
            break
        }
        c._num = a;
        if (b > 0) {
            --b
        } else {
            this.lstns.notify(c)
        }
        c = c._next;
        ++a
    } while (c)
};
ObjectMap.prototype.unlink = function (a) {
    if (a._next) {
        a._next._prev = a._prev;
        this.renumurate(a._next, 0)
    } else {
        this.last = a._prev;
        if (this.last) {
            this.last._next = null
        }
    }
    if (a._prev) {
        a._prev._next = a._next
    } else {
        this.first = a._next;
        if (this.first) {
            this.first._prev = null
        }
    }
};
ObjectMap.prototype.linkBefore = function (b, a) {
    if (a) {
        b._next = a;
        b._prev = a._prev;
        if (a._prev) {
            a._prev._next = b
        } else {
            this.first = b
        }
        a._prev = b
    } else {
        b._next = null;
        b._prev = this.last;
        if (b._prev) {
            b._prev._next = b
        } else {
            this.first = b
        }
        this.last = b
    }
    this.renumurate(b, 1)
};
ObjectMap.prototype.linkAfter = function (b, a) {
    if (a) {
        b._prev = a;
        b._next = a._next;
        if (a._next) {
            a._next._prev = b
        } else {
            this.last = b
        }
        a._next = b
    } else {
        b._prev = null;
        b._next = this.first;
        if (b._next) {
            b._next._prev = b
        } else {
            this.last = b
        }
        this.first = b
    }
    this.renumurate(b, 1)
};

function FilteredMap(b, a) {
    this.map = b;
    this.attrs = a;
    this.lstns = new Listeners()
}

FilteredMap.prototype.getType = function () {
    return this.attrs
};
FilteredMap.prototype.toString = function (a) {
    return this.map.toString(a)
};
FilteredMap.prototype.getName = function (a) {
    return this.map.getName(a)
};
FilteredMap.prototype.getFullName = function (a) {
    return this.map.getFullName(a)
};
FilteredMap.prototype.getPath = function (b) {
    var a = getPath(this.attrs);
    if (b) {
        if (!b._type.nameval && !b._type.name) {
            return null
        }
        a += b.ufe0001 == null ? ".new" : "." + b.ufe0001
    }
    return a
};
FilteredMap.prototype.getCount = function () {
    return null
};
FilteredMap.prototype.getObject = function (a) {
    return this.map.getObject(a)
};
FilteredMap.prototype.newObject = function (a) {
    a = a || this.attrs.ntitle;
    return this.map.newObject(a)
};
FilteredMap.prototype.removeObject = function (b, a) {
    this.map.removeObject(b, a)
};
FilteredMap.prototype.getSubtypes = function () {
    var a = [];
    if (this.map.getSubtypesFor(this.attrs, a)) {
        return a
    }
    return null
};
FilteredMap.prototype.getSubtype = function (a, b) {
    return this.map.getSubtype(a, b)
};
FilteredMap.prototype.foreach = function (a) {
    var b = this;
    this.map.foreach(function (c) {
        if (b.filter(c)) {
            a(c)
        }
    })
};
FilteredMap.prototype.listen = function (a, b) {
    if (this.lstns.listen(a)) {
        var c = this;
        this.lstn = function (d) {
            if (c.filter(d)) {
                c.lstns.notify(d)
            }
        };
        this.map.listen(this.lstn, true)
    }
};
FilteredMap.prototype.unlisten = function (a, b) {
    if (this.lstns.unlisten(a)) {
        this.map.unlisten(this.lstn, true)
    }
};
FilteredMap.prototype.filter = function (b) {
    for (var a = b._type; a; a = a.inherit) {
        if (a == this.attrs) {
            return true
        }
    }
    return false
};

function ObjectAction(a) {()
    this.attrs = a;
    this.lstns = new Listeners();
    this.autorefresh = 0;
    this.req = {};
    this.req._type = {c: a.request, owner: a};
    this.req._owner = this;
    this.rep = {};
    this.rep._type = {ro: 1, c: a.c, owner: a};
    this.rep._owner = this
}

ObjectAction.prototype.getName = function () {
    return getObjectName(this.req)
};
ObjectAction.prototype.getFullName = function () {
    return {
        name: this.attrs.title,
        cfg: getSysProps(this.attrs),
        propname: "title",
        postfix: (this.started ? "(Running)" : "")
    }
};
ObjectAction.prototype.getPath = function () {
    return getPath(this.attrs)
};
ObjectAction.prototype.getObject = function () {
    return this.getRequest()
};
ObjectAction.prototype.getRequest = function () {
    return this.req
};
ObjectAction.prototype.getReply = function () {
    return this.rep
};
ObjectAction.prototype.isRunning = function () {
    return this.started
};
ObjectAction.prototype.start = function () {
    this.stop();
    var c = {};
    update(c, this.req);
    c.Uff0001 = this.attrs.path;
    c.uff0007 = this.attrs.startcmd;
    for (var a in this.rep) {
        if (a[0] != "_") {
            delete this.rep[a]
        }
    }
    var b = this;
    post(c, function (d) {
        if (isError(d)) {
            showError("Couldn't start", d);
            return
        }
        if (d.ufe0001 != null) {
            b.req.ufe0001 = d.ufe0001
        }
        b.rep.ufe0001 = b.req.ufe0001;
        b.started = true;
        if (b.autorefresh) {
            b.lstns.notify(b.rep);
            b.fetch()
        } else {
            b.stop()
        }
    })
};
ObjectAction.prototype.stop = function () {
    if (this.started) {
        this.started = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null
        }
        var b = {};
        b.Uff0001 = this.attrs.path;
        b.uff0007 = this.attrs.cancelcmd;
        if (this.req.ufe0001 != null) {
            b.ufe0001 = this.req.ufe0001
        }
        var a = this;
        post(b, function (c) {
            a.lstns.notify(a.rep)
        })
    }
};
ObjectAction.prototype.fetch = function () {
    var b = {};
    b.Uff0001 = this.attrs.path;
    b.uff0007 = this.attrs.pollcmd;
    if (this.req.ufe0001 != null) {
        b.ufe0001 = this.req.ufe0001
    }
    var a = this;
    post(b, function (c) {
        if (!a.started) {
            return
        }
        if (isError(c)) {
            showError("Couldn't continue", c);
            a.stop();
            return
        }
        update(a.rep, c);
        a.lstns.notify(a.rep);
        if (c.bfe000b) {
            a.stop()
        } else {
            if (a.autorefresh && !a.timer) {
                a.timer = setTimeout(function () {
                    a.timer = null;
                    a.fetch()
                }, a.attrs.autorefresh)
            }
        }
    })
};
ObjectAction.prototype.autostart = function (a) {
    this.start();
    return false
};
ObjectAction.prototype.listen = function (a, b) {
    if (b) {
        ++this.autorefresh
    }
    this.lstns.listen(a)
};
ObjectAction.prototype.unlisten = function (a, b) {
    if (b && --this.autorefresh == 0) {
        this.stop()
    }
    this.lstns.unlisten(a)
};

function ObjectQuery(b) {
    this.attrs = b;
    this.lstns = new Listeners();
    this.listening = 0;
    this.req = {};
    this.req._type = {c: b.request, owner: b};
    this.req._owner = this;
    if (b.status) {
        this.status = {};
        this.status._type = {c: b.status, ro: 1, owner: b};
        this.status._owner = this
    }
    var c = {};
    c.lstns = new Listeners();
    c.owner = this;
    c.listen = function (d, e) {
        if (e) {
            this.owner.listen(null, e)
        }
        return this.lstns.listen(d)
    };
    c.unlisten = function (d, e) {
        if (e) {
            this.owner.unlisten(null, e)
        }
        return this.lstns.unlisten(d)
    };
    c.notify = function (d) {
        this.lstns.notify(d)
    };
    var a = {
        c: b.c,
        columns: b.columns,
        path: b.path,
        ro: 1,
        ordered: b.autolimit != 0,
        autorefresh: b.autorefresh,
        refreshfilter: b.refreshfilter,
        name: b.name,
        nameval: b.nameval,
        generic: b.generic,
        subtypes: b.subtypes,
        typeon: b.typeon,
        owner: b
    };
    this.map = new ObjectMap(a, c);
    this.map.blockGetall(true)
}

ObjectQuery.prototype.getName = function () {
    return getObjectName(this.req)
};
ObjectQuery.prototype.getFullName = function () {
    return {
        name: this.attrs.title,
        cfg: getSysProps(this.attrs),
        propname: "title",
        postfix: (this.id != null ? "(Running)" : "")
    }
};
ObjectQuery.prototype.getPath = function (a) {
    return getPath(this.attrs)
};
ObjectQuery.prototype.getObject = function (a) {
    if (a == null) {
        return this.getRequest()
    }
    return this.map.getObject(a)
};
ObjectQuery.prototype.getRequest = function () {
    return this.req
};
ObjectQuery.prototype.getStatus = function () {
    return this.status
};
ObjectQuery.prototype.getMap = function () {
    return this.map
};
ObjectQuery.prototype.isRunning = function () {
    return this.id != null
};
ObjectQuery.prototype.start = function () {
    this.stop();
    if (this.starting) {
        return
    }
    this.starting = true;
    var c = {};
    update(c, this.req);
    c.Uff0001 = this.attrs.path;
    c.uff0007 = this.attrs.startcmd;
    var d = this.map;
    d.foreach(function (e) {
        d.remove(e)
    });
    if (this.status) {
        for (var a in this.status) {
            if (a[0] != "_") {
                delete this.status[a]
            }
        }
    }
    var b = this;
    post(c, function (e) {
        b.starting = false;
        if (isError(e)) {
            showError("Couldn't start", e);
            return
        }
        b.id = e.ufe0001 != null ? e.ufe0001 : b.req.ufe0001;
        if (b.listening) {
            b.lstns.notify(b.req);
            b.map.setID(b.id);
            b.map.blockGetall(false);
            b.map.getall(function (f) {
                return b.onGetall(f)
            })
        } else {
            b.stop()
        }
    })
};
ObjectQuery.prototype.stop = function () {
    if (this.id != null) {
        this.map.blockGetall(true);
        var b = {};
        b.Uff0001 = this.attrs.path;
        b.uff0007 = this.attrs.cancelcmd;
        b.ufe0001 = this.id;
        this.id = null;
        var a = this;
        post(b, function (c) {
            a.lstns.notify(a.req)
        })
    }
};
ObjectQuery.prototype.onGetall = function (a) {
    if (this.status && a.Mfe0002 && a.Mfe0002.length >= 1) {
        update(this.status, a.Mfe0002[a.Mfe0002.length - 1]);
        this.lstns.notify(this.status)
    }
    if (this.id == null) {
        return false
    }
    if (isError(a)) {
        showError("Couldn't continue", a);
        this.stop();
        return false
    }
    if (a.bfe000b) {
        this.map.blockGetall(true);
        this.stop();
        return false
    }
    if (this.attrs.autolimit && this.map.getSize() >= this.attrs.autolimit) {
        this.map.remove(this.map.getFirst())
    }
    return true
};
ObjectQuery.prototype.autostart = function (a) {
    this.start();
    return false
};
ObjectQuery.prototype.listen = function (a, b) {
    if (b) {
        ++this.listening
    }
    if (a) {
        this.lstns.listen(a)
    }
};
ObjectQuery.prototype.unlisten = function (a, b) {
    if (b && --this.listening == 0) {
        this.stop()
    }
    if (a) {
        this.lstns.unlisten(a)
    }
};

function Doit(a, b) {
    this.attrs = a;
    this.path = b;
    this.lstns = new Listeners();
    this.obj = {};
    this.obj._type = a;
    this.obj._owner = this
}

Doit.prototype.getName = function () {
    return getObjectName(this.obj)
};
Doit.prototype.getFullName = function () {
    return {name: this.attrs.title || this.attrs.name, cfg: getSysProps(this.attrs), propname: "title"}
};
Doit.prototype.getPath = function () {
    return getPath(this.attrs)
};
Doit.prototype.getObject = function () {
    return this.obj
};
Doit.prototype.setID = function (a) {
    if (a != null) {
        this.obj.ufe0001 = a
    } else {
        delete this.obj.ufe0001
    }
};
Doit.prototype.doit = function (a) {
    var c = {};
    update(c, this.obj);
    c.Uff0001 = this.attrs.path || this.path;
    c.uff0007 = this.attrs.cmd;
    var b = this;
    post(c, function (d) {
        if (b.attrs.autoreset) {
            update(b.obj, {});
            b.lstns.notify(b.obj)
        }
        if (isError(d)) {
            showError(b.attrs.errorprefix || "Couldn't perform action", d)
        }
        if (a) {
            a(!isError(d))
        }
    })
};
Doit.prototype.autostart = function (a) {
    if (this.attrs.confirm && !confirm(this.attrs.confirm)) {
        return true
    }
    this.doit();
    return true
};
Doit.prototype.listen = function (a) {
    this.lstns.listen(a)
};
Doit.prototype.unlisten = function (a) {
    this.lstns.unlisten(a)
};

function SetupManager(a) {
    this.attrs = a;
    this.lstns = new Listeners();
    this.obj = {};
    this.obj._type = a;
    this.obj._owner = this
}

SetupManager.prototype.getName = function () {
    return getObjectName(this.obj)
};
SetupManager.prototype.getFullName = function () {
    return {name: this.attrs.title, cfg: getSysProps(this.attrs), propname: "title"}
};
SetupManager.prototype.getObject = function () {
    return this.obj
};
SetupManager.prototype.getCurrentPage = function () {
    return this.pageHistory[this.pageNow]
};
SetupManager.prototype.getCurrentDescription = function () {
    return this.pageDescrs[this.pageNow]
};
SetupManager.prototype.isFinished = function () {
    return this.finished
};
SetupManager.prototype.reset = function () {
    this.finished = false;
    this.pageNow = 0;
    this.pageHistory = [1];
    this.pageDescrs = [];
    this.lstns.notify(this.obj)
};
SetupManager.prototype.back = function () {
    if (this.pageNow > 0) {
        --this.pageNow;
        this.lstns.notify(this.obj)
    }
};
SetupManager.prototype.next = function (a) {
    if (a && this.pageNow + 1 < this.pageHistory.length) {
        ++this.pageNow;
        this.lstns.notify(this.obj);
        return
    }
    var c = {};
    c.Uff0001 = this.attrs.path;
    c.uff0007 = 16646152;
    c.mfe000f = this.obj;
    c.ufe000e = this.pageHistory[this.pageNow];
    var b = this;
    post(c, function (d) {
        if (isError(d)) {
            showError(b.getName(), d);
            if (d.uff0008 == 16646152) {
                b.finished = true;
                b.lstns.notify(b.obj);
                return
            }
            return
        }
        if (d.bfe000b) {
            b.finished = true;
            b.lstns.notify(b.obj);
            return
        }
        if (d.mfe000f) {
            update(b.obj, d.mfe000f)
        }
        ++b.pageNow;
        b.pageHistory.splice(b.pageNow, b.pageHistory.length - b.pageNow);
        b.pageHistory.push(d.ufe000e);
        b.pageDescrs[b.pageNow] = d.sfe0009;
        b.lstns.notify(b.obj)
    })
};
SetupManager.prototype.listen = function (a) {
    this.lstns.listen(a)
};
SetupManager.prototype.unlisten = function (a) {
    this.lstns.unlisten(a)
};

function fooListener(a) {
}

function getContainer(b) {
    while (b.inherit) {
        b = b.inherit
    }
    for (var c in pool) {
        if (pool[c].attrs == b) {
            var a = pool[c].container;
            pool.splice(c, 1);
            pool.push({attrs: b, container: a});
            return a
        }
    }
    var a = container[b.type].create(b);
    if (!b.autostop) {
        a.listen(fooListener)
    }
    pool.push({attrs: b, container: a});
    if (pool.length > 10) {
        pool[0].container.unlisten(fooListener);
        pool.splice(0, 1)
    }
    return a
}

function getObjectMap(b) {
    var a = mapAttrs[b];
    return a ? getContainer(a) : null
}

function isContainerVisible(a) {
    return a.title && !a.nonpublic && (!a.pred || isTrue(a.pred))
}

function isTabless(a) {
    return !container[a.service.c[0].type].tab
}

function isTablessContainer(d) {
    if (d.owner) {
        d = d.owner
    }
    if (container[d.type].tab) {
        return false
    }
    var a = d.service;
    for (var b in a.c) {
        if (!isContainerVisible(a.c[b])) {
            continue
        }
        return a.c[b] == d
    }
    return false
}

function isServiceVisible(a) {
    if (a.pred && !isTrue(a.pred)) {
        return false
    }
    for (var b in a.c) {
        if (isContainerVisible(a.c[b])) {
            return true
        }
    }
    return false
}

function isROObj(b, a) {
    if (!a) {
        a = b._type
    }
    return a.ro || b.bfe0007
}

function CmpOrder() {
    this.next = null
}

CmpOrder.prototype.cmp = function (b, a) {
    return b._num < a._num
};

function CmpAscending(b, a, c) {
    this.col = b;
    this.attrs = a;
    this.next = c;
    this.ascend = true
}

CmpAscending.prototype.cmp = function (b, a) {
    var d = ftype(this.attrs).get(this.attrs, b);
    var c = ftype(this.attrs).get(this.attrs, a);
    if (d == null) {
        if (c != null) {
            return true
        }
    } else {
        if (c == null) {
            return false
        }
        if (ftype(this.attrs).less(this.attrs, d, c)) {
            return true
        }
        if (ftype(this.attrs).less(this.attrs, c, d)) {
            return false
        }
    }
    if (!this.next) {
        return false
    }
    return this.next.cmp(b, a)
};

function CmpDescending(b, a, c) {
    this.col = b;
    this.attrs = a;
    this.next = c
}

CmpDescending.prototype.cmp = function (b, a) {
    var d = ftype(this.attrs).get(this.attrs, b);
    var c = ftype(this.attrs).get(this.attrs, a);
    if (d == null) {
        if (c != null) {
            return false
        }
    } else {
        if (c == null) {
            return true
        }
        if (ftype(this.attrs).less(this.attrs, c, d)) {
            return true
        }
        if (ftype(this.attrs).less(this.attrs, d, c)) {
            return false
        }
    }
    if (!this.next) {
        return false
    }
    return this.next.cmp(b, a)
};

function Table(a, c, d) {
    this.attrs = c.getType();
    this.prefs = getPrefs(this.attrs);
    this.map = c;
    this.columns = [];
    this.columnWidths = {};
    this.flags = [];
    this.rows = {};
    this.order = [];
    this.selected = {};
    this.destroyLstns = new Listeners();
    this.dragCnt = 0;
    this.dragging = null;
    if (d) {
        this.status = el(d.firstChild.firstChild, "td", "\u00a0")
    }
    this.init(a);
    var b = this;
    this.lstn = function (e) {
        if (b.updateRow(e)) {
            b.updateStatus()
        }
    };
    this.map.listen(this.lstn, true);
    this.update()
}

Table.prototype.destroy = function () {
    if (this.redrawTimer) {
        clearTimeout(this.redrawTimer)
    }
    for (var b in this.rows) {
        this.removeRowHandlers(this.rows[b], null)
    }
    for (var b in this.columns) {
        if (!this.columns[b]) {
            continue
        }
        var a = this.columns[b];
        ftype(a).unlisten(a, this.columnLstn)
    }
    if (this.filter && this.filter.unlstn) {
        this.filter.unlstn()
    }
    this.map.unlisten(this.lstn, true);
    this.destroyLstns.notify()
};
Table.prototype.onDestroy = function (a) {
    this.destroyLstns.listen(a)
};
Table.prototype.init = function (b) {
    function d(o, n, h) {
        var p = el(o, n);
        p.width = h;
        return p
    }

    var k = this;
    this.expired = true;
    this.columnLstn = function () {
        if (!k.expired) {
            return
        }
        k.expired = false;
        k.redrawTimer = setTimeout(function () {
            k.redrawTimer = null;
            k.expired = true;
            k.update()
        }, 200)
    };
    this.table = elc(b, "table", "table");
    this.table.cellSpacing = 0;
    this.header = el(el(this.table, "thead"), "tr");
    el(d(this.header, "th", 40), "span", "\u00a0");
    el(d(this.header, "th", 30), "span", "\u00a0");
    if (this.attrs.ordered) {
        el(d(this.header, "th", 40), "span", "#")
    }
    for (var e in this.attrs.columns) {
        var m = this.attrs.columns[e];
        var c = !m.nonpublic ? ftype(m).column(m, this, this.attrs) : null;
        if (c && c[1] && c[1] != 4294967295) {
            var g = el(this.header, "th");
            g.title = c[0];
            g.width = c[1];
            el(g, "span", c[0]);
            ftype(m).listen(m, this.columnLstn);
            this.columns.push(m)
        } else {
            this.columns.push(null)
        }
    }
    var a = el(this.header, "th", "\u00A0").width = "100%";
    var f = this.header;
    var l = function (n, h) {
        n = n || event;
        var o = n.srcElement || n.target;
        if (o.nodeName == "SPAN") {
            o = o.parentNode
        }
        h -= o.offsetLeft;
        if (h < 6) {
            return o.previousSibling
        }
        if (h >= o.offsetWidth - 6) {
            return o
        }
        return null
    };
    var j = function (o) {
        if (k.drag) {
            return true
        }
        var h = getPos(o, k.table).x;
        if (k.columnResized != null) {
            var n = k.columnResized;
            n.width = Math.max(parseInt(n.width) + h - k.lastX, 12);
            k.lastX = h;
            return false
        }
        if (l(o, h)) {
            document.body.style.cursor = "col-resize"
        } else {
            document.body.style.cursor = "default"
        }
        return false
    };
    f.onmouseover = j;
    f.onmousemove = j;
    f.onmousedown = function (p) {
        var n = getPos(p, k.table).x;
        var o = l(p, n);
        if (o) {
            k.columnResized = o;
            k.lastX = n;
            document.body.style.cursor = "col-resize";
            var h = false;
            if (!p && f.setCapture) {
                f.setCapture();
                h = true
            } else {
                document.onmousemove = j
            }
            document.onmouseup = function (t) {
                var s = k.findColumn(k.columnResized);
                if (s != null) {
                    var r = k.columns[s];
                    k.columnWidths[r.name] = k.columnResized.width;
                    k.updateColumnPrefs()
                }
                document.body.style.cursor = "default";
                if (h) {
                    f.releaseCapture()
                } else {
                    document.onmousemove = null
                }
                document.onmouseup = null;
                k.columnResized = null;
                return false
            };
            return false
        }
        var q = getEventSrc(p);
        if (q.nodeName == "SPAN") {
            q = q.parentNode
        }
        if (q == f.cells[0] || q == f.cells[1]) {
            return false
        }
        k.columnPressed = q;
        addClass(q, "pressed");
        document.onmousemove = function (r) {
            if (getEventSrc(r) == k.columnPressed) {
                addClass(k.columnPressed, "pressed")
            } else {
                removeClass(k.columnPressed, "pressed")
            }
            return false
        };
        document.onmouseup = function (r) {
            if (k.columnPressed == null) {
                return true
            }
            if (hasClass(k.columnPressed, "pressed")) {
                removeClass(k.columnPressed, "pressed");
                k.sortBy(k.columnPressed)
            }
            k.columnPressed = null;
            document.onmouseup = null;
            document.onmousemove = null
        };
        return false
    };
    f.onmouseout = function (h) {
        h = h || event;
        var n = h.toElement || h.relatedTarget;
        if (n) {
            if (n.nodeName == "SPAN") {
                n = n.parentNode
            }
            if (n.nodeName == "TH") {
                return false
            }
        }
        if (!k.columnResized) {
            document.body.style.cursor = "default"
        }
        return false
    };
    this.loadPrefs()
};
Table.prototype.addFlag = function (a, b) {
    this.flags.push([a, b])
};
Table.prototype.addEnable = function (a) {
    this.enable = a
};
Table.prototype.addComment = function (a) {
    this.comment = a
};
Table.prototype.addAboutInfo = function (a) {
    this.about = a
};
Table.prototype.addFilter = function (r) {
    var t = r.values;
    var o;
    if (t) {
        o = getAttr(this.attrs, r.on);
        if (shouldHide(getAttrProp(this.attrs, o))) {
            t = null
        }
    }
    if (r.conds) {
        var n = {type: "static", map: {}};
        for (var k = 0; k < r.conds.length; ++k) {
            var q = r.conds[k];
            var d = getAttr(this.attrs, q.on);
            if (!d) {
                continue
            }
            var l = true;
            for (var h in d.c) {
                var s = getAttr(this.attrs, d.c[h].on);
                if (s && !shouldHide(getAttrProp(this.attrs, s))) {
                    l = false;
                    break
                }
            }
            if (!l) {
                n.map[-k - 2] = q.name
            }
        }
        if (!isempty(n.map)) {
            if (t) {
                t = {type: "pair", c: [t, n]}
            } else {
                t = n
            }
        }
    }
    if (!t) {
        return
    }
    t = {type: "defenum", defid: -1, defname: "all", values: t};
    var p = this;
    var b = el(null, "select");
    p.filter = {};
    p.filter.values = t;
    if (o) {
        p.filter.id = o.id
    }
    p.filter.ctrl = b;
    p.filter.name = "all";
    p.filter.value = -1;
    b.onchange = function (a) {
        p.setFilterValue(parseInt(b.value));
        p.updateFilterPrefs()
    };
    var f = function (e, a) {
        if (p.filter.name && p.filter.value == null) {
            var c = enm[p.filter.values.type].toString(e, p.filter.values);
            if (p.filter.name == c) {
                p.setFilterValue(e);
                p.filter.ctrl.selectedIndex = a
            }
        }
    };
    if (!p.filter.lstn) {
        p.filter.lstn = fillOptions(b, t, true, null, null, null, f)
    }
    p.filter.unlstn = function () {
        enm[t.type].unlisten(t, p.filter.lstn)
    };
    var g = document.getElementById("toolbar");
    var m = elc(elc(g.firstChild, "span", "filter"), "span", "select");
    m.appendChild(b);
    return b
};
Table.prototype.setFilterValue = function (b) {
    this.filter.value = b;
    this.filter.name = enm[this.filter.values.type].toString(b, this.filter.values);
    this.filter.pred = null;
    if (b < -1) {
        var a = filterAttrs.conds[-b - 2];
        var d = getAttr(this.attrs, a.on);
        this.filter.pred = d.c[0].pred;
        this.filter.attr = getAttr(this.attrs, d.c[0].on)
    }
    this.update()
};
Table.prototype.getFilterValue = function () {
    if (this.filter && this.filter.value >= 0) {
        return this.filter.name
    }
    return null
};
Table.prototype.update = function (b) {
    var a = this;
    this.map.foreach(function (c) {
        a.updateRow(c, b)
    });
    this.updateStatus()
};
Table.prototype.updateStatus = function () {
    if (!this.status) {
        return
    }
    var a = this.table.childNodes.length - 1;
    var c = a != 1 ? a + " items" : "1 item";
    var b = this.map.getCount();
    if (b != null && a != b) {
        c += " out of " + b
    }
    replaceText(this.status, c)
};
Table.prototype.cancelDragNDrop = function (a) {
    if (this.release) {
        a.releaseCapture();
        a.onmousemove = null;
        a.onmouseup = null;
        a.onlosecapture = null
    } else {
        document.onmousemove = null;
        document.onmouseup = null
    }
    if (this.dragTimer) {
        clearTimeout(this.dragTimer);
        this.dragTimer = null
    }
    if (this.dropTarget) {
        removeClass(this.dropTarget, "droptarget")
    }
    if (this.drag) {
        document.body.removeChild(this.drag);
        this.drag = null
    }
    this.dropTarget = null;
    this.dragging = null
};
Table.prototype.addRowHandlers = function (e, d) {
    var c = this;
    if (!this.attrs.ordered || this.attrs.ro) {
        e.onmousedown = function (f) {
            return false
        };
        e.onclick = function (g) {
            var h = getEventSrc(g);
            if (h && h.nodeName == "A") {
                return true
            }
            var f = c.map.getPath(d);
            if (f) {
                openContent(f)
            }
            return false
        };
        return
    }
    var b = function (k) {
        if (c.dragTimer) {
            clearTimeout(c.dragTimer);
            c.dragTimer = null;
            c.drag.style.display = "block"
        }
        if (c.dragging == null) {
            c.dragging = d;
            c.drag = el(null, "table");
            c.drag.style.position = "absolute";
            c.drag.style.opacity = "0.6";
            c.drag.style.zIndex = "10";
            c.drag.appendChild(e.cloneNode(true));
            document.body.appendChild(c.drag)
        }
        var n = getPos(k);
        c.drag.style.left = (n.x + 8) + "px";
        c.drag.style.top = (n.y + 8) + "px";
        var j = e.offsetHeight;
        var g = window.innerHeight || document.documentElement.clientHeight;
        var m = n.clientY;
        var h = m < 0 ? m : (m > g ? m - g : 0);
        var l = null;
        if (h == 0) {
            l = getEventSrc(k);
            while (l && l.nodeName != "TBODY" && l.nodeName != "THEAD") {
                l = l.parentNode
            }
            if (l && l.parentNode != c.table) {
                l = null
            }
        }
        if (c.dropTarget != l) {
            if (c.dropTarget) {
                removeClass(c.dropTarget, "droptarget")
            }
            c.dropTarget = l;
            if (c.dropTarget) {
                addClass(c.dropTarget, "droptarget")
            }
        }
        if (h != 0) {
            var f = function () {
                window.scrollBy(0, h * 2);
                c.dragTimer = setTimeout(f, 100)
            };
            c.drag.style.display = "none";
            c.dragTimer = setTimeout(f, 1)
        }
        return false
    };
    var a = function (g) {
        var f = c.dragging;
        var h = c.dropTarget;
        c.cancelDragNDrop(e);
        if (!f) {
            openContent(c.map.getPath(d));
            return false
        }
        if (h) {
            c.map.moveObjectAfter(f, c.getRowObject(h))
        }
        return false
    };
    e.onmousedown = function (f) {
        if (getEventSrc(f).nodeName == "A") {
            return false
        }
        if (!f && e.setCapture) {
            c.release = true;
            e.setCapture();
            e.onmousemove = b;
            e.onmouseup = a;
            e.onlosecapture = function () {
                c.cancelDragNDrop(e);
                return false
            }
        } else {
            c.release = false;
            document.onmousemove = b;
            document.onmouseup = a
        }
        return false
    }
};
Table.prototype.removeRowHandlers = function (b, a) {
    b.onclick = null;
    b.ondblclick = null;
    b.onmousedown = null;
    if (this.dragging == a) {
        this.cancelDragNDrop(b)
    }
};
Table.prototype.getRowObject = function (b) {
    for (var a in this.rows) {
        if (this.rows[a] == b) {
            return this.map.getObject(a)
        }
    }
    return null
};
Table.prototype.updateComment = function (e, c) {
    var d = ftype(this.comment).get(this.comment, c);
    if (d) {
        if (e.firstChild.className != "comment") {
            var b = this.map.getPath(c);
            var a = elc(null, "tr", "comment");
            var f = el(a, "td");
            f.colSpan = this.header.cells.length;
            e.insertBefore(a, e.firstChild)
        }
        replaceText(e.firstChild.firstChild, ";;; " + d)
    } else {
        if (e.firstChild.className == "comment") {
            e.removeChild(e.firstChild)
        }
    }
};
Table.prototype.updateAboutInfo = function (h, d) {
    var b = ftype(this.about).get(this.about, d);
    if (!b) {
        b = []
    }
    var j = h.firstChild;
    if (j.className == "comment") {
        j = j.nextSibling
    }
    var g;
    for (g = 0; j.className == "about" && g < b.length; ++g) {
        replaceText(j.firstChild, "--- " + b[g]);
        j = j.nextSibling
    }
    if (g == b.length) {
        while (j.className == "about") {
            var f = j.nextSibling;
            h.removeChild(j);
            j = f
        }
    }
    for (; g < b.length; ++g) {
        var a = this.map.getPath(d);
        var e = elc(null, "tr", "about");
        var c = el(e, "td", "--- " + b[g]);
        c.colSpan = this.header.cells.length;
        h.insertBefore(e, j)
    }
};
Table.prototype.updateEnable = function (e, c) {
    if (isROObj(c)) {
        return
    }
    var a = e.lastChild;
    var b = a.cells[0];
    var d = ftype(this.enable).get(this.enable, c);
    if (!d) {
        b.lastChild.innerHTML = "E";
        b.lastChild.title = "Enable"
    } else {
        b.lastChild.innerHTML = "D";
        b.lastChild.title = "Disable"
    }
};
Table.prototype.updateCells = function (q, e) {
    var r = q.lastChild;
    var b = r.cells[1];
    clearNodes(b);
    var c = {};
    var k = "";
    if (q.className.indexOf("droptarget") != -1) {
        k = "droptarget"
    }
    for (var g in this.flags) {
        var o = this.flags[g][0];
        var p = this.flags[g][1];
        if (p && c[p]) {
            continue
        }
        var a = ftype(o).get(o, e);
        var h = ftype(o).flag(document, o, a);
        if (h) {
            if (h.className != "") {
                k = h.className
            }
            b.appendChild(h);
            if (p) {
                c[p] = true
            }
        }
    }
    if (this.selected[e.ufe0001]) {
        k += " selected"
    }
    q.className = k;
    var l = e._type;
    var m = 2;
    if (this.attrs.ordered) {
        replaceText(r.cells[m++], e._num)
    }
    for (var g in this.columns) {
        if (!this.columns[g]) {
            continue
        }
        var o = l.columns[g];
        var a = ftype(o).get(o, e);
        o = this.attrs.columns[g];
        var n = r.cells[m];
        var j = ftype(o).cell(document, o, e, a, n.firstChild);
        if (j != n.firstChild) {
            clearNodes(n);
            if (j) {
                n.appendChild(j)
            }
        }
        ++m
    }
    if (this.comment) {
        this.updateComment(q, e)
    }
    if (this.about) {
        this.updateAboutInfo(q, e)
    }
    if (this.enable) {
        this.updateEnable(q, e)
    }
};
Table.prototype.findRowIndex = function (b) {
    for (var a = 0; a < this.order.length; ++a) {
        if (this.order[a] == b) {
            return a
        }
    }
    return null
};
Table.prototype.insertRow = function (h, g, d) {
    var b = this.order;
    if (!d) {
        var f = function (k, l, j) {
            if (j > 0 && !k.cmp(b[j - 1], l)) {
                return false
            }
            if (j < b.length - 1 && !k.cmp(l, b[j + 1])) {
                return false
            }
            return true
        };
        var a = this.findRowIndex(g);
        if (a != null) {
            if (f(this.sortKey, g, a)) {
                return
            }
            b.splice(a, 1)
        }
        this.table.removeChild(h)
    }
    var c = this.sortKey;
    var a = binarySearch(this.order, g, function (k, j) {
        return c.cmp(k, j)
    });
    if (a < b.length) {
        b.splice(a, 0, g);
        var e = this.rows[b[a + 1].ufe0001];
        this.table.insertBefore(h, e)
    } else {
        b.push(g);
        this.table.appendChild(h)
    }
};
Table.prototype.shouldHide = function (c) {
    for (var b in this.matcherFilter) {
        var a = this.matcherFilter[b];
        if (!a.func(ftype(a.attr).get(a.attr, c))) {
            return true
        }
    }
    if (!this.filter) {
        return false
    }
    if (this.filter.value < 0) {
        if (this.filter.pred) {
            var d = ftype(this.filter.attr).get(this.filter.attr, c);
            return !isTrue(this.filter.pred, d)
        }
        return false
    }
    return c[this.filter.id] != this.filter.name
};
Table.prototype.updateRow = function (k, e) {
    var m = k.ufe0001;
    var g = this.rows[m];
    if (k.ufe0013 || this.shouldHide(k)) {
        if (g) {
            this.removeRowHandlers(g, k);
            g.parentNode.removeChild(g);
            delete this.rows[m];
            var l = this.findRowIndex(k);
            if (l != null) {
                this.order.splice(l, 1)
            }
        }
        return true
    }
    var a = getContainerProp(k._type);
    if (!skinMode && a._hide) {
        return true
    }
    if (k._type.service) {
        var h = getServiceProp(k._type.service);
        if (!skinMode && h._hide) {
            return true
        }
    }
    var d = false;
    if (!g) {
        d = true;
        g = el(null, "tbody");
        var j = el(g, "tr");
        this.addRowHandlers(g, k);
        var r = el(j, "td");
        var s = (!k._type.nonaddable && !this.attrs.ro) || this.attrs.removable;
        if (s && !shouldHide(getSysProp(k, "remove"))) {
            var t = this;
            var c = tbtn(r, "-");
            c.title = "Remove";
            c.onclick = function (u) {
                u = u || event;
                if (u.stopPropagation) {
                    u.stopPropagation()
                }
                t.map.removeObject(k)
            }
        }
        if (this.enable && !isROObj(k)) {
            if (!shouldHide(getSysProp(k, "set"))) {
                var b = tbtn(r, "E");
                var o = this.enable;
                b.onclick = function (u) {
                    u = u || event;
                    if (u.stopPropagation) {
                        u.stopPropagation()
                    }
                    ftype(o).put(o, k, ftype(o).get(o, k) ? 0 : 1);
                    k._owner.setObject(k)
                }
            } else {
                var p = el(r, "span", "E");
                p.style.display = "none"
            }
        }
        el(j, "td");
        if (this.attrs.ordered) {
            el(j, "td")
        }
        for (var q in this.columns) {
            if (this.columns[q]) {
                el(j, "td")
            }
        }
        el(j, "td");
        this.rows[m] = g
    }
    if (!this.sortKey) {
        var f = this.map.getNextID(k);
        var n = this.rows[f];
        if (d || g.nextSibling != n) {
            if (!d) {
                this.table.removeChild(g)
            }
            if (n) {
                this.table.insertBefore(g, n)
            } else {
                this.table.appendChild(g)
            }
        }
    } else {
        this.insertRow(g, k, d)
    }
    if (!e || d) {
        this.updateCells(g, k)
    }
    return d
};
Table.prototype.findColumnByName = function (b) {
    var a = 2;
    if (this.attrs.ordered) {
        ++a
    }
    for (var c in this.columns) {
        if (this.columns[c] == null) {
            continue
        }
        if (this.columns[c].name == b) {
            return this.header.cells[a]
        }
        ++a
    }
    return null
};
Table.prototype.findColumn = function (b) {
    var a = 2;
    if (this.attrs.ordered) {
        ++a
    }
    for (var c in this.columns) {
        if (this.columns[c] == null) {
            continue
        }
        if (this.header.cells[a] == b) {
            return c
        }
        ++a
    }
    return null
};
Table.prototype.sortBy = function (b, e) {
    var c = this.findColumn(b);
    if (c == null && !this.attrs.ordered) {
        return
    }
    if (this.sortKey) {
        removeClass(this.sortKey.col, "sort-descend");
        removeClass(this.sortKey.col, "sort-ascend")
    }
    var a = true;
    var d = this.sortKey;
    if (this.sortKey && this.sortKey.col == b) {
        d = d.next;
        a = !this.sortKey.ascend
    }
    if (!d && this.attrs.ordered) {
        d = new CmpOrder()
    }
    if (c != null) {
        if (a) {
            addClass(b, "sort-ascend");
            this.sortKey = new CmpAscending(b, this.columns[c], d)
        } else {
            addClass(b, "sort-descend");
            this.sortKey = new CmpDescending(b, this.columns[c], d)
        }
    } else {
        this.sortKey = null
    }
    this.updateSortPrefs();
    this.order = [];
    if (!e) {
        this.update(true)
    }
};
Table.prototype.loadPrefs = function () {
    if (this.prefs.M1) {
        var k = this.prefs.M1;
        for (var h in k) {
            var b = k[h].sfe0010;
            var e = k[h].u1;
            this.columnWidths[b] = e;
            var j = this.findColumnByName(b);
            if (j) {
                j.width = e
            }
        }
    }
    if (this.prefs.S1) {
        var l = this.prefs.S1;
        for (var h = l.length - 1; h >= 0; --h) {
            var b = l[h];
            var g = true;
            if (b.charAt(0) == "!") {
                b = b.substr(1);
                g = false
            }
            var f = this.findColumnByName(b);
            if (f) {
                this.sortBy(f, true);
                if (!g) {
                    this.sortBy(f, true)
                }
            }
        }
    }
    if (this.prefs.s1 && this.filter) {
        this.filter.name = this.prefs.s1;
        this.filter.value = null;
        var a = enm[this.filter.values.type].getMap(this.filter.values);
        for (var d in a) {
            if (a[d] == this.filter.name) {
                this.setFilterValue(d);
                this.filter.ctrl.selectedIndex = getOptionIndex(this.filter.ctrl, d);
                break
            }
        }
    }
    if (!this.sortKey && !this.attrs.ordered) {
        this.sortBy(this.header.cells[2], true)
    }
};
Table.prototype.updateSortPrefs = function () {
    var a = 8;
    var c = [];
    for (var d = this.sortKey; d && d.attrs; d = d.next) {
        if (--a == 0) {
            d.next = null
        }
        var b = d.attrs.name;
        if (!d.ascend) {
            b = "!" + b
        }
        c.push(b)
    }
    this.prefs.S1 = c;
    setPrefs(this.prefs)
};
Table.prototype.updateColumnPrefs = function () {
    var b = [];
    for (var a in this.columnWidths) {
        b.push({sfe0010: a, u1: this.columnWidths[a]})
    }
    this.prefs.M1 = b;
    setPrefs(this.prefs)
};
Table.prototype.updateFilterPrefs = function () {
    if (this.filter.name) {
        this.prefs.s1 = this.filter.name;
        setPrefs(this.prefs)
    }
};

function Pane(a, b) {
    this.attrs = a;
    this.top = b
}

Pane.prototype.getPath = function () {
    return getPath(this.attrs)
};
Pane.prototype.open = function (a) {
    var b = document.getElementById("content");
    this.createTabs(a);
    this.tb = el(b, "div");
    this.tb.id = "toolbar";
    elc(this.tb, "ul", "toolbar");
    el(b, "table").id = "filter";
    var d = el(b, "table");
    d.id = "statusbar";
    d.cellSpacing = 0;
    d.cellPadding = 0;
    var c = el(el(d, "tbody"), "tr");
    this.create(b);
    this.addButtons(a);
    if (c.firstChild) {
        c.lastChild.style.width = "100%"
    } else {
        b.removeChild(d)
    }
    elc(this.tb.firstChild, "li", "postfix")
};
Pane.prototype.close = function () {
};
Pane.prototype.setCustomTitle = function (a, c) {
    var b = document.getElementById("title");
    clearNodes(b);
    b.appendChild(a);
    el(b, "span", " " + c);
    this.customTitle = true
};
Pane.prototype.setTitle = function (c, a, f, e, b) {
    if (this.customTitle) {
        return
    }
    if (a && a[f] && a[f].name) {
        a[f] = a[f].name
    }
    var d = document.getElementById("title");
    if (!b) {
        clearNodes(d);
        d.appendChild(viewLabel(a, c, f));
        if (e != null) {
            el(d, "span", " " + e)
        }
    } else {
        if (e != null) {
            replaceText(d.firstChild.nextSibling, " " + e)
        }
    }
    if (a && a[f]) {
        c = a[f]
    }
    if (e) {
        c += " " + e
    }
    setDocumentTitle(c)
};
Pane.prototype.setTitleFromObject = function (c, b) {
    var a = c._owner.getFullName(c);
    this.setTitle(a.name, a.cfg, a.propname, a.postfix, b)
};
Pane.prototype.createTabs = function (m) {
    var k = document.getElementById("tabs");
    clearNodes(k);
    var g = el(k, "ul");
    el(g, "li", "\u00A0").className = "prefix";
    if (isTabless(m) || !this.top) {
        return
    }
    var e = m.service;
    for (var b in e.c) {
        var f = e.c[b];
        if (!isContainerVisible(f) || f.hide) {
            continue
        }
        if (!container[f.type].tab) {
            continue
        }
        var d = getContainerProp(f);
        if (!skinMode && d._hide) {
            continue
        }
        var l = el(g, "li");
        var j = el(l, "a");
        j.draggable = 0;
        j.ondragstart = function () {
            return false
        };
        if (f == m) {
            j.className = "active"
        }
        j.href = getPath(f);
        if (skinMode) {
            addClass(j, "skin")
        }
        var h = viewLabel(d, f.title);
        j.appendChild(h);
        if (skinMode) {
            new SkinCntrl(j, d, h)
        }
    }
    el(g, "li", "\u00A0").className = "postfix";
    if (g.childNodes.length == 3) {
        clearNodes(k)
    }
};
Pane.prototype.addButtons = function (e) {
    if ((!this.top || isTabless(e)) && !isTablessContainer(e)) {
        return
    }
    var d = e.service;
    var g = 0;
    for (; g < d.c.length; ++g) {
        if (d.c[g] == e) {
            break
        }
    }
    for (++g; g < d.c.length; ++g) {
        var h = d.c[g];
        if (!isContainerVisible(h) || h.hide) {
            continue
        }
        if (this.top && container[h.type].tab) {
            break
        }
        var f = getContainerProp(h);
        if (!skinMode && f._hide) {
            continue
        }
        var a = this.addButton(h.title, f, getPath(h));
        if (skinMode) {
            new SkinCntrl(a, f, a.firstChild)
        }
    }
};
Pane.prototype.addButton = function (c, a, b) {
    return createButton(this.tb.firstChild, c, a, b)
};
Pane.prototype.hideToolbar = function () {
    this.tb.style.display = "none"
};
Pane.prototype.getToolbar = function (a) {
    return this.tb.firstChild
};

function TablePane(b, c, a) {
    Pane.call(this, b, true);
    this.map = c;
    this.objID = a
}

TablePane.prototype = inherit(Pane.prototype);
TablePane.prototype.create = function (f) {
    if (this.objID != null) {
        var j = this;
        this.lstn = function (b) {
            if (b.ufe0001 == j.objID) {
                reopen()
            }
        };
        this.map.listen(this.lstn)
    }
    if (isTabless(this.attrs)) {
        this.addButton("Close", null, getPath(this.attrs.service));
        this.addButton()
    }
    if (this.attrs.service.owner) {
        var d = this.attrs.service.owner;
        this.addButton("Close", null, getPath(findContainer(normalize(d.group), normalize(d.title))));
        this.addButton()
    }
    this.setTitle(this.attrs.service.title, getSysProps(this.attrs), "title");
    if (!this.attrs.ro && !shouldHide(getSysProp(this.attrs, "set")) && !shouldHide(getSysProp(this.attrs, "remove"))) {
        var c = this.map;

        function a() {
            var m = c.getSubtypes();
            if (m == null) {
                return null
            }
            for (var l in m) {
                var b = c.getSubtype(c.getType(), normalize(m[l]));
                if (getContainerProp(b)._hide || (!skinMode && getSysProp(b, "remove")._hide)) {
                    delete m[l]
                }
            }
            return !isempty(m) ? m : null
        }

        function e(l) {
            var b = c.getSubtype(c.getType(), normalize(l));
            return getSysProp(b, "remove")
        }

        var h = getSysProp(this.attrs, "add");
        var g = a();
        if (g) {
            var k = new MenuButton(this.getToolbar(), "Add New", h, a, skinMode ? e : null);
            var j = this;
            k.onclick = function (b) {
                openContent(getPath(j.attrs) + ".new." + normalize(g[b]))
            };
            this.addbtn = k
        } else {
            if (!this.attrs.nonaddable) {
                var k = this.addButton("Add New", h);
                var j = this;
                k.onclick = function (m) {
                    if (!isSkinEvent(m)) {
                        var b = getPath(j.attrs) + ".new";
                        var l = j.table.getFilterValue();
                        if (l) {
                            b += "." + l
                        }
                        openContent(b);
                        return false
                    }
                    return true
                }
            }
        }
    }
    this.table = new Table(f, this.map, document.getElementById("statusbar"))
};
TablePane.prototype.addFilterRow = function (n, h) {
    var d = ["contain", "contain not", "is", "is not", "in", "not in", "<", "<=", ">", ">="];
    var u = this;
    var l = el(null, "div");
    var s = el(l, "select");
    var p = el(l, "select");
    s.onchange = function (z) {
        p.innerHTML = "";
        var v = u.attrs.columns[s.value];
        var y = ftype(v).filter(v, true);
        for (var x in y) {
            var A = y[x];
            var w = el(p, "option");
            w.text = d[A];
            w.value = A
        }
    };
    for (var o in u.attrs.columns) {
        var t = u.attrs.columns[o];
        if (ftype(t).filter && !t.nonpublic) {
            var b = el(s, "option");
            b.text = ftype(t).filter(t);
            b.value = o;
            var j = binarySearch(s.options, b, function (v, e) {
                return v.text < e.text
            });
            try {
                var k = j < s.options.length ? s.options[j] : null;
                s.add(b, k)
            } catch (r) {
                s.add(b, j)
            }
        }
    }
    var t = u.attrs.columns[s.value];
    var f = ftype(t).filter(t, true);
    for (var o in f) {
        var g = f[o];
        var b = el(p, "option");
        b.text = d[g];
        b.value = g
    }
    var m = new TextInput(el(l, "input"));
    m.onchange = function (e) {
        var a = m.getElement();
        a.style.color = ""
    };
    var q = tbtn(l, "+");
    q.onclick = function () {
        u.addFilterRow(n, l.nextSibling)
    };
    var c = tbtn(l, "-");
    c.onclick = function () {
        u.removeFilterRow(n, l)
    };
    if (h) {
        n.insertBefore(l, h)
    } else {
        n.appendChild(l)
    }
};
TablePane.prototype.removeFilterRow = function (a, b) {
    if (a.childNodes.length > 1) {
        a.removeChild(b)
    }
};
TablePane.prototype.close = function () {
    this.table.destroy();
    if (this.addbtn) {
        this.addbtn.destroy()
    }
    if (this.lstn) {
        this.map.unlisten(this.lstn)
    }
};

function ItemPane(b, a) {
    Pane.call(this, b._type);
    this.obj = b;
    this.href = a
}

ItemPane.prototype = inherit(Pane.prototype);
ItemPane.prototype.create = function (e) {
    this.setTitleFromObject(this.obj);
    this.nameType = this.obj._owner.getNameType(this.obj);
    if (this.nameType) {
        var g = this;
        this.nameLstn = function () {
            g.setTitleFromObject(g.obj, true)
        };
        ftype(this.nameType).listen(this.nameType, this.nameLstn)
    }
    var g = this;
    var f = this.obj._type;
    var c = false;
    var h = getSysProp(f, "set");
    var a = getSysProp(f, "remove");
    if (!isTablessContainer(f)) {
        if (!isROObj(this.obj) && !shouldHide(h)) {
            var d = this.addButton("OK", h);
            d.onclick = function (j) {
                if (isSkinEvent(j)) {
                    return true
                }
                if (isROObj(g.obj)) {
                    openContent(g.href);
                    return
                }
                if (g.ctrl.save()) {
                    g.obj._owner.unlisten(g.lstn);
                    g.lstn = null;
                    g.obj._owner.setObject(g.obj, function (k) {
                        if (k && !g.dead) {
                            openContent(g.href)
                        }
                    })
                }
            };
            if (skinMode) {
                new SkinCntrl(d, h, d.firstChild)
            }
            this.addButton("Cancel", getSysProp(f, "cancel"), this.href)
        } else {
            this.addButton("Close", getSysProp(f, "cancel"), this.href)
        }
        c = true
    }
    if (!isROObj(this.obj) && !shouldHide(h)) {
        var b = this.addButton("Apply", getSysProp(f, "apply"));
        b.onclick = function (j) {
            if (isSkinEvent(j)) {
                return true
            }
            if (g.ctrl.save()) {
                g.obj._owner.setObject(g.obj);
                g.ctrl.load()
            }
        };
        c = true
    }
    if (c) {
        this.addButton()
    }
    this.newObj = this.obj.ufe0001 == null && f.type == "map";
    if (!this.newObj && f.type == "map" && ((!f.nonaddable && !f.ro) || f.removable) && !shouldHide(a)) {
        this.remove = this.addButton("Remove", a);
        this.remove.onclick = function (j) {
            if (isSkinEvent(j)) {
                return true
            }
            g.obj._owner.removeObject(g.obj);
            openContent(g.href)
        };
        if (skinMode) {
            new SkinCntrl(this.remove, a, this.remove.firstChild)
        }
        this.addButton()
    }
    this.ctrl = new ViewController(getContainerProp(f));
    this.ctrl.addAllViews(this.obj);
    this.ctrl.create(tableList(e));
    this.lstn = function (j) {
        if (g.obj.ufe0001 == j.ufe0001) {
            if (j.ufe0013 == 1) {
                reopen()
            } else {
                if (g.newObj) {
                    openContent(g.obj._owner.getPath(g.obj), true)
                } else {
                    g.setTitleFromObject(g.obj)
                }
            }
        }
    };
    this.obj._owner.listen(this.lstn)
};
ItemPane.prototype.close = function () {
    this.ctrl.destroy();
    if (this.nameType) {
        ftype(this.nameType).unlisten(this.nameType, this.nameLstn)
    }
    if (this.lstn) {
        this.obj._owner.unlisten(this.lstn)
    }
    this.dead = true
};

function ActionPane(a, b) {
    Pane.call(this, a);
    this.action = getContainer(a);
    this.href = b
}

ActionPane.prototype = inherit(Pane.prototype);
ActionPane.prototype.create = function (b) {
    var d = this;
    this.setTitleFromObject(this.action.getObject());
    var f = this.addButton("Start", getSysProp(this.attrs, "start"));
    f.onclick = function (g) {
        if (isSkinEvent(g)) {
            return true
        }
        if (d.ctrl.save()) {
            d.ctrl.load();
            d.action.start()
        }
    };
    var a = this.addButton("Stop", getSysProp(this.attrs, "stop"));
    var e = false;
    a.onclick = function (g) {
        if (isSkinEvent(g)) {
            return true
        }
        e = true;
        d.action.stop()
    };
    this.addButton("Close", getSysProp(this.attrs, "cancel"), this.href);
    this.addButton();
    var c = tableList(b);
    this.ctrl = new ViewController(getContainerProp(this.attrs));
    this.ctrl.addAllViews(this.action.getRequest());
    this.ctrl.addAllViews(this.action.getReply());
    this.ctrl.create(c);
    this.lstn = function (g) {
        if (d.running != d.action.isRunning()) {
            d.running = !d.running;
            d.setTitleFromObject(d.action.getObject(), true);
            if (!d.running && e) {
                e = false;
                var h = document.getElementById("statusbar");
                if (h) {
                    replaceText(h.firstChild.firstChild.firstChild.firstChild, "stopped")
                }
            }
        }
    };
    this.action.listen(this.lstn, true)
};
ActionPane.prototype.close = function () {
    this.ctrl.destroy();
    this.action.unlisten(this.lstn, true)
};

function QueryPane(a, b) {
    Pane.call(this, a);
    this.query = getContainer(a);
    this.href = b
}

QueryPane.prototype = inherit(Pane.prototype);
QueryPane.prototype.create = function (d) {
    var f = this;
    this.setTitleFromObject(this.query.getObject());
    var h = this.addButton("Start", getSysProp(this.attrs, "start"));
    h.onclick = function (j) {
        if (isSkinEvent(j)) {
            return true
        }
        if (f.ctrl.save()) {
            f.ctrl.load();
            f.query.start()
        }
    };
    var c = this.addButton("Stop", getSysProp(this.attrs, "stop"));
    c.onclick = function (j) {
        if (isSkinEvent(j)) {
            return true
        }
        f.query.stop()
    };
    this.addButton("Close", getSysProp(this.attrs, "cancel"), this.href);
    this.addButton();
    var e = tableList(d);
    var a = this.query.getStatus();
    this.ctrl = new ViewController(getContainerProp(this.attrs));
    this.ctrl.addAllViews(this.query.getRequest());
    if (a) {
        this.ctrl.addAllViews(a)
    }
    this.ctrl.create(e);
    var b = el(el(el(e, "tbody"), "tr"), "td");
    b.colSpan = 20;
    b.className = "sep";
    el(b, "br");
    var g = this.query.getMap();
    this.table = new Table(d, g);
    this.lstn = function (j) {
        if (f.running != f.query.isRunning()) {
            f.running = !f.running;
            f.setTitleFromObject(f.query.getObject(), true)
        }
    };
    this.query.listen(this.lstn)
};
QueryPane.prototype.close = function () {
    this.ctrl.destroy();
    this.table.destroy();
    this.query.unlisten(this.lstn)
};

function DoitPane(b, c, a) {
    Pane.call(this, b);
    this.doit = c ? c : getContainer(b);
    this.href = a
}

DoitPane.prototype = inherit(Pane.prototype);
DoitPane.prototype.create = function (b) {
    this.setTitleFromObject(this.doit.getObject());
    var a = this.addButton(this.doit.getName(), getSysProp(this.attrs, "start"));
    var d = this;
    a.onclick = function (f) {
        if (isSkinEvent(f)) {
            return true
        }
        if (d.ctrl.save()) {
            d.ctrl.load();
            if (d.attrs.confirm && !confirm(d.attrs.confirm)) {
                return
            }
            if (d.attrs.progress) {
                d.status.innerHTML = d.attrs.progress
            }
            d.doit.doit(function (g) {
                if (g && !d.dead) {
                    openContent(d.href)
                }
            })
        }
    };
    this.addButton("Cancel", getSysProp(this.attrs, "cancel"), this.href);
    this.addButton();
    var c = tableList(b);
    this.ctrl = new ViewController(getContainerProp(this.attrs));
    this.ctrl.addAllViews(this.doit.getObject());
    this.ctrl.create(c);
    if (this.attrs.progress) {
        var e = document.getElementById("statusbar");
        this.status = el(e.firstChild.firstChild, "td", "\u00a0");
        this.status.style.minWidth = "100px"
    }
};
DoitPane.prototype.close = function () {
    this.dead = true;
    this.ctrl.destroy()
};

function SetupPane(b, a) {
    Pane.call(this, b);
    this.setup = getContainer(b);
    this.href = a
}

SetupPane.prototype = inherit(Pane.prototype);
SetupPane.prototype.create = function (c) {
    this.setTitleFromObject(this.setup.getObject());
    this.setup.reset();
    var f = this;
    var b = this.addButton("Back", getSysProp(this.attrs, "back"));
    b.onclick = function (h) {
        if (isSkinEvent(h)) {
            return true
        }
        f.setup.back()
    };
    var d = this.addButton("Next", getSysProp(this.attrs, "next"));
    d.onclick = function (h) {
        if (isSkinEvent(h)) {
            return true
        }
        if (f.ctrl.save()) {
            f.setup.next(!f.ctrl.isChanged())
        }
    };
    this.addButton("Cancel", getSysProp(this.attrs, "cancel"), this.href);
    var e = tableList(c);
    var g = document.getElementById("statusbar");
    var a = el(g.firstChild.firstChild, "td", "\u00a0");
    this.ctrl = new SetupController(getContainerProp(this.attrs));
    this.ctrl.addAllViews(this.setup.getObject());
    this.ctrl.createPanes();
    this.ctrl.create(e);
    this.lstn = function () {
        if (f.setup.isFinished()) {
            openContent(f.href);
            return
        }
        f.ctrl.load(f.setup.getObject());
        f.ctrl.show(f.setup.getCurrentPage() - 1);
        replaceText(a, f.setup.getCurrentDescription() || "\u00a0")
    };
    this.setup.listen(this.lstn)
};
SetupPane.prototype.close = function () {
    this.ctrl.destroy();
    this.setup.unlisten(this.lstn)
};

function Termopen(a) {
    this.obj = {};
    this.obj._type = a
}

Termopen.prototype.getObject = function () {
    return this.obj
};
Termopen.prototype.getPath = function () {
    return null
};
Termopen.prototype.doit = function () {
    var a = window.screenX + document.getElementById("menu").clientWidth;
    var c = window.screenY;
    var b = window.open("terminal.html" + this.getParams(), "Terminal", "width=250, height=250, left =" + a + ", top =" + c + ", toolbar=yes, scrollbars=yes");
    if (b) {
        b.focus()
    }
};
Termopen.prototype.autostart = function (a) {
    this.doit();
    return true
};
Termopen.prototype.getParams = function () {
    var b = {};
    b.u8 = this.obj.u1 || 0;
    if (this.obj.u2 != null) {
        b.s9 = ipaddr2string(this.obj.u2)
    } else {
        if (this.obj.a3 != null) {
            b.s9 = types.ip6addr.tostr({ifaceid: "u4"}, [this.obj.a3, this.obj.u4])
        } else {
            if (this.obj.u7 != null) {
                b.s9 = this.obj.u7.toString()
            } else {
                if (this.obj.r5 != null) {
                    b.s9 = types.macaddr.tostr({}, this.obj.r5)
                }
            }
        }
    }
    if (this.obj.s6 != null) {
        b.sa = this.obj.s6
    }
    var c = "?";
    for (var a in b) {
        if (c.length > 1) {
            c += "&"
        }
        c += a + "=";
        c += b[a]
    }
    return c
};
Termopen.prototype.listen = function (a) {
};
Termopen.prototype.unlisten = function (a) {
};

function TermopenPane(b, a) {
    Pane.call(this, b);
    this.term = getContainer(b);
    this.href = a
}

TermopenPane.prototype = inherit(Pane.prototype);
TermopenPane.prototype.create = function (c) {
    this.setTitle("Telnet");
    var b = this.getToolbar();
    var a = this.addButton("Telnet", getSysProp(this.attrs, "telnet"));
    var e = this;
    a.onclick = function (f) {
        if (isSkinEvent(f)) {
            return true
        }
        if (e.ctrl.save()) {
            e.term.doit();
            openContent(e.href)
        }
        return false
    };
    var d = tableList(c);
    this.ctrl = new ViewController(getContainerProp(this.attrs));
    this.ctrl.addAllViews(this.term.getObject());
    this.ctrl.create(d)
};
TermopenPane.prototype.close = function () {
    this.ctrl.destroy()
};

function lookupContainer(d) {
    if (!d[0]) {
        return null
    }
    for (var c in sysmap) {
        var e = 0;
        if (sysmap[c].group) {
            if (sysmap[c].group != d[0] || !d[1] || sysmap[c].name != d[1]) {
                continue
            }
            e = 2
        } else {
            if (sysmap[c].name != d[0]) {
                continue
            }
            e = 1
        }
        var b = sysmap[c];
        if (!isServiceVisible(b)) {
            continue
        }
        for (var c in b.c) {
            if (d[e] == b.c[c].title) {
                var a = b.c[c];
                if (a.pred && !isTrue(a.pred)) {
                    continue
                }
                d.splice(0, e + 1);
                return a
            }
        }
    }
    return null
}

function StatusPane(a) {
    this.attrs = a
}

StatusPane.prototype = inherit(Pane.prototype);
StatusPane.prototype.create = function (c) {
    function g(t, r, p) {
        for (var s in t.c) {
            var q = ftype(t.c[s]).lookup(t.c[s], p, r);
            if (q != null) {
                return q
            }
        }
        return null
    }

    var f = getContainerProp(this.attrs);
    this.setTitle("Status", getSysProp(this.attrs), "title");
    var m = tableList(c);
    var a = new ViewController(f, true);
    for (var e in f) {
        var l = f[e];
        if (typeof (l) != "object") {
            continue
        }
        if (l._hide) {
            continue
        }
        if (!l.alias) {
            continue
        }
        var o = l.alias.split(":");
        var h = lookupContainer(o);
        if (!h || !o[0]) {
            continue
        }
        var n = getContainer(h);
        var d;
        if (o[0].charAt(0) == "*") {
            d = n.acquireObject(o[0].substr(1));
            o.shift()
        } else {
            d = n.getObject()
        }
        var b = null;
        if (o[1]) {
            b = o.shift()
        }
        var k = g(h, o[0], b);
        if (!k) {
            continue
        }
        var j = ftype(k).view(k, true);
        a.listenOn(d);
        a.addView(d, null, null, j, k, l, true)
    }
    a.createGrid(f);
    a.create(m)
};

function normalize(a) {
    return a.replace(/[\s\.]/g, "_")
}

function getPath(c) {
    if (c.owner) {
        c = c.owner
    }
    var b = "";
    var a = c.service ? c.service : c;
    if (a.group) {
        b = a.group + ":"
    }
    b += a.nname;
    if (c.service) {
        b += "." + c.ntitle
    }
    return "#" + b
}

function getTopPath(b, f) {
    if (f) {
        return f
    }
    var e = null;
    var a = b.service;
    for (var d in a.c) {
        var g = a.c[d];
        if (isContainerVisible(g) && container[g.type].tab) {
            e = g
        }
        if (b == g) {
            break
        }
    }
    return e ? getPath(e) : getPath(sysmap[0])
}

function findDoit(b, e, c, f) {
    for (var d in e) {
        var a = e[d];
        if (a.type != "doit" || !a.c) {
            continue
        }
        if (normalize(a.name) == c) {
            var g = getContainer(b).getObject();
            a.title = a.name;
            a.path = b.path;
            a.container = b;
            var h = getContainer(a);
            if (g) {
                h.setID(g.ufe0001)
            }
            return new DoitPane(a, h, f)
        }
    }
    return null
}

function findContainer(k, g, a) {
    var j = 0;
    while (true) {
        var f = sysmap[j];
        var d = false;
        for (var e = j; e < sysmap.length; ++e) {
            if (!isServiceVisible(sysmap[e])) {
                continue
            }
            if (shouldHide(getServiceProp(sysmap[e]))) {
                continue
            }
            if (k && sysmap[e].group != k) {
                continue
            }
            if (sysmap[e].nname == g) {
                f = sysmap[e];
                d = true;
                break
            }
        }
        if (isServiceVisible(f) && !shouldHide(getServiceProp(f))) {
            var b = null;
            var l = null;
            for (var e in f.c) {
                var h = f.c[e];
                if (!isContainerVisible(h)) {
                    continue
                }
                if (shouldHide(getContainerProp(h))) {
                    if (!l && !b && container[h.type].tab) {
                        b = h
                    }
                    continue
                }
                if (d && a && h.ntitle == a) {
                    l = h;
                    break
                }
                if (!l) {
                    l = h
                } else {
                    if (l.hide && !h.hide) {
                        l = h
                    } else {
                        if (b) {
                            if (container[h.type].tab && !container[l.type].tab) {
                                l = h
                            }
                        }
                    }
                }
            }
            if (l != null) {
                return l
            }
        }
        if (d) {
            g = {}
        } else {
            ++j
        }
    }
}

function queryString() {
    var b = [];
    var c = location.search;
    var e = c.split("&");
    for (var a = 0; a < e.length; ++a) {
        var f = e[a].indexOf("=");
        if (f > 0) {
            var d = e[a].substring(f + 1);
            b.push(d)
        }
    }
    return b
}

var safeModeID = null;

function toggleSafeMode() {
    if (safeModeID != null) {
        if (safeModeID != 4294967295) {
            post({Uff0001: [17], uff0007: 524293, ufe0001: safeModeID})
        }
        safeModeID = null
    } else {
        safeModeID = 4294967295;
        post({Uff0001: [17], uff0007: 524291}, function (b) {
            var a = safeModeID == null;
            if (b.ufe0001 != null) {
                safeModeID = b.ufe0001
            }
            if (a) {
                toggleSafeMode()
            }
        })
    }
}

var container = {};
container.map = {};
container.map.tab = true;
container.map.create = function (a) {
    return new ObjectMap(a)
};
container.map.createPane = function (a, f, b) {
    var e = getContainer(a);
    if (a.inherit) {
        e = new FilteredMap(e, a)
    }
    if (f.length >= 1) {
        var d;
        if (f[0] == "new") {
            d = e.newObject(f[1])
        } else {
            d = e.getObject(f[0])
        }
        if (d) {
            return new ItemPane(d, getTopPath(a, b))
        } else {
            var c = findDoit(a, a.c, f[0], getTopPath(a, b));
            if (c) {
                return c
            }
        }
    }
    return new TablePane(a, e, f[0])
};
container.item = {};
container.item.create = function (a) {
    return new ObjectHolder(a)
};
container.item.createPane = function (a, e, c) {
    if (e[0]) {
        var d = findDoit(a, a.c, e[0], getTopPath(a, c));
        if (d) {
            return d
        }
    }
    var b = getContainer(a);
    return new ItemPane(b.getObject(), getTopPath(a, c))
};
container.action = {};
container.action.create = function (a) {
    return new ObjectAction(a)
};
container.action.createPane = function (a, d, b) {
    if (d[0]) {
        var c = findDoit(a, a.request, d[0], getTopPath(a, b));
        if (!c) {
            c = findDoit(a, a.reply, d[0], getTopPath(a, b))
        }
        if (c) {
            return c
        }
    }
    return new ActionPane(a, getTopPath(a, b))
};
container.query = {};
container.query.create = function (a) {
    return new ObjectQuery(a)
};
container.query.createPane = function (a, d, b) {
    if (d[0]) {
        var c = getContainer(a).getObject(d[0]);
        if (c) {
            return new ItemPane(c, getTopPath(a, b))
        }
    }
    return new QueryPane(a, getTopPath(a, b))
};
container.doit = {};
container.doit.create = function (a) {
    return new Doit(a)
};
container.doit.createPane = function (a, c, b) {
    if (a.c == null) {
        if (!a.confirm || confirm(a.confirm)) {
            var d = new Doit(a);
            d.doit()
        }
        return openContent(getTopPath(a, b))
    }
    return new DoitPane(a, null, getTopPath(a, b))
};
container.setup = {};
container.setup.create = function (a) {
    return new SetupManager(a)
};
container.setup.createPane = function (a, c, b) {
    return new SetupPane(a, getTopPath(a, b))
};
container.termopen = {};
container.termopen.create = function (a) {
    return new Termopen(a)
};
container.termopen.createPane = function (a, c, b) {
    return new TermopenPane(a, getTopPath(a, b))
};
container.alias = {};
container.alias.createPane = function (b) {
    var a = findContainer(b.group, normalize(b.open), normalize(b.tab));
    if (!a) {
        return null
    }
    var e = getContainer(a);
    var d = e.getObject();
    convert(b.link, {}, d);
    e.autostart(d);
    return null
};
container.status = {};
container.status.createPane = function (a) {
    return new StatusPane(a)
};

function updateContent(b) {
    var k = b.substr(1).split(".");
    var h = k[0].split(":");
    var j = h.length == 1 ? null : h[0];
    var c = h.length == 1 ? h[0] : h[1];
    var l = findContainer(j, c, k[1]);
    if (!l) {
        return false
    }
    if (k.length >= 2 && (c != l.service.nname || k[1] != l.ntitle)) {
        k = []
    }
    var d = container[l.type].createPane(l, k.slice(2), prevURLs[prevURLs.length - 1]);
    if (!d) {
        return false
    }
    var f = current;
    current = d;
    window.scrollTo(0, 0);
    clearNodes(document.getElementById("content"));
    current.open(l);
    highlightMenuItem(l);
    try {
        if (f) {
            f.close()
        }
    } catch (g) {
        this
    }
    return true
}

function reopen() {
    if (!updateContent(currentURL)) {
        openContent("", true)
    }
}

function generateContent(a, b) {
    if (!sysmap) {
        return
    }
    if (currentURL == a) {
        return
    }
    if (!b) {
        if (prevURLs[prevURLs.length - 1] != a) {
            prevURLs.push(currentURL);
            if (prevURLs.length > 100) {
                prevURLs.splice(0, 1)
            }
        } else {
            prevURLs.pop()
        }
    }
    var c = currentURL;
    currentURL = a;
    if (!updateContent(a)) {
        currentURL = c;
        if (current != null) {
            location.hash = currentURL
        } else {
            if (a != "") {
                updateContent("");
                currentURL = "";
                location.hash = ""
            }
        }
    }
}

function openContent(a, b) {
    location.hash = a;
    generateContent(a, b)
}

function onFileOpen(b) {
    var a = document.getElementById("iframe").contentWindow.document;
    if (window.XMLHttpRequest) {
        a.open("text/html", "replace")
    } else {
        a.open("javascript:'<html></html>'")
    }
    a.write("<body onload=\"parent.generateContent('" + b + "');\">");
    a.close()
}

function createSkinToolbar(b) {
    function e(l) {
        var k = l.options[l.selectedIndex];
        return k ? k.text : ""
    }

    var d = document.getElementById("skintb");
    if (d) {
        return d
    }
    d = elc(document.getElementById("top"), "ul", "toolbar");
    d.id = "skintb";
    d.style.display = "none";
    var j = elc(d, "li", "custom");
    txt(j, "Skin: ");
    var c = el(elc(j, "span", "select"), "select");
    c.size = 1;
    fillOptions(c, {type: "dynamic", path: [13, 8]}, true, null, null, null, function (l, k) {
        if (l == 0) {
            c.selectedIndex = k
        }
    });
    createButton(d);
    j = elc(d, "li", "custom");
    txt(j, "Name: ");
    var a = input(null);
    a.value = "default";
    j.appendChild(a);
    var g = createButton(d, "Save");
    g.onclick = function () {
        var k = a.value;
        if (k == "") {
            k = e(c)
        }
        k = k.replace("///g/", "");
        if (k == "" || k == null) {
            k = "default"
        }
        a.value = k;
        saveSkin(k)
    };
    var h = createButton(d, "Revert");
    h.onclick = function () {
        var k = e(c);
        a.value = k;
        loadSkin(k)
    };
    createButton(d);
    var f = createButton(d, "Reset");
    f.onclick = function () {
        skin = {};
        reopen()
    };
    c.onchange = function () {
        if (skinMode) {
            var k = e(c);
            a.value = k;
            loadSkin(k)
        }
    };
    return d
}

function openGroup(c) {
    var a = document.getElementById(c);
    var b = document.getElementById(c + "list");
    if (a.className == "activegroup") {
        a.className = "group";
        b.className = "group"
    } else {
        a.className = "activegroup";
        b.className = "activegroup"
    }
}

var lastItem;

function highlightMenuItem(a) {
    if (lastItem) {
        removeClass(lastItem, "opened")
    }
    var c = "id_" + getPath(a).substr(1).split(".")[0];
    var b = document.getElementById(c);
    if (b) {
        addClass(b, "opened")
    }
    lastItem = b
}

function generateGroupLists(f, e, a) {
    for (var b in f) {
        var c = f[b];
        if (!c.name || !isServiceVisible(c) || c.nonpublic) {
            continue
        }
        if (c.group) {
            if (!a[c.group]) {
                a[c.group] = [];
                e.push({name: c.group, prio: c.prio, group: true})
            }
            a[c.group].push(c)
        } else {
            c.order = b;
            e.push(c)
        }
    }
    for (var b in a) {
        var d = a[b];
        d.sort(function (h, g) {
            if (h.name < g.name) {
                return -1
            }
            if (h.name > g.name) {
                return 1
            }
            return 0
        })
    }
    e.sort(function (h, g) {
        if (h.prio == null) {
            if (g.prio != null) {
                if (g.prio < 500) {
                    return 1
                }
                if (g.prio > 500) {
                    return -1
                }
            }
        } else {
            if (g.prio == null) {
                if (h.prio != null) {
                    if (h.prio < 500) {
                        return -1
                    }
                    if (h.prio > 500) {
                        return 1
                    }
                }
            } else {
                if (h.prio < g.prio) {
                    return -1
                }
                if (h.prio > g.prio) {
                    return 1
                }
            }
        }
        if (h.order < g.order) {
            return -1
        }
        if (h.order > g.order) {
            return 1
        }
        return 0
    })
}

function createMenuItem(g, e, b, c) {
    var a = el(null, "li");
    var f = el(a, "a");
    f.draggable = 0;
    f.ondragstart = function () {
        return false
    };
    f.id = "id_" + c.substr(1).split(".")[0];
    f.href = c;
    var d = viewLabel(b, e);
    f.appendChild(d);
    if (skinMode) {
        new SkinCntrl(f, b, d)
    } else {
        if (b._hide) {
            a.style.display = "none"
        }
    }
    g.appendChild(a);
    return a
}

function generateMenu() {
    var w = [];
    var y = {};
    generateGroupLists(sysmap, w, y);
    var a = document.getElementById("menu");
    clearNodes(a);
    for (var s in w) {
        if (w[s].group) {
            var B = w[s].name;
            var f = getProp(skin, B);
            var x = createMenuItem(a, B, f, 'javascript:openGroup("' + B + '")');
            if (!x) {
                continue
            }
            x.id = B;
            x.className = "group";
            var m = el(a, "ul");
            m.id = B + "list";
            m.className = "group";
            var t = y[B];
            for (var r in t) {
                createMenuItem(m, t[r].name, getProp(f, t[r].name), getPath(t[r]))
            }
            continue
        }
        createMenuItem(a, w[s].name, getProp(skin, w[s].name), getPath(w[s]))
    }
    elc(a, "li", "sep");
    var z = createMenuItem(a, "Undo", getProp(skin, "Undo"), "#Undo");
    z.firstChild.onclick = function () {
        post({Uff0001: [17], Uff0002: [1], uff0007: 524289});
        return false
    };
    var o = createMenuItem(a, "Redo", getProp(skin, "Redo"), "#Redo");
    o.firstChild.onclick = function () {
        post({Uff0001: [17], Uff0002: [1], uff0007: 524290});
        return false
    };
    elc(a, "li", "sep");
    var p = document.getElementById("showmenu");
    if (!p) {
        var k = elc(document.getElementById("top"), "ul", "toolbar");
        p = createButton(k, "Show Menu");
        p.parentNode.style.display = "none";
        p.onclick = function () {
            A.parentNode.style.display = "list-item";
            p.parentNode.style.display = "none";
            document.getElementById("menu").style.display = "block"
        };
        elc(k, "li", "ending")
    }
    var A = createMenuItem(a, "Hide Menu", getProp(skin, "Hide Menu"), "#HideMenu");
    A.firstChild.onclick = function () {
        p.parentNode.style.display = "list-item";
        document.getElementById("menu").style.display = "none"
    };
    if (sysres.policy & (1 << 14)) {
        var c = getPrefs();
        hidePasswords = c.b1 != null ? c.b1 : 1;
        var l = createMenuItem(a, "Hide Passwords", getProp(skin, "Hide Passwords"), "#HidePwd");
        l.firstChild.onclick = function () {
            hidePasswords = !hidePasswords;
            toggleClass(l.firstChild, "active");
            c.b1 = hidePasswords ? 1 : 0;
            setPrefs(c);
            hidePasswordsLstn.notify();
            return false
        };
        if (hidePasswords) {
            addClass(l.firstChild, "active")
        }
    } else {
        hidePasswords = 1
    }
    var q = createMenuItem(a, "Safe Mode", getProp(skin, "Safe Mode"), "#Safemode");
    q.firstChild.onclick = function () {
        toggleClass(q.firstChild, "active");
        toggleSafeMode();
        return false
    };
    if (safeModeID != null) {
        addClass(q.firstChild, "active")
    }
    if ((sysres.policy & (1 << 8)) && (sysres.policy & (1 << 14))) {
        var v = createSkinToolbar(a);
        var n = el(el(a, "li"), "a");
        n.draggable = 0;
        n.ondragstart = function () {
            return false
        };
        el(n, "span", "Design Skin");
        n.onclick = function () {
            var g = skinMode == null;
            skinMode = !skinMode;
            v.style.display = skinMode ? "block" : "none";
            if (g) {
                loadSkin("default")
            } else {
                generateMenu();
                reopen()
            }
            return true
        };
        if (skinMode) {
            addClass(n, "active")
        }
    }
    elc(a, "li", "sep");
    var b = sysres.manualURL;
    if (b != "disabled") {
        if (b == "") {
            b = "http://wiki.mikrotik.com/wiki/Category:Manual"
        }
        var x = createMenuItem(a, "Manual", getProp(skin, "Manual"), b);
        x.lastChild.target = "manual"
    }
    var d = createMenuItem(a, "WinBox", getProp(skin, "WinBox"), "/winbox/winbox.exe");
    d.lastChild.target = "winbox";
    var e = createMenuItem(a, "Graphs", getProp(skin, "Graphs"), "/graphs");
    e.lastChild.target = "graphs";
    var h = createMenuItem(a, "End-User License", getProp(skin, "License"), "/help/license.html");
    h.lastChild.target = "license";
    elc(a, "li", "sep");
    var u = createMenuItem(a, "Logout", getProp(skin, "Logout"), "#Logout");
    u.firstChild.onclick = function () {
        post({uff0007: 16646164}, function (g) {
            window.name = "noautologin=1";
            if (!autonomous) {
                window.location.replace("/" + window.location.hash)
            } else {
                window.location.reload()
            }
        });
        return false
    }
}

function sortSlots(e, b) {
    var h = null;
    var j = {slots: []};
    var f = [j];
    var a = function (g) {
        for (var m in f) {
            if (f[m].tab && f[m].tab.name == g) {
                return f[m]
            }
        }
        return null
    };
    for (var c in e) {
        var l = e[c];
        if (l.type == "tab") {
            j = {tab: l, slots: []};
            if (l.combine) {
                var k = a(l.name);
                if (k) {
                    j = k;
                    continue
                }
            }
            f.push(j);
            continue
        }
        if (l.type == "gridcell") {
            j = {tab: l, slots: [l]};
            f.push(j);
            continue
        }
        if (l.type == "object") {
            l.c = sortSlots(l.c, b)
        }
        if (l.type == "filter") {
            b.filter = l
        }
        if (!l.name) {
            l.name = ftype(l).name;
            l.secondname = ftype(l).secondname
        }
        if (!ftype(l).outside) {
            if (l.type == "graphbox") {
                for (var d in l.graphs) {
                    l.graphs[d].owner = j.tab
                }
            }
            l.owner = j.tab
        }
        j.slots.push(l)
    }
    if (f.length == 1) {
        return j.slots
    }
    f.sort(function (m, g) {
        if (!m.tab) {
            return -1
        }
        if (!g.tab) {
            return 1
        }
        if ((m.tab.priority || 0) < (g.tab.priority || 0)) {
            return -1
        }
        if ((m.tab.priority || 0) > (g.tab.priority || 0)) {
            return 1
        }
        return 0
    });
    e = [];
    for (var c in f) {
        if (f[c].tab && f[c].slots.length == 0) {
            continue
        }
        e = e.concat(f[c].slots)
    }
    return e
}

function handleOverrides(b) {
    var d = function (f, e) {
        for (var g = 0; g < e; ++g) {
            if (b[g].name == f) {
                return g
            }
        }
        return null
    };
    for (var a = 0; a < b.length;) {
        if (b[a].override) {
            var c = d(b[a].name, a);
            if (c) {
                if (!b[a].on && b[c].on) {
                    b[a].on = b[c].on
                }
                b[c] = b[a];
                b.splice(a, 1);
                continue
            }
        }
        ++a
    }
}

function splitColumns(b) {
    var a = 0;
    while (a < b.length) {
        if (b[a].type == "tuple" && b[a].separate) {
            b = b.slice(0, a).concat(b[a].c, b.slice(a + 1));
            continue
        }
        ++a
    }
    return b
}

function generateMetaInfo(e) {
    var d = {name: "Status", c: [], prio: 20, pred: {type: "statuspane"}};
    d.c.push({title: "Status", type: "status", service: g});
    var h = 0;
    while (e[h].name == "Quick Set") {
        ++h
    }
    e.splice(h, 0, d);
    for (var f in e) {
        var g = e[f];
        if (g.name) {
            g.nname = normalize(g.name)
        }
        for (var c in g.c) {
            var k = g.c[c];
            k.service = g;
            if (k.title) {
                k.ntitle = normalize(k.title)
            }
            if (k.nameval && !mapAttrs[k.path]) {
                mapAttrs[k.path] = k
            }
            k.columns = k.c ? splitColumns(k.c) : [];
            if (k.generic) {
                generics[k.generic] = k;
                k.subtypes = {};
                k.gensubtypes = []
            }
            if (k.inherit) {
                var a = generics[k.inherit];
                if (a) {
                    if (k.typevalue != 4294967295) {
                        a.subtypes[k.typevalue] = k
                    } else {
                        a.gensubtypes.push(k)
                    }
                    if (a.origc) {
                        k.c = a.origc.concat(k.c || [])
                    } else {
                        if (a.c) {
                            k.c = a.c.concat(k.c || [])
                        }
                    }
                    if (a.columns) {
                        k.columns = a.columns.concat(k.columns)
                    }
                    if (k.c) {
                        handleOverrides(k.c)
                    }
                    if (k.columns) {
                        handleOverrides(k.columns)
                    }
                    if (!k.name) {
                        k.name = a.name
                    }
                    if (!k.nameval) {
                        k.nameval = a.nameval
                    }
                    if (!k.path) {
                        k.path = a.path
                    }
                    if (!k.treeon) {
                        k.treeon = a.treeon
                    }
                }
                k.inherit = a
            }
            if (k.c) {
                k.origc = k.c;
                k.c = sortSlots(k.origc, k)
            }
            if (k.request) {
                k.request = sortSlots(k.request, k)
            }
            if (k.typeon) {
                var b = getAttr(k, k.typeon);
                if (b) {
                    k.typeon = b
                }
            }
        }
    }
}

function loadGUM(maps, gums, idx) {
    for (var i in gums) {
        addons[gums[i].slice(0, gums[i].length - 3)] = true
    }
    request("GET", "/webfig/" + gums[idx], null, function (resp) {
        var c = eval("(" + resp + ")");
        maps = maps ? maps.concat(c) : c;
        if (gums.length == idx + 1) {
            sysmap = maps;
            setTimeout(function () {
                if (relogin) {
                    initSession()
                } else {
                    autoLogin()
                }
            }, 10)
        } else {
            loadGUM(maps, gums, idx + 1)
        }
    })
}

function initWebfig() {
    request("GET", "/webfig/list", null, function (resp) {
        var gums = eval("([" + resp + "])");
        for (var i = 0; i < gums.length; ++i) {
            if (gums[i] == "roteros.jg") {
                gums.splice(i, 1);
                break
            }
        }
        gums.splice(0, 0, "roteros.jg");
        if (!gums[gums.length - 1]) {
            gums.splice(gums.length - 1, 1)
        }
        loadGUM(null, gums, 0)
    })
}

function start() {
    generateMetaInfo(sysmap);
    loadSkin(sysres.skin, function () {
        generateMenu();
        hide("login");
        hide("startup");
        show("page");
        if (window.XMLHttpRequest || window.ActiveXObject) {
            urlCheker = setInterval(function () {
                if (currentURL != location.hash) {
                    onFileOpen(location.hash)
                }
            }, 200)
        }
        generateContent(location.hash)
    })
}

function fetchBoardInfo() {
    var a = {Uff0001: [24, 2], Uff0002: [44], uff0007: 16646157};
    post(a, function (e) {
        if (e) {
            sysres.uptime = e.u1;
            sysres.uptimediff = sysres.uptime - getNow();
            sysres.version = e.s16;
            sysres.arch = e.s1a || "i386";
            if (sysres.arch == "x86") {
                sysres.arch = "i386"
            }
            var d = e.s19;
            sysres.boardname = d;
            if (isNaN(d.slice(2, 3))) {
                sysres.board = d
            } else {
                var c = 3;
                while (d[c] && !isNaN(d[c])) {
                    ++c
                }
                if (c == 5) {
                    sysres.board = d.slice(0, 3) + "00"
                } else {
                    sysres.board = d.slice(0, c)
                }
            }
        }
        if (sysres.version) {
            var b = document.getElementById("version");
            replaceText(b, "v" + sysres.version)
        }
        start()
    })
}

function initSession() {
    ticker = new Ticker();
    post({}, receive);
    for (var a in sysmap) {
        if (sysmap[a].name == "Identity") {
            var b = getContainer(sysmap[a].c[0]);
            b.listen(function (d) {
                var c = getAttr(d._type, "Identity");
                sysres.identity = ftype(c).get(c, d);
                setDocumentTitle()
            });
            break
        }
    }
    post({Uff0001: [13, 7], uff0007: 16646157, s1: sysres.user}, function (c) {
        if (c.M1) {
            prefs = c.M1
        }
        sysres.manualURL = c.s2 || "";
        fetchBoardInfo()
    })
}

function doAuth(c, d, b, a) {
    request("POST", "/jsproxy", "", function (e) {
        session = new Session(str2word(e, 0));
        var f = session.makeResponse(c, d, e);
        request("POST", "/jsproxy", f, function (g) {
            if (!session.decrypt(g, function (h) {
                sysres.user = c;
                sysres.password = d;
                sysres.policy = h.uff000b;
                sysres.skin = h.sfe0009;
                post({Uff0001: [120], uff0007: 5}, function (j) {
                    sysres.qscaps = j.u1 || 0;
                    b(null, a)
                })
            })) {
                b("Authentication failed: invalid username or password.", a)
            }
        }, function (g) {
            b(g, a)
        })
    })
}

function onLogin(c, a) {
    if (c == null) {
        hide("startup");
        var b = new Date();
        b.setTime(b.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = "username=" + sysres.user + "; expires=" + b.toGMTString() + "; path=/";
        if (relogin) {
            initWebfig()
        } else {
            initSession()
        }
    } else {
        if (!autonomous) {
            if (a) {
                window.name = "noautologin=1";
                window.location.replace("/" + window.location.hash)
            } else {
                window.name = "error=" + c;
                window.location.replace("/" + window.location.hash)
            }
        } else {
            hide("startup");
            show("login");
            if (!a) {
                replaceText(get("error"), c);
                show("error")
            }
            authenticate()
        }
    }
}

function onSessionError(a) {
    hide("page");
    relogin = true;
    onLogin(a, false)
}

function authenticate() {
    function a() {
        hide("error");
        document.onkeydown = null;
        var c = get("name").value;
        var g = get("password").value;
        if (relogin) {
            hide("login");
            show("startup")
        }
        doAuth(c, g, onLogin, false)
    }

    get("dologin").onclick = function (c) {
        a();
        return false
    };
    document.onkeydown = function (c) {
        c = c || event;
        if (c.keyCode == 13) {
            a();
            return false
        }
        return true
    };
    var f = null;
    var d = document.cookie.split(";");
    for (var b in d) {
        var e = trim(d[b]).split("=");
        if (e[0] == "username") {
            f = e[1];
            break
        }
    }
    if (f != null) {
        get("name").value = f;
        get("password").focus()
    } else {
        get("name").focus()
    }
}

function autoLogin() {
    var b = window.name.split("=");
    if ((b[0] == "login" || b[0] == "autologin") && b[1]) {
        var a = b[1].split("|");
        doAuth(a[0], a[1], onLogin, b[0] == "autologin")
    } else {
        autonomous = true;
        if (window.name != "noautologin=1" || true) {
            doAuth("admin", "", onLogin, true)
        } else {
            window.name = "";
            hide("startup");
            show("login");
            authenticate()
        }
    }
}

window.onload = initWebfig;
