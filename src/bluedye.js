/**
 * BlueDyeJS v2.0.0
 * by Yazid SLILA (@yokgs)
 * MIT License
 */
(function (r, e) { typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = e() : typeof define === 'function' && define.amd ? define(e) : (r.bluedye = e()); }(this, (function () {
    'use strict';
    var rgb = (r, g, b) => [r, g, b, 1],
        rgba = (r, g, b, a) => [r, g, b, a],
        Hex = a => ((a > 15 ? '' : '0') + Math.floor(a).toString(16)),
        fromHex = a => {
            if (a.length == 4) return parseInt(a[1] + a[1] + a[2] + a[2] + a[3] + a[3], 16);
            return parseInt(a.substr(1), 16);
        },
        correction = a => Math.max(0, Math.min(Math.round(a), 255)),
        alpha_correction = a => Math.max(0, Math.min(a, 1));
    var _dark = (a, b) => (1 - b / 100) * a,
        _light = (a, b) => (a + b / 100 * (255 - a));

    var bluedye = function (color) {
        return new localBlueDye.color(color);
    };
    let localBlueDye = bluedye.prototype = {
        color: function (color) {
            //default values
            var s = [0, 0, 0];
            if (typeof color == 'undefined') s[3] = 0;
            if (typeof color == "string") {
                if (/^#[0-1a-fA-F]+/.test(color)) {
                    color = fromHex(color);
                } else {
                    if (color in _private.colors) {
                        return bluedye(_private.colors[color]);
                    }
                    if (/^rgba*\([\d,\.\s]+\)/.test(color)) {
                        let rgb = (r, g, b) => [r, g, b, 1],
                            rgba = (r, g, b, a) => [r, g, b, a];
                        try { s = eval(color) } catch (_) { };
                    }
                }
            }
            if (typeof color == "number") {
                return bluedye.number(color)
            }
            if (typeof color == 'object' && color.length) {
                s = color;
                if (s.length === 1) return bluedye.grayscale(s[0]);
            }
            if (typeof color == 'boolean') s = color ? [255, 255, 255, 1] : [0, 0, 0, 1];
            this.RED = correction(s[0]);
            this.GREEN = correction(s[1]);
            this.BLUE = correction(s[2]);
            this.ALPHA = alpha_correction(typeof s[3] != 'number' ? 1 : s[3]);

            /* v2.0 */

            this.R = this.toArray();
            this.backup = [];

            this.tag = null;
            return this.save();
        },

        /* v2.0 */

        save: function () {
            this.backup.push({
                r: this.RED,
                g: this.GREEN,
                b: this.BLUE,
                a: this.ALPHA
            });
            return this;
        },
        undo: function () {
            this.backup.pop();
            var i = this.backup.pop();
            [this.RED, this.GREEN, this.BLUE, this.ALPHA] = [i.r, i.g, i.b, i.a];
            return this.save();
        },
        pin: function () {
            this.R = this.toArray();
            this.backup = [];
            return this.save();
        },
        reset: function () {
            [this.RED, this.GREEN, this.BLUE, this.ALPHA] = this.R;
            this.backup = [];
            return this.save();
        },

        red: function (red) {
            if (typeof red == 'number') this.RED = correction(red);
            return this.save();
        },
        green: function (green) {
            if (typeof green == 'number') this.GREEN = correction(green);
            return this.save();
        },
        blue: function (blue) {
            if (typeof blue == 'number') this.BLUE = correction(blue);
            return this.save();
        },
        alpha: function (alpha) {
            this.ALPHA = alpha_correction(alpha);
            return this.save();
        },
        rgb: function (r, g, b) {
            [this.RED, this.GREEN, this.BLUE] = [r, g, b].map(correction);
            return this.save();
        },
        rgba: function (r, g, b, a) {
            [this.RED, this.GREEN, this.BLUE] = [r, g, b].map(correction);
            this.ALPHA = alpha_correction(a);
            return this.save();
        },
        dark: function (level = 1) {
            level = Math.min(Math.max(level, 0), 100);
            [this.RED, this.GREEN, this.BLUE] = this.toArray().map(x => _dark(x, level));
            return this.save();
        },
        light: function (level = 1) {
            level = Math.min(Math.max(level, 0), 100);
            [this.RED, this.GREEN, this.BLUE] = this.toArray().map(x => _light(x, level));
            return this.save();
        },
        negative: function () {
            [this.RED, this.GREEN, this.BLUE] = this.toArray().map(x => (255 - x));
            return this.save();
        },
        redToBlue: function () {
            [this.BLUE, this.RED, this.GREEN] = this.toArray();
            return this.save();
        },
        blueToRed: function () {
            [this.GREEN, this.BLUE, this.RED] = this.toArray();
            return this.save();
        },
        gray: function () {
            let y = (this.RED + this.GREEN + this.BLUE) / 3;
            this.RED = this.GREEN = this.BLUE = y;
            return this.save();
        },
        grey: function () {
            return this.gray();
        },
        random: function () {
            this.RED = correction(Math.random() * 256);
            this.GREEN = correction(Math.random() * 256);
            this.BLUE = correction(Math.random() * 256);
            return this.save();
        },
        css: function () {
            if (this.ALPHA === 1) return `rgb(${correction(this.RED)},${correction(this.GREEN)},${correction(this.BLUE)})`;
            return `rgba(${correction(this.RED)},${correction(this.GREEN)},${correction(this.BLUE)},${alpha_correction(this.ALPHA)})`;
        },
        hex: function () {
            return `#${Hex(this.RED)}${Hex(this.GREEN)}${Hex(this.BLUE)}`;
        },
        number: function () {
            return ((this.RED * 256) + this.GREEN) * 256 + this.BLUE;
        },
        toArray: function () {
            return [this.RED, this.GREEN, this.BLUE, this.ALPHA];
        },
        setTag: function (tag) {
            if (this.tag) delete _private.tags[this.tag];
            _private.tags[tag] = this;
            this.tag = tag;
            return this;
        },
        name: function (name) {
            if (/[\w\-]+/.test(name)) {
                _private.colors[name] = this.css();
            }
            return this;
        }
    }
    localBlueDye.color.prototype = localBlueDye;
    bluedye.add = function (obj, overwrite) {
        for (let k in obj) {
            var t = ((k in bluedye) && overwrite) || !(k in bluedye);
            if (t) bluedye[k] = obj[k];
        }
        return bluedye;
    };
    let _private = {
        colors: {},
        tags: {}
    };
    bluedye.add({
        version: [2, 0, 0],
        alpha: false,
        getColor: function (tag) {
            return _private.tags[tag];
        },
        rgb: function (r, g, b) {
            return bluedye(`rgb(${r},${g},${b})`);
        },
        rgba: function (r, g, b, a) {
            return bluedye(`rgba(${r},${g},${b},${a})`);
        },
        number: function (n) {
            var s = [0, 0, 0];
            for (let i = 2; i >= 0; i--) {
                s[i] = Math.floor(n) % 256;
                n /= 256;
            }
            return bluedye(s);
        },
        colorName: function (name) {
            return bluedye(_private.colors[name]);
        },
        grayscale: function (a) {
            return bluedye.rgb(a, a, a);
        },
        random: function () {
            return bluedye().random();
        },
    }, true)
    return bluedye;
})));
